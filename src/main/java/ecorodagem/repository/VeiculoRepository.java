package ecorodagem.repository;

import ecorodagem.domain.model.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {

    boolean existsByPlacaIgnoreCase(String placa);

    boolean existsByPlacaIgnoreCaseAndIdNot(String placa, Long id);

    List<Veiculo> findAllByOrderByIdDesc();
}
