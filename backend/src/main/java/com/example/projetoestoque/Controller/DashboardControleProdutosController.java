package com.example.projetoestoque.Controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.example.projetoestoque.Services.ServiceDashboardVendas;
import com.example.projetoestoque.DTOVenda.CategoriasMaisVendidaDTO;
import com.example.projetoestoque.DTOVenda.EstoqueBaixoDTO;
import java.util.List;

@RestController
@CrossOrigin(origins = "*") 
public class DashboardControleProdutosController {

    @Autowired 
    private ServiceDashboardVendas serviceDashboardVendas;

    //Total vendas hoje.
    @GetMapping("/totalVendaDia/{userId}")
    public ResponseEntity<?> totalVendasDia(@PathVariable("userId") Long userId){
        try {
            BigDecimal totalVendas = this.serviceDashboardVendas.totalVendasHoje(userId);
            return ResponseEntity.ok().body(totalVendas);

        } catch (RuntimeException e) {
           return  ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }

    //quantidade vendas do dia
    @GetMapping("/quantidadeVendasDia/{userId}")
    public ResponseEntity<?> quantidadeVendasDia(@PathVariable("userId") Long userId){
        try {
            Integer quantidadeVendas = this.serviceDashboardVendas.quantidadeVendasHoje(userId);
            return ResponseEntity.ok().body(quantidadeVendas);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }


    // produtos com estoque inferior a 5
    @GetMapping("/estoqueBaixo/{userId}")
    public ResponseEntity<?> estoqueBaixo(@PathVariable("userId") Long userId){
        try {
            List<EstoqueBaixoDTO> estoqueBaixo = this.serviceDashboardVendas.produtosEstoqueBaixo(userId);
            return ResponseEntity.ok().body(estoqueBaixo);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }

    //produtos estoque zerado.
    @GetMapping("/produtosEstoqueVazio/{userId}")
    public ResponseEntity<?> produtosEstoqueVazio(@PathVariable("userId") Long userId){
        try {
            List<EstoqueBaixoDTO> estoqueZerado = this.serviceDashboardVendas.produtosEstoqueZerado(userId);
            return ResponseEntity.ok().body(estoqueZerado);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }

    }

    //total de vendas do mes.
    @GetMapping("/totalVendasMes/{userId}")
    public ResponseEntity<?> totalVendasMes(@PathVariable("userId")Long userId){
        try {
            BigDecimal total = this.serviceDashboardVendas.totalVendasMes(userId);
            return ResponseEntity.ok().body(total);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
            
        }

    }

    //categoria mais vendida.
    @GetMapping("/categoriaMaisVendida/{userId}")
    public ResponseEntity<?> categoriasMaisVendidas(@PathVariable("userId") Long userId){
        try {
            List<CategoriasMaisVendidaDTO> listaCategorias = this.serviceDashboardVendas.categoriaMaisVendida(userId);
            return ResponseEntity.ok().body(listaCategorias);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
            
        }

    }



    
}
