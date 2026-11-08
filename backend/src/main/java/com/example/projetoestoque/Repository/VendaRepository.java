package com.example.projetoestoque.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.projetoestoque.Enum.FormaPagamentoEnum;
import com.example.projetoestoque.Enum.StatusEnum;
import com.example.projetoestoque.Models.Venda;

public interface VendaRepository extends JpaRepository<Venda, Long> {

    /*
     * Soma as vendas de um caixa específico,
     * filtrando por forma de pagamento e status.
     */
    @Query("""
        SELECT COALESCE(SUM(v.total), 0)
        FROM Venda v
        WHERE v.caixa.id = :caixaId
          AND v.pagamento = :pagamento
          AND v.statusPagamento = :status
    """)
    BigDecimal somarVendasDoCaixa(
            @Param("caixaId") Long caixaId,
            @Param("pagamento") FormaPagamentoEnum pagamento,
            @Param("status") StatusEnum status
    );

    /*
     * Busca vendas de uma data específica,
     * filtradas pelo usuário e pelo status.
     */
    List<Venda> findByDataVendaAndCaixaUserIdIdAndStatusPagamento(
            LocalDate dataVenda,
            Long userId,
            StatusEnum statusPagamento
    );

    /*
     * Busca vendas de uma data específica,
     * filtradas por forma de pagamento e status.
     */
    List<Venda> findByDataVendaAndCaixaUserIdIdAndPagamentoAndStatusPagamento(
            LocalDate dataVenda,
            Long userId,
            FormaPagamentoEnum pagamento,
            StatusEnum statusPagamento
    );

    /*
     * Busca vendas de um período,
     * filtradas pelo usuário e pelo status.
     */
    List<Venda> findByDataVendaBetweenAndCaixaUserIdIdAndStatusPagamento(
            LocalDate dataInicial,
            LocalDate dataFinal,
            Long userId,
            StatusEnum statusPagamento
    );

    /*
     * Busca vendas de um período,
     * filtradas por forma de pagamento e status.
     */
    List<Venda> findByDataVendaBetweenAndCaixaUserIdIdAndPagamentoAndStatusPagamento(
            LocalDate dataInicial,
            LocalDate dataFinal,
            Long userId,
            FormaPagamentoEnum pagamento,
            StatusEnum statusPagamento
    );
}
