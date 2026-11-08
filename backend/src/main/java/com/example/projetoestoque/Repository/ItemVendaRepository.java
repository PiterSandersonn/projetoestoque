package com.example.projetoestoque.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.projetoestoque.DTOVenda.CategoriasMaisVendidaDTO;
import com.example.projetoestoque.Enum.StatusEnum;
import com.example.projetoestoque.Models.ItemVenda;

public interface ItemVendaRepository
        extends JpaRepository<ItemVenda, Long> {

    @Query("""
        SELECT new com.example.projetoestoque.DTOVenda.CategoriasMaisVendidaDTO(
            item.produto.categoria,
            SUM(item.quantidade),
            SUM(item.valor * item.quantidade)
        )
        FROM ItemVenda item
        WHERE item.venda.caixa.userId.id = :userId
          AND item.venda.statusPagamento = :status
        GROUP BY item.produto.categoria
        ORDER BY SUM(item.quantidade) DESC
    """)
    List<CategoriasMaisVendidaDTO> buscarCategoriasMaisVendidas(
            @Param("userId") Long userId,
            @Param("status") StatusEnum status
    );
}
