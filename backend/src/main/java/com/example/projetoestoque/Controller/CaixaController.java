package com.example.projetoestoque.Controller;

import java.math.BigDecimal;
import java.util.List;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.projetoestoque.DTOVenda.CaixaFecharDTO;
import com.example.projetoestoque.Models.Caixa;
import com.example.projetoestoque.Services.CaixaService;

import jakarta.validation.Valid;




@RestController
@CrossOrigin(origins = "*")
public class CaixaController {
    @Autowired 
    private CaixaService caixaService;

    //endpoint de abertura.
    @PostMapping("/AberturaCaixa")
    public ResponseEntity<?> AberturaCaixa(@RequestParam BigDecimal valor, @RequestParam Long userId){
        try {
            Caixa caixa = this.caixaService.abrirCaixa(valor, userId);
            return ResponseEntity.ok().body(caixa);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }
    
    @PutMapping("/fechamentoCaixa/{caixaId}")
    public ResponseEntity<?> fechamentoCaixa(@PathVariable Long caixaId, @Valid @RequestBody CaixaFecharDTO dto) {
        try {
            Caixa caixa = this.caixaService.fecharCaixa(dto, caixaId);
            return ResponseEntity.ok().body(caixa);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }
    @GetMapping("/buscarCaixaAberto")
    public ResponseEntity<?> caixaAberto(@RequestParam Long userId) {
        try {
            Caixa caixa = this.caixaService.bucarCaixaAberto(userId);
            return ResponseEntity.ok().body(caixa);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }

    @GetMapping("/buscarDiferencas/{userId}")
    public ResponseEntity<?> buscarDiferenca(@PathVariable ("userId") Long userId){
        try {
            List<Caixa> caixasComDiferencas = this.caixaService.diferencaDosCaixas(userId); 
            return ResponseEntity.ok().body(caixasComDiferencas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("ocorreu um erro: "+e.getMessage());
        }
    }
    
}