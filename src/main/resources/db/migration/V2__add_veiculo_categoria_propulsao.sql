-- ============================================================================
-- V2__add_veiculo_categoria_propulsao.sql
-- Evolução do schema para suportar categorias de veículos (Carro, Moto, etc.),
-- propulsões (Combustão, Flex, GNV, Híbrido HEV/PHEV, Elétrico BEV),
-- capacidades específicas (L, m³, kWh) e métrica universal de custo por km.
-- ============================================================================

ALTER TABLE veiculo
    ADD COLUMN IF NOT EXISTS categoria VARCHAR(20) NOT NULL DEFAULT 'CARRO',
    ADD COLUMN IF NOT EXISTS propulsao VARCHAR(20) NOT NULL DEFAULT 'FLEX',
    ADD COLUMN IF NOT EXISTS capacidade_gnv_m3 NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS capacidade_bateria_kwh NUMERIC(6, 2);

ALTER TABLE veiculo
    ALTER COLUMN tanque_comb DROP NOT NULL;

ALTER TABLE abastecimento
    ADD COLUMN IF NOT EXISTS unidade_medida VARCHAR(10) NOT NULL DEFAULT 'L',
    ADD COLUMN IF NOT EXISTS custo_por_km NUMERIC(8, 3);
