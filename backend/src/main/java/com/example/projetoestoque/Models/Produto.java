package com.example.projetoestoque.Models;

import java.math.BigDecimal;

import com.example.projetoestoque.Enum.CategoriasEnum;
import com.example.projetoestoque.Enum.TipoVendaEnum;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity 
@Table(name = "produto")
public class Produto {
    @Id 
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name_produtos", nullable= false)
    @NotNull(message= "Nome do produto nao pode ser nullo.")
    private String nome;

    @Column(name = "marca_produto", nullable = false)
    @NotBlank(message = "marca do produto nao pode ser nula.")
    private String marca;

    @Column(name = "codigo_produto")
    private Integer codigo;

    @Column(name = "tipo_venda")
    @Enumerated(EnumType.STRING)
    private TipoVendaEnum tipoVenda;

    @Column(name = "quantidade", nullable= false)
    @NotNull(message= "Quantidade nao pode ser nulla.")
    private BigDecimal quantidade;

    @ManyToOne() // aqui sera "muitos para um" teremos muitos produtos para um usuario.
    @JoinColumn(name = "user_id", nullable= false) // coluna de referencia sera o "user_id". Aqui tambem estamos dizendo que todo produto precisa pertencer a um usuario.
    private User user; // recebemos um user para relacionar a ele nossos produtos.

    @Column(name = "categorias", nullable = false)
    @Enumerated(EnumType.STRING)
    @NotNull(message= "Erro na categoria. Nao pode ser nulla.") 
    private CategoriasEnum categoria;

    @Column(name = "ValorProduto", nullable = false)
    @NotNull(message= "Valor nao pode ser vazio. Isso quebra o sistema pro compelto.")
    @DecimalMin(value = "0.01", message= "Valor deve ser maior que zero.")
    private BigDecimal valor;


    public Produto(){}

    public Produto(Long id, String nome, Integer codigo, TipoVendaEnum tipoVenda, String marca, BigDecimal quantidade, CategoriasEnum categoria, BigDecimal valor){
        this.id = id;
        this.nome = nome;
        this.marca = marca;
        this.quantidade = quantidade;
        this.tipoVenda = tipoVenda;
        this.codigo = codigo;
        this.categoria = categoria;
        this.valor = valor;
    }


    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return this.nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getMarca() {
        return this.marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public Integer getCodigo() {
        return this.codigo;
    }

    public TipoVendaEnum getTipoVenda() {
        return this.tipoVenda;
    }

    public void setTipoVenda(TipoVendaEnum tipoVenda) {
        this.tipoVenda = tipoVenda;
    }

    public void setCodigo(Integer codigo) {
        this.codigo = codigo;
    }


    public BigDecimal getQuantidade() {
        return this.quantidade;
    }

    public void setQuantidade(BigDecimal quantidade) {
        this.quantidade = quantidade;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public CategoriasEnum getCategoria() {
        return this.categoria;
    }

    public void setCategoria(CategoriasEnum categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getValor() {
        return this.valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }



}
