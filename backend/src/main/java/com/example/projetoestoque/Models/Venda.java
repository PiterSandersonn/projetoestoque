package com.example.projetoestoque.Models;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.example.projetoestoque.Enum.FormaPagamentoEnum;
import com.example.projetoestoque.Enum.StatusEnum;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;




@Entity 
@Table(name = "venda")
public class Venda {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "FormaPagamento", nullable= false)
    @NotNull(message="Coloque a forma de pagamento.")
    private FormaPagamentoEnum pagamento;


    @Enumerated(EnumType.STRING)
    @Column(name = "StatusPagamento", nullable = false) 
    @NotNull(message= "Necessario colocar o status do pagmento.")
    private StatusEnum statusPagamento;

    // Esse usuario aqui eu vou settar na hora da venda, ja validando antes no service se o usuario existe.
    @Column (name = "userId",  nullable = false)
    @NotNull(message = "Id do usuario nao pode ser nulo.")
    private Long userId;
    
    // Vamos colocar a data da venda tambem, acho que isso pode nos ajudar no controle.
    @Column(name = "DataDaVenda", nullable= false)
    @NotNull(message= "Data da venda precisa ser cadastrada.")
    private LocalDate dataVenda;

    @Column(name = "totalCompra")
    @NotNull(message= "total nao pode ser nullo.")
    private BigDecimal total;

    @ManyToOne
    @JoinColumn(name = "caixa_id", nullable = false)
    private Caixa caixa;


    public Venda(){
        this.dataVenda = LocalDate.now();
        //Toda vez que a venda for criada, ele vai gerar a data de acordo com a data atual do computador.
    }

    @OneToMany(mappedBy= "venda", cascade = CascadeType.ALL)
    private List<ItemVenda> itens = new ArrayList<ItemVenda>();        


    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Long getuserId() {
        return this.userId;
    }

    public void setuserId(Long userId) {
        this.userId = userId;
    }

    public FormaPagamentoEnum getPagamento() {
        return this.pagamento;
    }

    public void setPagamento(FormaPagamentoEnum pagamento) {
        this.pagamento = pagamento;
    }

    public StatusEnum getStatusPagamento() {
        return this.statusPagamento;
    }

    public void setStatusPagamento(StatusEnum statusPagamento) {
        this.statusPagamento = statusPagamento;
    }

    public LocalDate getDataVenda() {
        return this.dataVenda;
    }

    public void setDataVenda(LocalDate dataVenda) {
        this.dataVenda = dataVenda;
    }

    public BigDecimal getTotal() {
        return this.total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public Caixa getCaixa() {
        return this.caixa;
    }

    public void setCaixa(Caixa caixa) {
        this.caixa = caixa;
    }

    public List<ItemVenda> getItens() {
        return this.itens;
    }

    public void setItens(List<ItemVenda> itens) {
        this.itens = itens;
    }

}
