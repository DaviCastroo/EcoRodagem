"""
EcoRodagem AI Service — Microsserviço em Python (FastAPI) para Inteligência de Frota.

Atua na análise automatizada de telemetria de abastecimentos/recargas, cálculo de eficiência
energética (R$/km) e Copiloto Contextual (RAG sobre dados operacionais da frota) utilizando
Large Language Models (Google Gemini API) com fallback analítico determinístico.
"""

from __future__ import annotations

import json
import logging
import os
import re
import time
from typing import List, Literal, Optional, Tuple

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv(override=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ecorodagem-ai")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest").strip()
GEMINI_FALLBACK_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
]
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:8080,http://localhost:4200").split(",")
    if origin.strip()
]

app = FastAPI(
    title="EcoRodagem AI Microservice",
    description=(
        "Microsserviço de Inteligência Artificial (FastAPI + LLM) integrado ao ecossistema "
        "EcoRodagem (Spring Boot + Angular) para diagnóstico de eficiência energética e "
        "Copiloto Contextual de frota."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


def limpar_markdown_inline(texto: str) -> str:
    """Remove marcações de asteriscos Markdown (**texto**) para exibição limpa em texto puro."""
    return re.sub(r"\*\*([^*]+)\*\*", r"\1", texto).strip()


# ============================================================================
# Contratos de Entrada (Telemetria consolidada enviada pelo Spring Boot)
# ============================================================================

class VeiculoTelemetriaDTO(BaseModel):
    veiculoId: int
    apelido: str
    placa: str
    categoria: str
    propulsao: str
    mediaConsumo: float
    unidadeConsumo: str
    custoMedioPorKm: float


class PostoTelemetriaDTO(BaseModel):
    locPosto: str
    totalAbastecimentos: int
    precoMedioLitro: float
    totalGasto: float


class GastoMensalTelemetriaDTO(BaseModel):
    anoMes: str
    valorTotal: float


class FrotaContextoDTO(BaseModel):
    totalVeiculos: int = 0
    totalAbastecimentos: int = 0
    gastoTotalMesAtual: float = 0.0
    consumoMedioFrotaKmPorLitro: float = 0.0
    custoMedioFrotaPorKm: float = 0.0
    veiculos: List[VeiculoTelemetriaDTO] = Field(default_factory=list)
    postos: List[PostoTelemetriaDTO] = Field(default_factory=list)
    gastosPorMes: List[GastoMensalTelemetriaDTO] = Field(default_factory=list)


class AiChatRequestDTO(BaseModel):
    pergunta: str = Field(..., min_length=3, max_length=600)
    contexto: FrotaContextoDTO


# ============================================================================
# Contratos de Saída (Diagnóstico Estruturado e Resposta do Copiloto)
# ============================================================================

class DestaqueVeiculoDTO(BaseModel):
    apelido: str
    placa: str
    propulsao: str
    custoPorKm: float
    mediaConsumo: float
    unidadeConsumo: str
    observacao: str


class RecomendacaoIaDTO(BaseModel):
    titulo: str
    descricao: str
    impacto: Literal["ALTO", "MEDIO", "BAIXO"]
    categoria: Literal["ELETRIFICACAO", "COMBUSTIVEL", "POSTO", "FROTA"]


class AiDiagnosticsResponseDTO(BaseModel):
    resumoExecutivo: str
    economiaEstimadaMensal: float
    percentualOtimizacaoPotencial: float
    veiculoMaisEficiente: Optional[DestaqueVeiculoDTO] = None
    pontoAtencao: Optional[DestaqueVeiculoDTO] = None
    recomendacoes: List[RecomendacaoIaDTO]
    fonteIa: str
    latenciaMs: int


class AiChatResponseDTO(BaseModel):
    pergunta: str
    resposta: str
    sugestoesFollowUp: List[str]
    fonteIa: str
    latenciaMs: int


# ============================================================================
# Integração com LLM (Google Gemini API via HTTPX — Header x-goog-api-key)
# ============================================================================

async def chamar_gemini_llm(
    system_prompt: str, user_prompt: str, json_mode: bool = False
) -> Tuple[Optional[str], Optional[str]]:
    """
    Realiza chamada assíncrona à API REST do Google Gemini enviando a credencial
    via header HTTP 'x-goog-api-key' (evita exposição da chave em logs de URL).
    Possui cadeia automática de fallback de modelos caso o modelo principal retorne 404/503/429.
    """
    if not GEMINI_API_KEY:
        return None, None

    modelos_para_tentar: List[str] = []
    for modelo in [GEMINI_MODEL, *GEMINI_FALLBACK_MODELS]:
        if modelo and modelo not in modelos_para_tentar:
            modelos_para_tentar.append(modelo)

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
    }
    generation_config: dict = {"temperature": 0.25, "maxOutputTokens": 1200}
    if json_mode:
        generation_config["responseMimeType"] = "application/json"

    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": generation_config,
    }

    async with httpx.AsyncClient(timeout=12.0) as client:
        for modelo in modelos_para_tentar:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent"
            try:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code != 200:
                    logger.warning(
                        "Gemini modelo '%s' retornou HTTP %s. Tentando próximo modelo...",
                        modelo,
                        resp.status_code,
                    )
                    continue

                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    # Ignora partes de raciocínio interno (thought=True) presentes em modelos Gemini 3.x
                    textos = [
                        p["text"]
                        for p in parts
                        if isinstance(p, dict) and "text" in p and not p.get("thought", False)
                    ]
                    if textos:
                        logger.info("Resposta gerada com sucesso via Gemini (%s)", modelo)
                        return "\n".join(textos), modelo
            except Exception as exc:
                logger.warning("Erro ao consultar Gemini '%s': %s", modelo, exc)

    return None, None


# ============================================================================
# Motor Analítico Determinístico (Fallback e Grounding de Métricas)
# ============================================================================

def construir_diagnostico_analitico(ctx: FrotaContextoDTO, latencia_ms: int, fonte: str) -> AiDiagnosticsResponseDTO:
    veiculos_ativos = [v for v in ctx.veiculos if v.custoMedioPorKm > 0]
    veiculos_ordenados = sorted(veiculos_ativos, key=lambda x: x.custoMedioPorKm)

    mais_eficiente: Optional[DestaqueVeiculoDTO] = None
    ponto_atencao: Optional[DestaqueVeiculoDTO] = None

    if veiculos_ordenados:
        best = veiculos_ordenados[0]
        mais_eficiente = DestaqueVeiculoDTO(
            apelido=best.apelido,
            placa=best.placa,
            propulsao=best.propulsao,
            custoPorKm=round(best.custoMedioPorKm, 3),
            mediaConsumo=round(best.mediaConsumo, 2),
            unidadeConsumo=best.unidadeConsumo,
            observacao=(
                f"Menor custo operacional da frota (R$ {best.custoMedioPorKm:.3f}/km) "
                f"com rendimento de {best.mediaConsumo:.2f} {best.unidadeConsumo}."
            ),
        )

        worst = veiculos_ordenados[-1]
        ponto_atencao = DestaqueVeiculoDTO(
            apelido=worst.apelido,
            placa=worst.placa,
            propulsao=worst.propulsao,
            custoPorKm=round(worst.custoMedioPorKm, 3),
            mediaConsumo=round(worst.mediaConsumo, 2),
            unidadeConsumo=worst.unidadeConsumo,
            observacao=(
                f"Maior desembolso por km (R$ {worst.custoMedioPorKm:.3f}/km). "
                "Recomenda-se priorizar rotas otimizadas e abastecimento nos postos líderes do ranking."
            ),
        )

    gasto_base = ctx.gastoTotalMesAtual
    if gasto_base <= 0 and ctx.gastosPorMes:
        gasto_base = sum(g.valorTotal for g in ctx.gastosPorMes) / len(ctx.gastosPorMes)

    percentual_otimizacao = 14.5 if len(veiculos_ordenados) >= 3 else 8.0
    economia_estimada = round(gasto_base * (percentual_otimizacao / 100.0), 2)

    recomendacoes: List[RecomendacaoIaDTO] = []

    # 1. Comparação Elétrico / Híbrido vs Combustão (foco em logística urbana / delivery)
    eletricos = [v for v in veiculos_ordenados if "ELETRICO" in v.propulsao or "HIBRIDO" in v.propulsao]
    combustao = [v for v in veiculos_ordenados if v.propulsao in ("COMBUSTAO", "FLEX")]
    if eletricos and combustao:
        melhor_ev = eletricos[0]
        media_comb = sum(v.custoMedioPorKm for v in combustao) / len(combustao)
        reducao_pct = max(round((1 - (melhor_ev.custoMedioPorKm / media_comb)) * 100, 1), 15.0)
        recomendacoes.append(
            RecomendacaoIaDTO(
                titulo="Priorização de Veículos Elétricos e Híbridos em Rotas Urbanas",
                descricao=(
                    f"O veículo {melhor_ev.apelido} ({melhor_ev.placa}) opera a R$ {melhor_ev.custoMedioPorKm:.3f}/km, "
                    f"representando uma redução de {reducao_pct}% no custo por quilômetro frente à média dos veículos a combustão "
                    f"(R$ {media_comb:.3f}/km). Priorize-o em entregas de alta frequência."
                ),
                impacto="ALTO",
                categoria="ELETRIFICACAO",
            )
        )

    # 2. Análise de Postos e Eletropostos
    if len(ctx.postos) >= 2:
        postos_ord = sorted(ctx.postos, key=lambda p: p.precoMedioLitro)
        melhor_posto = postos_ord[0]
        pior_posto = postos_ord[-1]
        recomendacoes.append(
            RecomendacaoIaDTO(
                titulo=f"Concentração de Recargas e Abastecimentos em {melhor_posto.locPosto}",
                descricao=(
                    f"O local '{melhor_posto.locPosto}' apresenta o menor preço unitário médio (R$ {melhor_posto.precoMedioLitro:.3f}), "
                    f"enquanto '{pior_posto.locPosto}' registra média de R$ {pior_posto.precoMedioLitro:.3f}. "
                    "Direcionar a frota para os top 2 postos reduz imediatamente o custo variável."
                ),
                impacto="ALTO",
                categoria="POSTO",
            )
        )

    # 3. Paridade Flex / GNV
    gnv_flex = [v for v in veiculos_ordenados if v.propulsao in ("FLEX", "BI_FUEL_GNV")]
    if gnv_flex:
        v_ref = gnv_flex[0]
        recomendacoes.append(
            RecomendacaoIaDTO(
                titulo="Otimização da Matriz Flex / GNV por Custo Efetivo (R$/km)",
                descricao=(
                    f"Nos veículos multimistura como {v_ref.apelido} ({v_ref.placa}), mantenha o etanol apenas quando "
                    "o preço do litro for inferior a 70% da gasolina ou priorize o cilindro GNV em rodagem contínua."
                ),
                impacto="MEDIO",
                categoria="COMBUSTIVEL",
            )
        )

    # 4. Gestão Preventiva de Pesados
    pesados = [v for v in veiculos_ordenados if v.categoria in ("CAMINHAO", "UTILITARIO")]
    if pesados:
        p_ref = pesados[-1]
        recomendacoes.append(
            RecomendacaoIaDTO(
                titulo=f"Monitoramento de Telemetria de Carga ({p_ref.apelido})",
                descricao=(
                    f"Utilitários e pesados respondem pela maior fatia do desembolso por km (R$ {p_ref.custoMedioPorKm:.3f}/km "
                    f"em {p_ref.apelido}). Calibragem semanal e consolidação de cargas reduzem o consumo de diesel em até 9%."
                ),
                impacto="MEDIO",
                categoria="FROTA",
            )
        )

    resumo = (
        f"A frota conta com {ctx.totalVeiculos} veículos ativos e {ctx.totalAbastecimentos} registros auditados, "
        f"operando a um custo médio global de R$ {ctx.custoMedioFrotaPorKm:.3f}/km e rendimento médio de "
        f"{ctx.consumoMedioFrotaKmPorLitro:.2f} km/un. "
    )
    if mais_eficiente and ponto_atencao:
        resumo += (
            f"O destaque de eficiência é {mais_eficiente.apelido} (R$ {mais_eficiente.custoPorKm:.3f}/km), "
            f"enquanto {ponto_atencao.apelido} (R$ {ponto_atencao.custoPorKm:.3f}/km) concentra a maior oportunidade de economia."
        )

    return AiDiagnosticsResponseDTO(
        resumoExecutivo=resumo,
        economiaEstimadaMensal=economia_estimada,
        percentualOtimizacaoPotencial=percentual_otimizacao,
        veiculoMaisEficiente=mais_eficiente,
        pontoAtencao=ponto_atencao,
        recomendacoes=recomendacoes[:4],
        fonteIa=fonte,
        latenciaMs=latencia_ms,
    )


def responder_chat_analitico(pergunta: str, ctx: FrotaContextoDTO, latencia_ms: int, fonte: str) -> AiChatResponseDTO:
    q = pergunta.lower()
    veiculos_ativos = sorted(
        [v for v in ctx.veiculos if v.custoMedioPorKm > 0],
        key=lambda x: x.custoMedioPorKm,
    )
    motos = [v for v in veiculos_ativos if v.categoria == "MOTO"]
    carros = [v for v in veiculos_ativos if v.categoria == "CARRO"]
    postos_ord = sorted(ctx.postos, key=lambda p: p.precoMedioLitro)

    if any(k in q for k in ["moto", "delivery", "entrega", "duas rodas"]):
        if motos:
            melhor_moto = motos[0]
            listagem = ", ".join(
                f"{m.apelido} ({m.placa}: R$ {m.custoMedioPorKm:.3f}/km | {m.mediaConsumo:.2f} {m.unidadeConsumo})"
                for m in motos
            )
            resposta = (
                f"Para operações de delivery e deslocamento urbano, a moto mais eficiente da frota é "
                f"{melhor_moto.apelido} ({melhor_moto.placa}), com custo de apenas R$ {melhor_moto.custoMedioPorKm:.3f}/km "
                f"e rendimento de {melhor_moto.mediaConsumo:.2f} {melhor_moto.unidadeConsumo} ({melhor_moto.propulsao}). "
                f"Comparativo completo das motos cadastradas: {listagem}."
            )
        else:
            resposta = "Ainda não há motocicletas com histórico de abastecimento suficiente para comparar o R$/km."

    elif any(k in q for k in ["posto", "eletroposto", "barato", "onde abastecer", "preço"]):
        if postos_ord:
            top = postos_ord[0]
            ult = postos_ord[-1]
            resposta = (
                f"Com base no histórico da frota, o local mais econômico é {top.locPosto}, com preço médio unitário "
                f"de R$ {top.precoMedioLitro:.3f} ({top.totalAbastecimentos} registros, total de R$ {top.totalGasto:.2f}). "
                f"No extremo oposto está {ult.locPosto} (média de R$ {ult.precoMedioLitro:.3f}). "
                "Priorizar os 2 primeiros colocados do ranking reduz diretamente o R$/km."
            )
        else:
            resposta = "Não há postos suficientes registrados para gerar o comparativo de preço médio."

    elif any(k in q for k in ["elétrico", "eletrico", "híbrido", "hibrido", "etanol", "gasolina", "gnv", "combustível", "combustivel"]):
        if veiculos_ativos:
            top3 = "; ".join(
                f"{i+1}º {veiculos_ativos[i].apelido} ({veiculos_ativos[i].propulsao}) a R$ {veiculos_ativos[i].custoMedioPorKm:.3f}/km"
                for i in range(min(3, len(veiculos_ativos)))
            )
            resposta = (
                f"Comparando toda a matriz energética pela métrica universal de R$/km, a propulsão elétrica e híbrida "
                f"lidera a eficiência na frota atual ({top3}). Nos veículos Flex, recomenda-se o Etanol apenas quando o "
                "litro custar até 70% do valor da Gasolina; já o GNV mantém excelente competitividade em alta quilometragem diária."
            )
        else:
            resposta = "Registre abastecimentos em diferentes matrizes energéticas para destravar o comparativo de R$/km."

    elif any(k in q for k in ["gasto", "mês", "mes", "economia", "reduzir", "custo", "caro"]):
        pior = veiculos_ativos[-1] if veiculos_ativos else None
        melhor = veiculos_ativos[0] if veiculos_ativos else None
        detalhe_veic = (
            f"O menor custo atual é de {melhor.apelido} (R$ {melhor.custoMedioPorKm:.3f}/km) e o maior é de "
            f"{pior.apelido} (R$ {pior.custoMedioPorKm:.3f}/km)."
            if melhor and pior
            else ""
        )
        resposta = (
            f"O custo médio consolidado da frota está em R$ {ctx.custoMedioFrotaPorKm:.3f}/km, com desembolso no mês atual "
            f"de R$ {ctx.gastoTotalMesAtual:.2f}. {detalhe_veic} "
            "Para reduzir o gasto mensal em até 14,5%, realoque rotas urbanas para os veículos elétricos/GNV de menor R$/km "
            "e padronize os abastecimentos nos postos mais bem posicionados do ranking."
        )

    else:
        melhor_txt = (
            f"{veiculos_ativos[0].apelido} ({veiculos_ativos[0].placa}) com R$ {veiculos_ativos[0].custoMedioPorKm:.3f}/km"
            if veiculos_ativos
            else "N/A"
        )
        carro_txt = (
            f"Entre os carros de passeio, {carros[0].apelido} lidera com R$ {carros[0].custoMedioPorKm:.3f}/km."
            if carros
            else ""
        )
        resposta = (
            f"Analisando os {ctx.totalVeiculos} veículos e {ctx.totalAbastecimentos} registros da sua frota: "
            f"a média geral de custo é de R$ {ctx.custoMedioFrotaPorKm:.3f}/km (rendimento médio de "
            f"{ctx.consumoMedioFrotaKmPorLitro:.2f} km/un). O veículo mais econômico no geral é {melhor_txt}. {carro_txt}"
        )

    sugestoes = [
        "Qual moto de delivery tem o menor R$/km?",
        "Compensa mais rodar com veículo elétrico, GNV ou Flex na frota?",
        "Quais postos e eletropostos têm o menor preço médio?",
        "Como reduzir o gasto mensal da frota?",
    ]

    return AiChatResponseDTO(
        pergunta=pergunta,
        resposta=limpar_markdown_inline(resposta),
        sugestoesFollowUp=[s for s in sugestoes if s.lower() != pergunta.lower()][:3],
        fonteIa=fonte,
        latenciaMs=latencia_ms,
    )


# ============================================================================
# Endpoints REST do Microsserviço FastAPI
# ============================================================================

@app.get("/health", tags=["Health"])
async def healthcheck():
    return {
        "status": "UP",
        "service": "ecorodagem-ai-service",
        "llmConfigured": bool(GEMINI_API_KEY),
        "model": GEMINI_MODEL if GEMINI_API_KEY else "analytical-heuristic-engine-v1",
    }


@app.post("/api/v1/diagnostics", response_model=AiDiagnosticsResponseDTO, tags=["AI Fleet Intelligence"])
async def gerar_diagnostico_frota(ctx: FrotaContextoDTO):
    inicio = time.perf_counter()

    # Caso GEMINI_API_KEY esteja configurada, enriquece o resumo executivo via LLM mantendo os KPIs exatos
    base_diag = construir_diagnostico_analitico(ctx, latencia_ms=0, fonte="Análise local")

    if GEMINI_API_KEY and ctx.veiculos:
        system_prompt = (
            "Você é um Especialista em Eficiência de Frotas e Logística. "
            "Analise os dados reais da frota em JSON e retorne APENAS um objeto JSON válido com as chaves: "
            "'resumoExecutivo' (string concisa de 2 frases em português sem markdown com números exatos da frota) e "
            "'recomendacoes' (lista de 4 objetos com 'titulo', 'descricao', 'impacto' [ALTO|MEDIO|BAIXO] e "
            "'categoria' [ELETRIFICACAO|COMBUSTIVEL|POSTO|FROTA])."
        )
        user_prompt = f"Dados consolidados da frota EcoRodagem:\n{ctx.model_dump_json()}"
        resposta_llm, modelo_usado = await chamar_gemini_llm(system_prompt, user_prompt, json_mode=True)
        if resposta_llm:
            try:
                # Remove eventuais blocos ```json ... ``` caso o modelo envolva a resposta
                limpo = re.sub(r"^```(?:json)?\s*|\s*```$", "", resposta_llm.strip(), flags=re.IGNORECASE)
                parsed = json.loads(limpo)
                if isinstance(parsed.get("resumoExecutivo"), str) and parsed["resumoExecutivo"].strip():
                    base_diag.resumoExecutivo = limpar_markdown_inline(parsed["resumoExecutivo"])
                if isinstance(parsed.get("recomendacoes"), list) and len(parsed["recomendacoes"]) > 0:
                    recs_validas = []
                    for r in parsed["recomendacoes"][:4]:
                        if isinstance(r, dict):
                            r_norm = {
                                "titulo": limpar_markdown_inline(str(r.get("titulo", ""))),
                                "descricao": limpar_markdown_inline(str(r.get("descricao", ""))),
                                "impacto": str(r.get("impacto", "MEDIO")).upper(),
                                "categoria": str(r.get("categoria", "FROTA")).upper(),
                            }
                            if r_norm["impacto"] not in ("ALTO", "MEDIO", "BAIXO"):
                                r_norm["impacto"] = "MEDIO"
                            if r_norm["categoria"] not in ("ELETRIFICACAO", "COMBUSTIVEL", "POSTO", "FROTA"):
                                r_norm["categoria"] = "FROTA"
                            if r_norm["titulo"] and r_norm["descricao"]:
                                recs_validas.append(RecomendacaoIaDTO(**r_norm))
                    if recs_validas:
                        base_diag.recomendacoes = recs_validas
                base_diag.fonteIa = f"Gemini ({modelo_usado})"
            except Exception as exc:
                logger.warning("Falha ao interpretar JSON do Gemini em /diagnostics: %s", exc)

    base_diag.latenciaMs = max(int((time.perf_counter() - inicio) * 1000), 1)
    return base_diag


@app.post("/api/v1/chat", response_model=AiChatResponseDTO, tags=["AI Fleet Intelligence"])
async def conversar_sobre_frota(req: AiChatRequestDTO):
    inicio = time.perf_counter()

    if GEMINI_API_KEY:
        system_prompt = (
            "Você é o Assistente de Eficiência do EcoRodagem, especialista em consumo veicular, "
            "mobilidade elétrica, motos, utilitários, caminhões e gestão de frotas. "
            "Responda em português em texto puro (sem usar asteriscos ** de markdown), de forma clara, natural e direta "
            "(2 a 4 frases), citando os nomes, placas e valores de R$/km reais presentes no contexto JSON fornecido."
        )
        user_prompt = (
            f"Dados reais atuais da frota:\n{req.contexto.model_dump_json()}\n\n"
            f"Pergunta do usuário: {req.pergunta}"
        )
        texto_llm, modelo_usado = await chamar_gemini_llm(system_prompt, user_prompt, json_mode=False)
        if texto_llm:
            latencia = max(int((time.perf_counter() - inicio) * 1000), 1)
            fallback_sugestoes = responder_chat_analitico(req.pergunta, req.contexto, latencia, "").sugestoesFollowUp
            return AiChatResponseDTO(
                pergunta=req.pergunta,
                resposta=limpar_markdown_inline(texto_llm),
                sugestoesFollowUp=fallback_sugestoes,
                fonteIa=f"Gemini ({modelo_usado})",
                latenciaMs=latencia,
            )

    latencia = max(int((time.perf_counter() - inicio) * 1000), 1)
    return responder_chat_analitico(
        req.pergunta,
        req.contexto,
        latencia_ms=latencia,
        fonte="Análise local",
    )
