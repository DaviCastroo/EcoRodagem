from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

SAMPLE_CONTEXT = {
    "totalVeiculos": 3,
    "totalAbastecimentos": 12,
    "gastoTotalMesAtual": 1450.00,
    "consumoMedioFrotaKmPorLitro": 16.40,
    "custoMedioFrotaPorKm": 0.385,
    "veiculos": [
        {
            "veiculoId": 1,
            "apelido": "Voltz EVS Delivery",
            "placa": "MEV6J22",
            "categoria": "MOTO",
            "propulsao": "ELETRICO_BEV",
            "mediaConsumo": 28.5,
            "unidadeConsumo": "km/kWh",
            "custoMedioPorKm": 0.065,
        },
        {
            "veiculoId": 2,
            "apelido": "Fazer 250 Urbana",
            "placa": "MOT3F90",
            "categoria": "MOTO",
            "propulsao": "FLEX",
            "mediaConsumo": 31.2,
            "unidadeConsumo": "km/L",
            "custoMedioPorKm": 0.189,
        },
        {
            "veiculoId": 3,
            "apelido": "Hilux 4x4 Frota",
            "placa": "UTI5G77",
            "categoria": "UTILITARIO",
            "propulsao": "COMBUSTAO",
            "mediaConsumo": 9.8,
            "unidadeConsumo": "km/L",
            "custoMedioPorKm": 0.625,
        },
    ],
    "postos": [
        {
            "locPosto": "Eletroposto Shopping Sul",
            "totalAbastecimentos": 4,
            "precoMedioLitro": 1.85,
            "totalGasto": 110.0,
        },
        {
            "locPosto": "Posto Ipiranga Asa Norte",
            "totalAbastecimentos": 8,
            "precoMedioLitro": 5.89,
            "totalGasto": 1340.0,
        },
    ],
    "gastosPorMes": [
        {"anoMes": "2026-01", "valorTotal": 1200.0},
        {"anoMes": "2026-02", "valorTotal": 1450.0},
    ],
}


def test_healthcheck():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"


def test_diagnostics_endpoint():
    response = client.post("/api/v1/diagnostics", json=SAMPLE_CONTEXT)
    assert response.status_code == 200
    data = response.json()
    assert data["veiculoMaisEficiente"]["apelido"] == "Voltz EVS Delivery"
    assert data["pontoAtencao"]["apelido"] == "Hilux 4x4 Frota"
    assert len(data["recomendacoes"]) >= 2
    assert data["economiaEstimadaMensal"] > 0


def test_chat_endpoint_delivery_moto():
    payload = {
        "pergunta": "Qual moto de delivery tem o menor R$/km?",
        "contexto": SAMPLE_CONTEXT,
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Voltz EVS Delivery" in data["resposta"]
    assert len(data["sugestoesFollowUp"]) > 0
