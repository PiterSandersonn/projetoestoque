package com.example.projetoestoque.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.projetoestoque.Enum.StatusCaixa;
import com.example.projetoestoque.Models.Caixa;

public interface CaixaRepository
        extends JpaRepository<Caixa, Long> {

    Optional<Caixa> findByUserIdIdAndStatus(
            Long userId,
            StatusCaixa status
    );
}