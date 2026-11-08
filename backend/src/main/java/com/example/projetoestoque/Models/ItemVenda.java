package com.example.projetoestoque.Models;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;

@Entity
public class ItemVenda {
    @Id 
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne 
    @JoinColumn(name = "produto_id")
    private Produto produto;
    // Aqui a jpa ja esta relacionando o id do produto nessa nossa coluna do banco de dados.
    
    @Column(name = "nome_produto")
    @NotBlank(message = "Nome nao pode ser vazio.")
    private String nome;

    private BigDecimal quantidade;
    private BigDecimal valor;
    private Float peso;

    public ItemVenda(){}

    public ItemVenda(Produto produto, String nome, BigDecimal quantidade, BigDecimal valor){
        this.produto = produto;
        this.nome = nome;
        this.quantidade = quantidade;
        this.valor = valor;
    }

    // Aqui vai ser cada linha da nota fiscal. A cada produto sera isso.
    // Uma nota fiscal é composta por varias linhas de produtos e tambem um total de compra. Isso aqui é cada linha.
    
    @ManyToOne
    @JoinColumn(name = "venda_id")// Isso aqui é bem legal, vamos dizer que varios produtos entao relacionado a determinada venda. sabemos a quantidade de produtos em cada venda, pois aqui criamos uma coluna chamada venda_id, e com isso sabemos em qual venda saiu nossos produtos.
    @JsonIgnore 
    private Venda venda;


    public Produto getProduto() {
        return this.produto; 
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public BigDecimal getQuantidade() {
        return this.quantidade;
    }

    public void setQuantidade(BigDecimal quantidade) {
        this.quantidade = quantidade;
    }

    public BigDecimal getValor() {
        return this.valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public Long getId() {
        return this.id;
    }

    public void setPeso(Float peso) {
        this.peso = peso;
    }

    public Float getPeso() {
        return this.peso;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Venda getVenda() {
        return venda;
    }

    public void setVenda(Venda venda) {
        this.venda = venda;
    }
    
    public String getNome() {
        return this.nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
    
    

    
}