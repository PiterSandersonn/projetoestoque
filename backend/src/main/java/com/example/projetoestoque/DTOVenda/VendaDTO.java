package com.example.projetoestoque.DTOVenda;


import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class VendaDTO {

    @NotNull(message= "Quantidade nao pode ser nula.")
    @DecimalMin (value = "0.001", message = "quantidade deve ser maior que zero.")
    private BigDecimal quantidade;

    @NotNull(message="O produto deve ser informado.")
    private Long produtoId;

    
    public VendaDTO(){}

    public BigDecimal getQuantidade() {
        return this.quantidade;
    }

    public void setQuantidade(BigDecimal quantidade) {
        this.quantidade = quantidade;
    }

    public Long getProdutoId() {
        return this.produtoId;
    }

    public void setProdutoId(Long produtoId) {
        this.produtoId = produtoId;
    }

}
