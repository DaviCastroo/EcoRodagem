package ecorodagem.repository;

import ecorodagem.domain.enums.TipoCombustivel;
import ecorodagem.domain.model.Abastecimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AbastecimentoRepository extends JpaRepository<Abastecimento, Long> {

    List<Abastecimento> findAllByOrderByDataAbastecimentoDescIdDesc();

    List<Abastecimento> findByVeiculoIdOrderByDataAbastecimentoDescIdDesc(Long veiculoId);

    List<Abastecimento> findByCombustivelOrderByDataAbastecimentoDescIdDesc(TipoCombustivel combustivel);

    Optional<Abastecimento> findFirstByVeiculoIdOrderByDataAbastecimentoDescIdDesc(Long veiculoId);

    Optional<Abastecimento> findFirstByOrderByDataAbastecimentoDescIdDesc();

    @Query("SELECT COALESCE(AVG(a.mediaConsumo), 0) FROM Abastecimento a WHERE a.veiculo.id = :veiculoId AND a.mediaConsumo IS NOT NULL")
    BigDecimal calcularConsumoMedioPorVeiculo(@Param("veiculoId") Long veiculoId);

    @Query("SELECT COALESCE(AVG(a.custoPorKm), 0) FROM Abastecimento a WHERE a.veiculo.id = :veiculoId AND a.custoPorKm IS NOT NULL")
    BigDecimal calcularCustoMedioPorKmPorVeiculo(@Param("veiculoId") Long veiculoId);

    @Query("SELECT COALESCE(AVG(a.mediaConsumo), 0) FROM Abastecimento a WHERE a.mediaConsumo IS NOT NULL")
    BigDecimal calcularConsumoMedioGeral();

    @Query("SELECT COALESCE(AVG(a.custoPorKm), 0) FROM Abastecimento a WHERE a.custoPorKm IS NOT NULL")
    BigDecimal calcularCustoMedioPorKmGeral();

    @Query("SELECT COALESCE(SUM(a.valorTotal), 0) FROM Abastecimento a WHERE a.dataAbastecimento BETWEEN :inicio AND :fim")
    BigDecimal somarGastoTotalNoPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
