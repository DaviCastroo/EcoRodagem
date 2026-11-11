-- ============================================================================
-- EcoRodagem - Script Completo de Banco de Dados (PostgreSQL)
-- ============================================================================
-- Como executar manualmente via psql (criando o banco se não existir):
--   psql -U postgres -c "CREATE DATABASE ecorodagem;"
--   psql -U postgres -d ecorodagem -f database/ecorodagem_postgres.sql
--
-- Nota: Quando a API Spring Boot inicia, o Flyway também aplica automaticamente
-- as migrações em src/main/resources/db/migration/
-- ============================================================================

-- 1. Tabela de Veículos (Suporta Combustão, Flex, GNV, Híbridos e 100% Elétricos)
CREATE TABLE IF NOT EXISTS veiculo (
    id BIGSERIAL PRIMARY KEY,
    apelido VARCHAR(50) NOT NULL,
    placa VARCHAR(10) NOT NULL UNIQUE,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    cor VARCHAR(50),
    ano VARCHAR(11),
    categoria VARCHAR(20) NOT NULL DEFAULT 'CARRO'
        CHECK (categoria IN ('CARRO', 'MOTO', 'UTILITARIO', 'CAMINHAO')),
    propulsao VARCHAR(20) NOT NULL DEFAULT 'FLEX'
        CHECK (propulsao IN ('COMBUSTAO', 'FLEX', 'BI_FUEL_GNV', 'HIBRIDO_HEV', 'HIBRIDO_PHEV', 'ELETRICO_BEV')),
    hodometro_inicial NUMERIC(10, 1) NOT NULL CHECK (hodometro_inicial >= 0),
    hodometro_atual NUMERIC(10, 1) NOT NULL CHECK (hodometro_atual >= hodometro_inicial),
    tanque_comb NUMERIC(5, 2) CHECK (tanque_comb IS NULL OR tanque_comb > 0),
    capacidade_gnv_m3 NUMERIC(5, 2) CHECK (capacidade_gnv_m3 IS NULL OR capacidade_gnv_m3 > 0),
    capacidade_bateria_kwh NUMERIC(6, 2) CHECK (capacidade_bateria_kwh IS NULL OR capacidade_bateria_kwh > 0),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Abastecimentos / Recargas
CREATE TABLE IF NOT EXISTS abastecimento (
    id BIGSERIAL PRIMARY KEY,
    veiculo_id BIGINT NOT NULL REFERENCES veiculo(id) ON DELETE CASCADE,
    combustivel VARCHAR(20) NOT NULL
        CHECK (combustivel IN ('GASOLINA', 'ETANOL', 'DIESEL', 'GNV', 'ELETRICO')),
    unidade_medida VARCHAR(10) NOT NULL DEFAULT 'L',
    tanque_cheio BOOLEAN NOT NULL DEFAULT FALSE,
    litros NUMERIC(8, 2) NOT NULL CHECK (litros > 0),
    valor_total NUMERIC(10, 2) NOT NULL CHECK (valor_total > 0),
    preco_litro NUMERIC(8, 3) NOT NULL CHECK (preco_litro > 0),
    hodometro NUMERIC(10, 1) NOT NULL CHECK (hodometro > 0),
    km_percorridos NUMERIC(10, 1),
    media_consumo NUMERIC(8, 2),
    custo_por_km NUMERIC(8, 3),
    loc_posto VARCHAR(100),
    data_abastecimento DATE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Índices de Performance
CREATE INDEX IF NOT EXISTS idx_abastecimento_veiculo_data
    ON abastecimento(veiculo_id, data_abastecimento DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_abastecimento_posto
    ON abastecimento(loc_posto);
