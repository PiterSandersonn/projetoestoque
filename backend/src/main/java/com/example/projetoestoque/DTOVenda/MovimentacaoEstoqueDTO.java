package com.example.projetoestoque.DTOVenda;

import java.util.List;

import com.example.projetoestoque.Models.Produto;

public class MovimentacaoEstoqueDTO {
    private List<Produto> produtos;
    private Long userId;

    public MovimentacaoEstoqueDTO() {}

    
    public List<Produto> getProdutos() {
        return this.produtos;
    }

    public void setProdutos(List<Produto> produtos) {
        this.produtos = produtos;
    }

    public Long getUserId() {
        return this.userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

}
