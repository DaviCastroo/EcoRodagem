-- ============================================================================
-- V1__create_initial_schema.sql
-- Criação inicial das tabelas de Veículo e Abastecimento (PostgreSQL)
-- ============================================================================

CREATE TABLE veiculo (
    id BIGSERIAL PRIMARY KEY,
    apelido VARCHAR(50) NOT NULL,
    placa VARCHAR(10) NOT NULL UNIQUE,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    cor VARCHAR(50),
    ano VARCHAR(11),
    hodometro_inicial NUMERIC(10, 1) NOT NULL,
    hodometro_atual NUMERIC(10, 1) NOT NULL,
    tanque_comb NUMERIC(5, 2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE abastecimento (
    id BIGSERIAL PRIMARY KEY,
    veiculo_id BIGINT NOT NULL REFERENCES veiculo(id) ON DELETE CASCADE,
    combustivel VARCHAR(20) NOT NULL,
    tanque_cheio BOOLEAN NOT NULL DEFAULT FALSE,
    litros NUMERIC(8, 2) NOT NULL,
    valor_total NUMERIC(10, 2) NOT NULL,
    preco_litro NUMERIC(8, 3) NOT NULL,
    hodometro NUMERIC(10, 1) NOT NULL,
    km_percorridos NUMERIC(10, 1),
    media_consumo NUMERIC(8, 2),
    loc_posto VARCHAR(100),
    data_abastecimento DATE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_abastecimento_veiculo_data ON abastecimento(veiculo_id, data_abastecimento DESC, id DESC);
CREATE INDEX idx_abastecimento_posto ON abastecimento(loc_posto);
