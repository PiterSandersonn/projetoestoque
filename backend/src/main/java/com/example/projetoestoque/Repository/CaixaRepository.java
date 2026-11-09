package com.example.projetoestoque.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.projetoestoque.Enum.StatusCaixa;
import com.example.projetoestoque.Models.Caixa;

public interface CaixaRepository extends JpaRepository<Caixa, Long> {

    Optional<Caixa> findByUserIdIdAndStatus(
            Long userId,
            StatusCaixa status
    );

    @Query("""
        SELECT c
        FROM Caixa c
        WHERE c.userId.id = :userId
          AND c.horarioFechamento BETWEEN :inicio AND :fim
          AND c.status = com.example.projetoestoque.Enum.StatusCaixa.FECHADO
          AND c.diferenca <> 0
        ORDER BY c.horarioFechamento DESC
    """)
    List<Caixa> buscarDiferencasDoPeriodo(
            @Param("userId") Long userId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
}
