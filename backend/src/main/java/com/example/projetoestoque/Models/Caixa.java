package com.example.projetoestoque.Models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.projetoestoque.Enum.StatusCaixa;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
import jakarta.validation.constraints.NotNull;

@Entity 
public class Caixa {

    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Id 
    private Long id;

    @Column(name= "horario_abertura", nullable = false)
    @NotNull(message= "Horario de abertura nao pode ser nulo.")
    private LocalDateTime horarioAbertura;
    
    private LocalDateTime horarioFechamento;
    @Column(name= "valor_inicial", nullable = false)
    @NotNull(message="Coloque o valor que contem no caixa quando for inicia-lo.")
    private BigDecimal valorInicial;
    
    @Column(name= "valor_contado")
    private BigDecimal valorContado;

    @Column(name= "valor_esperado")
    private BigDecimal valorEsperado;

    @Column(name= "diferenca")
    private BigDecimal diferenca;

    @Enumerated(EnumType.STRING)
    private StatusCaixa status;

    
    @ManyToOne 
    @JoinColumn(name = "user_id", nullable = false)
    private User userId;

    @OneToMany(mappedBy= "caixa")
    @JsonIgnore 
    private List<Venda> vendas = new ArrayList<>();


    public Caixa(){}



    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getHorarioAbertura() {
        return this.horarioAbertura;
    }

    public void setHorarioAbertura(LocalDateTime horarioAbertura) {
        this.horarioAbertura = horarioAbertura;
    }

    public LocalDateTime getHorarioFechamento() {
        return this.horarioFechamento;
    }

    public void setHorarioFechamento(LocalDateTime horarioFechamento) {
        this.horarioFechamento = horarioFechamento;
    }

    public BigDecimal getValorInicial() {
        return this.valorInicial;
    }

    public void setValorInicial(BigDecimal valorInicial) {
        this.valorInicial = valorInicial;
    }

    public BigDecimal getValorContado() {
        return this.valorContado;
    }

    public void setValorContado(BigDecimal valorContado) {
        this.valorContado = valorContado;
    }

    public BigDecimal getValorEsperado() {
        return this.valorEsperado;
    }

    public void setValorEsperado(BigDecimal valorEsperado) {
        this.valorEsperado = valorEsperado;
    }

    public BigDecimal getDiferenca() {
        return this.diferenca;
    }

    public void setDiferenca(BigDecimal diferenca) {
        this.diferenca = diferenca;
    }

    public StatusCaixa getStatus() {
        return this.status;
    }

    public void setStatus(StatusCaixa status) {
        this.status = status;
    }

    public User getUserId() {
        return this.userId;
    }

    public void setUserId(User userId) {
        this.userId = userId;
    }

    public List<Venda> getVendas() {
        return this.vendas;
    }

    public void setVendas(List<Venda> vendas) {
        this.vendas = vendas;
    }


    
}
