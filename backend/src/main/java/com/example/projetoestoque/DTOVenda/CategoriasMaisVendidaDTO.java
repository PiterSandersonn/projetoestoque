package com.example.projetoestoque.DTOVenda;

import java.math.BigDecimal;

import com.example.projetoestoque.Enum.CategoriasEnum;


public class CategoriasMaisVendidaDTO {

    private CategoriasEnum categoria;
    private BigDecimal total;
    private BigDecimal quantidadeVendida;



    public CategoriasMaisVendidaDTO(){}



    public CategoriasMaisVendidaDTO(CategoriasEnum categoria, BigDecimal quantidadeVendida, BigDecimal total){
        this.categoria = categoria;
        this.quantidadeVendida = quantidadeVendida;
        this.total = total;
    }

    
    

    public CategoriasEnum getCategoria() {
        return categoria;
    }


    public void setCategoria(CategoriasEnum categoria) {
        this.categoria = categoria;
    }


    public BigDecimal getTotal() {
        return total;
    }


    public void setTotal(BigDecimal total) {
        this.total = total;
    }


    public BigDecimal getQuantidadeVendida() {
        return quantidadeVendida;
    }


    public void setQuantidadeVendida(BigDecimal quantidadeVendida) {
        this.quantidadeVendida = quantidadeVendida;
    }

}
