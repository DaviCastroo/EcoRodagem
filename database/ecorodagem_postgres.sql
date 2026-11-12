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


-- ============================================================================
-- 4. Carga Inicial de Dados Fictícios (Frota Completa + Histórico)
-- ============================================================================

INSERT INTO veiculo (apelido, placa, marca, modelo, cor, ano, categoria, propulsao, hodometro_inicial, hodometro_atual, tanque_comb, capacidade_gnv_m3, capacidade_bateria_kwh, ativo)
VALUES
  ('Meu Civic Touring', 'ABC1D23', 'Honda', 'Civic Touring 1.5', 'Prata', '2023/2024', 'CARRO', 'FLEX', 20000.0, 21780.0, 56.00, NULL, NULL, TRUE),
  ('BYD Dolphin Elétrico', 'ELE4A88', 'BYD', 'Dolphin GS', 'Cinza', '2025/2025', 'CARRO', 'ELETRICO_BEV', 5000.0, 6260.0, NULL, NULL, 44.90, TRUE),
  ('Siena do Dia a Dia', 'GNV7B55', 'Fiat', 'Grand Siena 1.4', 'Branco', '2021/2022', 'CARRO', 'BI_FUEL_GNV', 65000.0, 66180.0, 48.00, 15.00, NULL, TRUE),
  ('Haval H6 Plug-in', 'PHV9C11', 'GWM', 'Haval H6 PHEV19', 'Azul', '2024/2025', 'CARRO', 'HIBRIDO_PHEV', 8000.0, 9740.0, 55.00, NULL, 19.00, TRUE),
  ('Corolla Hybrid', 'HEV2E44', 'Toyota', 'Corolla Altis Hybrid', 'Preto', '2023/2024', 'CARRO', 'HIBRIDO_HEV', 15000.0, 17010.0, 43.00, NULL, NULL, TRUE),
  ('Fazer 250 Urbana', 'MOT3F90', 'Yamaha', 'Fazer FZ25 ABS', 'Azul', '2024/2024', 'MOTO', 'FLEX', 3000.0, 3960.0, 14.00, NULL, NULL, TRUE),
  ('Voltz EVS Delivery', 'MEV6J22', 'Voltz', 'EVS Dual Battery', 'Preta', '2024/2025', 'MOTO', 'ELETRICO_BEV', 1200.0, 1545.0, NULL, NULL, 4.80, TRUE),
  ('Hilux 4x4 Frota', 'UTI5G77', 'Toyota', 'Hilux SRX 2.8 TDI', 'Branco', '2023/2023', 'UTILITARIO', 'COMBUSTAO', 40000.0, 41950.0, 80.00, NULL, NULL, TRUE),
  ('Volvo FH 540 Matriz', 'CAM8H12', 'Volvo', 'FH 540 6x4', 'Vermelho', '2022/2023', 'CAMINHAO', 'COMBUSTAO', 120000.0, 123180.0, 600.00, NULL, NULL, TRUE)
ON CONFLICT (placa) DO NOTHING;


-- Abastecimentos do Meu Civic Touring (ABC1D23) - Gasolina e Etanol
INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'GASOLINA', 'L', TRUE, 42.00, 247.38, 5.890, 20495.0, 495.0, 11.79, 0.500, 'Posto Ipiranga Av. Paulista', CURRENT_DATE - INTERVAL '95 days'
FROM veiculo v WHERE v.placa = 'ABC1D23' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 20495.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'ETANOL', 'L', TRUE, 45.00, 175.05, 3.890, 20880.0, 385.0, 8.56, 0.455, 'Posto Shell Jardins', CURRENT_DATE - INTERVAL '65 days'
FROM veiculo v WHERE v.placa = 'ABC1D23' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 20880.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'GASOLINA', 'L', TRUE, 38.00, 227.62, 5.990, 21355.0, 475.0, 12.50, 0.479, 'Posto Petrobras Marginal', CURRENT_DATE - INTERVAL '32 days'
FROM veiculo v WHERE v.placa = 'ABC1D23' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 21355.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'GASOLINA', 'L', TRUE, 35.00, 206.15, 5.890, 21780.0, 425.0, 12.14, 0.485, 'Posto Ipiranga Av. Paulista', CURRENT_DATE - INTERVAL '5 days'
FROM veiculo v WHERE v.placa = 'ABC1D23' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 21780.0);

-- Recargas do BYD Dolphin Elétrico (ELE4A88) - kWh
INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'ELETRICO', 'kWh', TRUE, 38.00, 68.40, 1.800, 5310.0, 310.0, 8.16, 0.221, 'Eletroposto Tupinambá Shopping', CURRENT_DATE - INTERVAL '75 days'
FROM veiculo v WHERE v.placa = 'ELE4A88' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 5310.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'ELETRICO', 'kWh', TRUE, 41.50, 39.43, 0.950, 5650.0, 340.0, 8.19, 0.116, 'Wallbox Residencial (Tarifa Branca)', CURRENT_DATE - INTERVAL '48 days'
FROM veiculo v WHERE v.placa = 'ELE4A88' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 5650.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'ELETRICO', 'kWh', TRUE, 36.00, 68.40, 1.900, 5945.0, 295.0, 8.19, 0.232, 'Eletroposto Zletric Bandeirantes', CURRENT_DATE - INTERVAL '22 days'
FROM veiculo v WHERE v.placa = 'ELE4A88' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 5945.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'ELETRICO', 'kWh', TRUE, 39.00, 37.05, 0.950, 6260.0, 315.0, 8.08, 0.118, 'Wallbox Residencial (Tarifa Branca)', CURRENT_DATE - INTERVAL '2 days'
FROM veiculo v WHERE v.placa = 'ELE4A88' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 6260.0);

-- Abastecimentos do Siena Bi-Fuel GNV (GNV7B55) - GNV (m³) e Gasolina (L)
INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'GNV', 'm³', TRUE, 13.50, 63.32, 4.690, 65190.0, 190.0, 14.07, 0.333, 'Posto GNV Via Dutra', CURRENT_DATE - INTERVAL '80 days'
FROM veiculo v WHERE v.placa = 'GNV7B55' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 65190.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'GNV', 'm³', TRUE, 14.20, 66.60, 4.690, 65395.0, 205.0, 14.44, 0.325, 'Posto GNV Via Dutra', CURRENT_DATE - INTERVAL '55 days'
FROM veiculo v WHERE v.placa = 'GNV7B55' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 65395.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'GASOLINA', 'L', TRUE, 40.00, 235.60, 5.890, 65835.0, 440.0, 11.00, 0.535, 'Posto Shell Jardins', CURRENT_DATE - INTERVAL '28 days'
FROM veiculo v WHERE v.placa = 'GNV7B55' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 65835.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'GNV', 'm³', TRUE, 14.50, 69.46, 4.790, 66180.0, 345.0, 23.79, 0.201, 'Posto GNV Via Dutra', CURRENT_DATE - INTERVAL '7 days'
FROM veiculo v WHERE v.placa = 'GNV7B55' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 66180.0);

-- Abastecimentos e Recargas do Haval H6 Plug-in (PHV9C11) - Elétrico + Gasolina
INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'ELETRICO', 'kWh', TRUE, 17.50, 31.50, 1.800, 8115.0, 115.0, 6.57, 0.274, 'Eletroposto Tupinambá Shopping', CURRENT_DATE - INTERVAL '60 days'
FROM veiculo v WHERE v.placa = 'PHV9C11' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 8115.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'GASOLINA', 'L', TRUE, 45.00, 269.55, 5.990, 9015.0, 900.0, 20.00, 0.300, 'Posto Petrobras Marginal', CURRENT_DATE - INTERVAL '35 days'
FROM veiculo v WHERE v.placa = 'PHV9C11' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 9015.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'GASOLINA', 'L', TRUE, 32.00, 188.48, 5.890, 9620.0, 605.0, 18.91, 0.312, 'Posto Ipiranga Av. Paulista', CURRENT_DATE - INTERVAL '14 days'
FROM veiculo v WHERE v.placa = 'PHV9C11' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 9620.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'ELETRICO', 'kWh', TRUE, 18.00, 17.10, 0.950, 9740.0, 120.0, 6.67, 0.143, 'Wallbox Residencial (Tarifa Branca)', CURRENT_DATE - INTERVAL '4 days'
FROM veiculo v WHERE v.placa = 'PHV9C11' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 9740.0);

-- Abastecimentos do Corolla Hybrid HEV (HEV2E44) - Gasolina e Etanol
INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'GASOLINA', 'L', TRUE, 36.00, 212.04, 5.890, 15630.0, 630.0, 17.50, 0.337, 'Posto Shell Jardins', CURRENT_DATE - INTERVAL '50 days'
FROM veiculo v WHERE v.placa = 'HEV2E44' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 15630.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'GASOLINA', 'L', TRUE, 38.00, 223.82, 5.890, 16470.0, 840.0, 22.11, 0.266, 'Posto Ipiranga Av. Paulista', CURRENT_DATE - INTERVAL '25 days'
FROM veiculo v WHERE v.placa = 'HEV2E44' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 16470.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'ETANOL', 'L', TRUE, 36.00, 140.04, 3.890, 17010.0, 540.0, 15.00, 0.259, 'Posto Shell Jardins', CURRENT_DATE - INTERVAL '6 days'
FROM veiculo v WHERE v.placa = 'HEV2E44' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 17010.0);

-- Abastecimentos da Moto Fazer 250 (MOT3F90)
INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'GASOLINA', 'L', TRUE, 11.50, 67.74, 5.890, 3345.0, 345.0, 30.00, 0.196, 'Posto Shell Jardins', CURRENT_DATE - INTERVAL '40 days'
FROM veiculo v WHERE v.placa = 'MOT3F90' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 3345.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'GASOLINA', 'L', TRUE, 10.20, 60.08, 5.890, 3660.0, 315.0, 30.88, 0.191, 'Posto Shell Jardins', CURRENT_DATE - INTERVAL '18 days'
FROM veiculo v WHERE v.placa = 'MOT3F90' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 3660.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'ETANOL', 'L', TRUE, 12.00, 46.68, 3.890, 3960.0, 300.0, 25.00, 0.156, 'Posto Ipiranga Av. Paulista', CURRENT_DATE - INTERVAL '3 days'
FROM veiculo v WHERE v.placa = 'MOT3F90' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 3960.0);

-- Recargas da Moto Elétrica Voltz EVS (MEV6J22)
INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'ELETRICO', 'kWh', TRUE, 4.20, 3.99, 0.950, 1315.0, 115.0, 27.38, 0.035, 'Wallbox Residencial (Tarifa Branca)', CURRENT_DATE - INTERVAL '30 days'
FROM veiculo v WHERE v.placa = 'MEV6J22' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 1315.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'ELETRICO', 'kWh', TRUE, 4.40, 7.92, 1.800, 1430.0, 115.0, 26.14, 0.069, 'Eletroposto Tupinambá Shopping', CURRENT_DATE - INTERVAL '15 days'
FROM veiculo v WHERE v.placa = 'MEV6J22' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 1430.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'ELETRICO', 'kWh', TRUE, 4.30, 4.09, 0.950, 1545.0, 115.0, 26.74, 0.036, 'Wallbox Residencial (Tarifa Branca)', CURRENT_DATE - INTERVAL '1 day'
FROM veiculo v WHERE v.placa = 'MEV6J22' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 1545.0);

-- Abastecimentos do Utilitário Hilux 4x4 Diesel (UTI5G77)
INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'DIESEL', 'L', TRUE, 65.00, 389.35, 5.990, 40650.0, 650.0, 10.00, 0.599, 'Posto Graal Rodovia Anhanguera', CURRENT_DATE - INTERVAL '70 days'
FROM veiculo v WHERE v.placa = 'UTI5G77' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 40650.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'DIESEL', 'L', TRUE, 62.00, 365.18, 5.890, 41300.0, 650.0, 10.48, 0.562, 'Posto Graal Rodovia Anhanguera', CURRENT_DATE - INTERVAL '36 days'
FROM veiculo v WHERE v.placa = 'UTI5G77' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 41300.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'DIESEL', 'L', TRUE, 60.00, 353.40, 5.890, 41950.0, 650.0, 10.83, 0.544, 'Posto Petrobras Marginal', CURRENT_DATE - INTERVAL '8 days'
FROM veiculo v WHERE v.placa = 'UTI5G77' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 41950.0);

-- Abastecimentos do Caminhão Volvo FH 540 (CAM8H12)
INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'DIESEL', 'L', TRUE, 420.00, 2431.80, 5.790, 121050.0, 1050.0, 2.50, 2.316, 'Posto Rede Presidente BR-116', CURRENT_DATE - INTERVAL '60 days'
FROM veiculo v WHERE v.placa = 'CAM8H12' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 121050.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'DIESEL', 'L', TRUE, 400.00, 2316.00, 5.790, 122100.0, 1050.0, 2.63, 2.206, 'Posto Rede Presidente BR-116', CURRENT_DATE - INTERVAL '30 days'
FROM veiculo v WHERE v.placa = 'CAM8H12' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 122100.0);

INSERT INTO abastecimento (veiculo_id, combustivel, unidade_medida, tanque_cheio, litros, valor_total, preco_litro, hodometro, km_percorridos, media_consumo, custo_por_km, loc_posto, data_abastecimento)
SELECT v.id, 'DIESEL', 'L', TRUE, 415.00, 2444.35, 5.890, 123180.0, 1080.0, 2.60, 2.263, 'Posto Graal Rodovia Anhanguera', CURRENT_DATE - INTERVAL '9 days'
FROM veiculo v WHERE v.placa = 'CAM8H12' AND NOT EXISTS (SELECT 1 FROM abastecimento a WHERE a.veiculo_id = v.id AND a.hodometro = 123180.0);
