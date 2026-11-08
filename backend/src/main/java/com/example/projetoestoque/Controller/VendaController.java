package com.example.projetoestoque.Controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.projetoestoque.DTOVenda.DadosDTO;
import com.example.projetoestoque.Models.Venda;
import com.example.projetoestoque.Services.VendaService;

import jakarta.validation.Valid;


@RestController 
@CrossOrigin(origins = "*")
public class VendaController {
    @Autowired 
    private VendaService vendaService;

    //Aqui criamos e ja retornamos a venda. 
    @PostMapping("/createVenda/")
    public ResponseEntity<?> createVenda(@Valid @RequestBody DadosDTO dados) {
        try {
            Venda newVenda = this.vendaService.createVenda(dados);
            return ResponseEntity.ok().body(newVenda);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    
}
