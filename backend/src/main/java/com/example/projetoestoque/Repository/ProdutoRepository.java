package com.example.projetoestoque.Repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.projetoestoque.Models.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findByUserId(Long userId);

    @Query("""
        SELECT p
        FROM Produto p
        WHERE p.user.id = :userId
          AND (
                LOWER(p.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                OR LOWER(CAST(p.categoria AS string))
                   LIKE LOWER(CONCAT('%', :busca, '%'))
              )
    """)
    List<Produto> buscarPorNomeOuCategoria(
            @Param("userId") Long userId,
            @Param("busca") String busca
    );

    List<Produto> findByUser_IdAndQuantidadeLessThanEqualOrderByQuantidadeAsc(
            Long userId,
            BigDecimal limite
    );

    List<Produto> findByUser_IdAndQuantidadeOrderByQuantidadeAsc(
            Long userId,
            BigDecimal quantidade
    );

    // Busca um produto pelo código dentro do usuário logado.
    java.util.Optional<Produto> findByCodigoAndUser_Id(
            Integer codigo,
            Long userId
    );
}
