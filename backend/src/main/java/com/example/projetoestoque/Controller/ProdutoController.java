package com.example.projetoestoque.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.projetoestoque.Models.Produto;
import com.example.projetoestoque.Services.ProdutoService;

import jakarta.validation.Valid;





@RestController
@CrossOrigin(origins = "*")
public class ProdutoController {
  
    @Autowired 
    private ProdutoService produtoService;

    //create
    @PostMapping("/createProduct/")
    public ResponseEntity<?> createProduto(@Valid @RequestParam("userId") Long userId, @RequestBody Produto product){
        try {
            this.produtoService.createProduto(product, userId);
            return ResponseEntity.ok().body("Produto criado com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }

    // Post
    
    @GetMapping("/returnProdutos")
    public ResponseEntity<?> returnProductList(@RequestParam("userId") Long userId, @RequestParam(required = false) String  busca){
        try{
            List<Produto> ListProduct = this.produtoService.returnListaProdutos(userId, busca);
            return ResponseEntity.ok(ListProduct);
        } catch(RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    //return
    @GetMapping("/returnProduto/{id}")
    public ResponseEntity<?> returnProduto(@PathVariable("id") Long id){
        try {
            Produto newProduct = this.produtoService.returnProduto(id);
            return ResponseEntity.ok().body(newProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ocorreu um erro: "+e.getMessage());
        } 
    }

    //update
    @PutMapping("/updateProduto/{userId}")
    public ResponseEntity<?> updateProduto(@Valid @PathVariable("userId") Long userId, @RequestBody Produto product){
        try{
            this.produtoService.updateProduto(product, userId); // aqui estou passando um obeto completo, ams no service eu pego o id correo do produto.
            return ResponseEntity.ok().body("Produto atualizado com sucesso!");
        } catch(RuntimeException e){
            return ResponseEntity.badRequest().body("ocorreu um erro: "+e.getMessage());
        }
    }
    //delete
    @DeleteMapping("/deleteproduto/{id}")
    public ResponseEntity<?> deleteproduto(@PathVariable("id") Long id, @RequestParam("userId") Long userId){
        try{
            this.produtoService.deleteProduto(id, userId);
            return ResponseEntity.ok().body("produto excluido com sucesso!");
        } catch(RuntimeException e){
            return ResponseEntity.badRequest().body("ocorreu um erro: "+e.getMessage());
        }
    }
    
}
