package com.example.projetoestoque.Services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.example.projetoestoque.DTOVenda.CategoriasMaisVendidaDTO;
import com.example.projetoestoque.DTOVenda.EstoqueBaixoDTO;
import com.example.projetoestoque.DTOVenda.FormaPagamentoDTO;
import com.example.projetoestoque.Models.*;
import com.example.projetoestoque.ExceptionUserIdError.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.projetoestoque.Repository.ItemVendaRepository;
import com.example.projetoestoque.Repository.ProdutoRepository;
import com.example.projetoestoque.Repository.VendaRepository;
import com.example.projetoestoque.Enum.*;

@Service 
public class ServiceDashboardVendas {

    @Autowired 
    private VendaRepository vendaRepository;

    @Autowired 
    private ProdutoRepository produtoRepository;
    
    @Autowired 
    private UserService userService;

    @Autowired 
    private ItemVendaRepository itemVendaRepository;



    //total de vendas hoje.
    public BigDecimal totalVendasHoje(Long userId){

        if(userId == null){
            throw new ExceptionUserId();
        }

        LocalDate hoje = LocalDate.now();
        List<Venda> vendas = this.vendaRepository.findByDataVendaAndCaixaUserIdIdAndStatusPagamento(hoje, userId, StatusEnum.PAGO);

        BigDecimal total = BigDecimal.ZERO;

        for(Venda venda : vendas){
            if(venda.getTotal() == null){
                throw new RuntimeException("Valor da venda nao esta cadastrado no banco de dados."+ venda.getId());
            }
            BigDecimal valorVenda = venda.getTotal();
            total = total.add(valorVenda);
        }

        return total;
    }


    //quantidade de vendas do dia.
    public Integer quantidadeVendasHoje(Long userId){
        if(userId == null){
            throw new ExceptionUserId();
        }

        LocalDate hoje = LocalDate.now();

        List<Venda> vendas = this.vendaRepository.findByDataVendaAndCaixaUserIdIdAndStatusPagamento(hoje, userId, StatusEnum.PAGO);

        Integer quantidadeVendas = vendas.size();

        return quantidadeVendas;

    }


    //Total Vendas mes
    public BigDecimal totalVendasMes(Long userId){

        if(userId == null){
            throw new ExceptionUserId();
        }

        User usuario = this.userService.findBy(userId);

        List<Venda> vendasMes = this.vendaRepository.findByDataVendaBetweenAndCaixaUserIdIdAndStatusPagamento(LocalDate.now().withDayOfMonth(1),LocalDate.now(), usuario.getId(), StatusEnum.PAGO);

        BigDecimal total = BigDecimal.ZERO;

        for(Venda venda : vendasMes){
            total = total.add(venda.getTotal());
        }

        return total;

    }


    //Categoria mais vendida.
    public List<CategoriasMaisVendidaDTO> categoriaMaisVendida(Long userId){

        if(userId == null){
            throw new ExceptionUserId();
        }

        this.userService.findBy(userId);

        return this.itemVendaRepository.buscarCategoriasMaisVendidas(userId, StatusEnum.PAGO);

    }




    //Produtos com estoque inferio a 5.
    public List<EstoqueBaixoDTO> produtosEstoqueBaixo(Long userId){
        if(userId == null){
            throw new ExceptionUserId();
        }
        User usuario = this.userService.findBy(userId); // Aqui ja tratamos o erro internamente.

        List<Produto> produtos =  this.produtoRepository.findByUser_IdAndQuantidadeLessThanEqualOrderByQuantidadeAsc(usuario.getId(), BigDecimal.valueOf(5));
        List<EstoqueBaixoDTO> listaProdutos = new ArrayList<>();

        for (Produto produto : produtos){
            EstoqueBaixoDTO estoqueBaixo  = new EstoqueBaixoDTO(produto.getNome(), produto.getQuantidade());
            listaProdutos.add(estoqueBaixo);
        }

        return listaProdutos;

    }

    //estoque com 0 produtos.
    public List<EstoqueBaixoDTO> produtosEstoqueZerado(Long userId){
        if(userId == null){
            throw new ExceptionUserId();
        }

        User usuario = this.userService.findBy(userId); // Aqui estamos usando o service pq ele ja tratamos o erro internamente.

        List<Produto> produtos =  this.produtoRepository.findByUser_IdAndQuantidadeOrderByQuantidadeAsc(usuario.getId(), BigDecimal.ZERO);
        List<EstoqueBaixoDTO> listaProdutos = new ArrayList<>();

        for (Produto produto : produtos){
            EstoqueBaixoDTO estoqueZerado  = new EstoqueBaixoDTO(produto.getNome(), produto.getQuantidade());
            listaProdutos.add(estoqueZerado);
        }

        return listaProdutos;

    }

    //Vamos fazer um filtro por forma de pagamento diario.
    public FormaPagamentoDTO VendasDiaFormaDePgamento(Long userId, FormaPagamentoEnum formaPagamento){
        if(userId == null){
            throw new RuntimeException("Id do ussuario nao pode ser nulo.");
        }
        if(formaPagamento == null){
            throw new RuntimeException("Forma de pagamento ano pode ser nulo.");

        }
        List<Venda> vendas = this.vendaRepository.findByDataVendaAndCaixaUserIdIdAndPagamentoAndStatusPagamento(LocalDate.now(), userId, formaPagamento, StatusEnum.PAGO);
        BigDecimal total = BigDecimal.ZERO;
        for(Venda venda: vendas ){
            if(venda.getTotal() != null){
                total = total.add(venda.getTotal());
            }
        }
        FormaPagamentoDTO retorno = new FormaPagamentoDTO();
        retorno.setFormaPagamento(formaPagamento);
        retorno.setTotal(total);

        return retorno;
    }

    //filtro por forma de pagamento mensal.
    public FormaPagamentoDTO VendasMensalFormaDePagamento(Long userId, FormaPagamentoEnum formaPagamento){
        if(userId == null){
            throw new RuntimeException("Id do usuario nao pode ser nulo.");
        }

        if(formaPagamento == null){
            throw new RuntimeException("Forma de pagamento nao pode ser nulo.");

        }
        List<Venda> vendas = this.vendaRepository.findByDataVendaBetweenAndCaixaUserIdIdAndPagamentoAndStatusPagamento(LocalDate.now().withDayOfMonth(1), LocalDate.now(), userId, formaPagamento, StatusEnum.PAGO);

        BigDecimal totalMes = BigDecimal.ZERO;
        for(Venda venda: vendas){
            if(venda.getTotal() != null){
                totalMes = totalMes.add(venda.getTotal());
            } 
            
        }

        FormaPagamentoDTO retornoMensal = new FormaPagamentoDTO();
        retornoMensal.setFormaPagamento(formaPagamento);
        retornoMensal.setTotal(totalMes);
        
        return retornoMensal;
    }
    
}
