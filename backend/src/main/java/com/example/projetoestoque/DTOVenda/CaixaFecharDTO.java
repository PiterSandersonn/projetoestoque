package com.example.projetoestoque.DTOVenda;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class CaixaFecharDTO {

    @NotNull(message= "O valor deve ser informado.")
    @PositiveOrZero(message= "O valor deve ser igual ou maior que zero.")
    private BigDecimal valorInformado;

    public CaixaFecharDTO(){}

    public BigDecimal getValorInformado() {
        return this.valorInformado;
    }

    public void setValorInformado(BigDecimal valorInformado) {
        this.valorInformado = valorInformado;
    }

}
