package com.example.projetoestoque.DTOVenda;

import java.math.BigDecimal;

import com.example.projetoestoque.Enum.FormaPagamentoEnum;

public class FormaPagamentoDTO {

    private BigDecimal total;
    private FormaPagamentoEnum formaPagamento;

    
    public FormaPagamentoDTO(){}


    public BigDecimal getTotal() {
        return total;
    }


    public void setTotal(BigDecimal total) {
        this.total = total;
    }

  
    public FormaPagamentoEnum getFormaPagamento() {
        return formaPagamento;
    }


    public void setFormaPagamento(FormaPagamentoEnum formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

}
