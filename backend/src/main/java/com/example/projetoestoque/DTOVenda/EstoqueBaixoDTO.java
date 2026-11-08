package com.example.projetoestoque.DTOVenda;

import java.math.BigDecimal;

public class EstoqueBaixoDTO {


    private String nome;
    private BigDecimal quantidade;

    public EstoqueBaixoDTO(){}

    public EstoqueBaixoDTO(String nome, BigDecimal quantidade){
        this.quantidade = quantidade;
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }

    
    public void setNome(String nome) {
        this.nome = nome;
    }


    public BigDecimal getQuantidade() {
        return quantidade;
    }

    
    public void setQuantidade(BigDecimal quantidade) {
        this.quantidade = quantidade;
    }

}
