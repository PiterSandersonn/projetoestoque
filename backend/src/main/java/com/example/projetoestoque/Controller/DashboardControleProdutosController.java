package com.example.projetoestoque.Controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.example.projetoestoque.Services.CaixaService;
import com.example.projetoestoque.Services.ServiceDashboardVendas;
import com.example.projetoestoque.DTOVenda.CategoriasMaisVendidaDTO;
import com.example.projetoestoque.DTOVenda.EstoqueBaixoDTO;
import com.example.projetoestoque.Enum.EnumPeriodo;
import com.example.projetoestoque.Models.Caixa;

import java.util.List;

@RestController
@CrossOrigin(origins = "*") 
public class DashboardControleProdutosController {

    @Autowired 
    private ServiceDashboardVendas serviceDashboardVendas;

    @Autowired 
    private CaixaService caixaService;
    //Total vendas hoje.
    @GetMapping("/totalVendaPeriodo/{userId}/{periodo}")
    public ResponseEntity<?> totalVendasDia(@PathVariable("userId") Long userId, @PathVariable("periodo") EnumPeriodo periodo){
        try {
            BigDecimal totalVendas = this.serviceDashboardVendas.totalVendasPeriodo(userId, periodo);
            return ResponseEntity.ok().body(totalVendas);
        } catch (RuntimeException e) {
           return  ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
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
    @GetMapping("/diferencaDeCaixa/{userId}/{periodo}")
    public ResponseEntity<?> diferencaDeCaixa(@PathVariable ("userId")Long userId, @PathVariable("periodo") EnumPeriodo periodo){
        try {
            List<Caixa> diferencas = this.caixaService.diferencaDosCaixas(userId, periodo);
            return ResponseEntity.ok().body(diferencas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }

    //categoria mais vendida.
    @GetMapping("/categoriaMaisVendida/{userId}/{periodo}")
    public ResponseEntity<?> categoriasMaisVendidas(@PathVariable("userId") Long userId, @PathVariable("periodo") EnumPeriodo periodo){
        try {
            List<CategoriasMaisVendidaDTO> listaCategorias = this.serviceDashboardVendas.categoriaMaisVendida(userId, periodo);
            return ResponseEntity.ok().body(listaCategorias);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
            
        }

    }
    @GetMapping("/quantidadeVendasPeriodo/{userId}/{periodo}")
    public ResponseEntity<?> quantidadeVendasPeriodo(
            @PathVariable("userId") Long userId,
            @PathVariable("periodo") EnumPeriodo periodo
    ) {
        try {
            Integer quantidade = this.serviceDashboardVendas.quantidadeVendasPeriodo(userId, periodo);

            return ResponseEntity.ok(quantidade);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: " + e.getMessage());
        }
    }




    
}
