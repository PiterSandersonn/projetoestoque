package com.example.projetoestoque.DTOVenda;
import java.util.List;

import com.example.projetoestoque.Enum.FormaPagamentoEnum;

public class DadosDTO {
    private Long userId;
    private  FormaPagamentoEnum pagamento;
    private List<VendaDTO> lista;

    public DadosDTO(){}



    public Long getUserId() {
        return this.userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public FormaPagamentoEnum getPagamento() {
        return this.pagamento;
    }

    public void setPagamento(FormaPagamentoEnum pagamento) {
        this.pagamento = pagamento;
    }


    public List<VendaDTO> getLista() {
        return this.lista;
    }

    public void setLista(List<VendaDTO> lista) {
        this.lista = lista;
    }


    
}
