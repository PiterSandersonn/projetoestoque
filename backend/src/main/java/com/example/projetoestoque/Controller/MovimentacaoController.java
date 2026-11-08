package com.example.projetoestoque.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.projetoestoque.DTOVenda.MovimentacaoEstoqueDTO;
import com.example.projetoestoque.Models.MovimentacaoEstoque;
import com.example.projetoestoque.Services.MovimentacaoEstoqueService;
import org.springframework.web.bind.annotation.CrossOrigin;



@RestController
@CrossOrigin(origins = "*")
public class MovimentacaoController {
    @Autowired 
    private MovimentacaoEstoqueService movimentacaoService;

    //Entrada de produtos nao cadastrados.
    @PostMapping("/entradaProdutos")
    public ResponseEntity<?> entradaProduto(@RequestBody MovimentacaoEstoqueDTO dto){
        try {
            this.movimentacaoService.movimentacaoCadastroEstoque(dto.getUserId(), dto.getProdutos());
            return ResponseEntity.ok().body("Produtos atualizados com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        } 
    }

    //Atualizacao de produtos ja cadastrados.
    @PostMapping("/atualizacaoProdutos")
    public ResponseEntity<?> atualizacaoProdutos(@RequestBody MovimentacaoEstoqueDTO dto) {
        try {
            this.movimentacaoService.movimentacaoEstoqueEntrada(dto.getUserId(), dto.getProdutos());
            return ResponseEntity.ok().body("Atualizacao de produtos feita com sucesso.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }
    
    //saida de produtos
    @PostMapping("/saidaProdutos")
    public ResponseEntity<?> saidaProdutos(@RequestBody MovimentacaoEstoqueDTO dto) {
        try {
            this.movimentacaoService.saidaEstoque(dto.getUserId(), dto.getProdutos());
            return ResponseEntity.ok().body("Saida de produtos ok.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }
    

    //cancelamento
    @PostMapping("/cancelamentoProdutos")
    public ResponseEntity<?> cancelamentoProdutos(@RequestBody MovimentacaoEstoqueDTO dto) {
        try {
            this.movimentacaoService.cancelamentoEstoque(dto.getUserId(), dto.getProdutos());
            return ResponseEntity.ok().body("Cancelamento feito com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }


    //perda
    @PostMapping("/perdaProdutos")
    public ResponseEntity<?> perdaProdutos(@RequestBody MovimentacaoEstoqueDTO dto) {
        try {
            this.movimentacaoService.perdaEstoque(dto.getUserId(), dto.getProdutos());
            return ResponseEntity.ok().body("Perdas cadastradas com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }

    //Devolucao
    @PostMapping("/devolucaoProdutos")
    public ResponseEntity<?> devolucaoProdutos(@RequestBody MovimentacaoEstoqueDTO dto) {
        try {
            this.movimentacaoService.devolucaoEstoque(dto.getUserId(), dto.getProdutos());
            return ResponseEntity.ok().body("Devolucao feita com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }

    @GetMapping("/movimentacoes")
    public ResponseEntity<?> returnoMovimentacoes(@RequestParam Long userId) {
       try {
           List<MovimentacaoEstoque> movimentacoes = this.movimentacaoService.retornoMovimentacao(userId);
           return ResponseEntity.ok().body(movimentacoes);
       } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
       }
    }
    
    
    
}
