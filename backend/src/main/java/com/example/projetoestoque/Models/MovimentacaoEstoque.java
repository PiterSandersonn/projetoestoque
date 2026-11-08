package com.example.projetoestoque.Models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.projetoestoque.Enum.TipoMovimentacao;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;


@Entity 
public class MovimentacaoEstoque {
    
    @Id 
    @Column(name = "id", nullable= false)
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(name = "DataMovimentacao", nullable= false) 
    @NotNull(message= "Data e hora da movimentacao nao podem ser nulos.")
    private LocalDateTime dataHora;

    @ManyToOne()
    @JoinColumn(name= "usuario")
    private User usuario;

    @ManyToOne()
    @JoinColumn(name = "produto_id")
    private Produto produto;

    @Enumerated(EnumType.STRING)
    @NotNull(message= "Movimnetacao nao pode ser um campo nulo.")
    private TipoMovimentacao movimentacao;

    @PositiveOrZero(message="Quantiade deve ser maior ou igual a zero.")
    private BigDecimal quantidade;

    @PositiveOrZero(message= "Estoque anterior deve ser maior ou igual a zero.")
    private BigDecimal estoqueAnterior;

    @PositiveOrZero(message = "Estoque posterio deve ser maior ou igual a zero.")
    private BigDecimal estoquePosterior;


    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getDataHora() {
        return this.dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public User getUsuario() {
        return this.usuario;
    }

    public void setUsuario(User usuario) {
        this.usuario = usuario;
    }

    public Produto getProduto() {
        return this.produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public TipoMovimentacao getMovimentacao() {
        return this.movimentacao;
    }

    public void setMovimentacao(TipoMovimentacao movimentacao) {
        this.movimentacao = movimentacao;
    }

    public BigDecimal getQuantidade() {
        return this.quantidade;
    }

    public void setQuantidade(BigDecimal quantidade) {
        this.quantidade = quantidade;
    }

    public BigDecimal getEstoqueAnterior() {
        return this.estoqueAnterior;
    }

    public void setEstoqueAnterior(BigDecimal estoqueAnterior) {
        this.estoqueAnterior = estoqueAnterior;
    }

    public BigDecimal getEstoquePosterior() {
        return this.estoquePosterior;
    }

    public void setEstoquePosterior(BigDecimal estoquePosterior) {
        this.estoquePosterior = estoquePosterior;
    }






}
