package com.example.projetoestoque.Services;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.example.projetoestoque.DTOVenda.CategoriasMaisVendidaDTO;
import com.example.projetoestoque.DTOVenda.EstoqueBaixoDTO;
import com.example.projetoestoque.Models.*;
import com.example.projetoestoque.ExceptionUserIdError.*;
import com.example.projetoestoque.Enum.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.projetoestoque.Repository.ItemVendaRepository;
import com.example.projetoestoque.Repository.ProdutoRepository;
import com.example.projetoestoque.Repository.VendaRepository;

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



    //total de vendas periodo.
    public BigDecimal totalVendasPeriodo(Long userId, EnumPeriodo periodo){

        if(userId == null){
            throw new ExceptionUserId();
        }
        
        if (periodo == null) {
            throw new RuntimeException("Periodo nao pode ser nulo.");
        }


        User usuario = this.userService.findBy(userId); 
        if(usuario.getTipoUsuario() != TipoUsuarioEnum.ADMIN){
            throw new RuntimeException("Somente administrados tem acesso a esse canal.");
        }

        LocalDate dataEscolida;

        switch (periodo) {
            case DIA:
                dataEscolida = LocalDate.now();
                break;
            case SEMANA:
                dataEscolida = LocalDate.now().with(DayOfWeek.MONDAY);
                break;
            case MES:
                dataEscolida = LocalDate.now().withDayOfMonth(1);
                break;
            default:
                throw new RuntimeException("Ocorreu um erro ao receber o periodo.");
        }

        LocalDate hoje = LocalDate.now();
        List<Venda> vendas = this.vendaRepository.findByDataVendaBetweenAndCaixaUserIdIdAndStatusPagamento(dataEscolida, hoje, userId, StatusEnum.PAGO);

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


    //quantidade de vendas por periodo.
    public Integer quantidadeVendasPeriodo(Long userId, EnumPeriodo periodo){
        if(userId == null){
            throw new ExceptionUserId();
        }
        if(periodo == null){
            throw new RuntimeException("Periodo nao pode ser nulo.");
        }

        User usuario = this.userService.findBy(userId); 

        if(usuario.getTipoUsuario() != TipoUsuarioEnum.ADMIN){
            throw new RuntimeException("Somente administrados tem acesso a esse canal.");
        }

        LocalDate dataEscolhida;

        switch (periodo) {
            case DIA:
                dataEscolhida = LocalDate.now();
                break;
            case SEMANA:
                dataEscolhida = LocalDate.now().with(DayOfWeek.MONDAY);
                break;
            case MES:
                dataEscolhida = LocalDate.now().withDayOfMonth(1);
                break;
            default:
                throw new RuntimeException("Ocorreu um erro ao receber op periodo.");
        }

        LocalDate hoje = LocalDate.now();

        List<Venda> vendas = this.vendaRepository.findByDataVendaBetweenAndCaixaUserIdIdAndStatusPagamento(dataEscolhida, hoje, userId, StatusEnum.PAGO);

        Integer quantidadeVendas = vendas.size();

        return quantidadeVendas;

    }



    //Categoria mais vendida.
    public List<CategoriasMaisVendidaDTO> categoriaMaisVendida(Long userId, EnumPeriodo periodo){

        if(userId == null){
            throw new ExceptionUserId();
        }
        if(periodo == null){
            throw new RuntimeException("Periodo nao pode ser nulo.");
        }

        LocalDate dataEscolhida;

        switch (periodo) {
            case DIA :
                dataEscolhida = LocalDate.now();
                break;
            case SEMANA:
                dataEscolhida = LocalDate.now().with(DayOfWeek.MONDAY);
                break;
            case MES:
                dataEscolhida = LocalDate.now().withDayOfMonth(1);
                break;
            default:
                throw new RuntimeException("Ocorreun um erro ao receber o periodo.");
        }

        User usuario = this.userService.findBy(userId); 

        if(usuario.getTipoUsuario() != TipoUsuarioEnum.ADMIN){
            throw new RuntimeException("Somente administrados tem acesso a esse canal.");
        }


        return this.itemVendaRepository.buscarCategoriasMaisVendidas(userId, dataEscolhida, LocalDate.now(), StatusEnum.PAGO);
    }




    //Produtos com estoque inferio a 5.
    public List<EstoqueBaixoDTO> produtosEstoqueBaixo(Long userId){
        if(userId == null){
            throw new ExceptionUserId();
        }
       
        User usuario = this.userService.findBy(userId); 

        if(usuario.getTipoUsuario() != TipoUsuarioEnum.ADMIN){
            throw new RuntimeException("Somente administrados tem acesso a esse canal.");
        }

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


    
}
