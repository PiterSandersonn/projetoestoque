package com.example.projetoestoque.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.projetoestoque.Models.MovimentacaoEstoque;

public interface MovimentacaoRepository
        extends JpaRepository<MovimentacaoEstoque, Long> {

    List<MovimentacaoEstoque>
    findByUsuarioIdOrderByDataHoraDesc(Long userId);
}

