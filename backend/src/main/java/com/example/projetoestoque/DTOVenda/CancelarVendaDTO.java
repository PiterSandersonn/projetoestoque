package com.example.projetoestoque.DTOVenda;


public class CancelarVendaDTO {
    private Long userId;
    private Long vendaId;
    private String senhaCancelamento;


    public CancelarVendaDTO(){}




    public Long getUserId() {
        return userId;
    }


    public void setUserId(Long userId) {
        this.userId = userId;
    }


    public Long getVendaId() {
        return vendaId;
    }


    public void setVendaId(Long vendaId) {
        this.vendaId = vendaId;
    }




    public String getSenhaCancelamento() {
        return senhaCancelamento;
    }


    public void setSenhaCancelamento(String senhaCancelamento) {
        this.senhaCancelamento = senhaCancelamento;
    }



}
