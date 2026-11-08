package com.example.projetoestoque.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.math.*;

import com.example.projetoestoque.Models.ItemVenda;
import com.example.projetoestoque.Services.ItemVendaService;





@RestController 
@CrossOrigin(origins = "*")
public class ItemVendaController {

    @Autowired 
    private ItemVendaService itemVenda;

    //create
    @PostMapping("/createItemVenda/")
    public ResponseEntity<?> createItemVenda(@RequestBody ItemVenda item) {
        try {
            this.itemVenda.createItemVenda(item);
            return ResponseEntity.ok().body("Item criado com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }

    //return
    @GetMapping("/returnItemVenda/")
    public ResponseEntity<?> returnItemVenda(@RequestParam Long id) {
        try {
            ItemVenda newItem = itemVenda.returnItemVenda(id);
            return ResponseEntity.ok().body(newItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+ e.getMessage());
        }
    }
    //update
    @PutMapping("/updateItemVenda/")
    public ResponseEntity<?> updateItemVenda(@RequestParam Long id, @RequestParam BigDecimal novaQuantidade) {
        try {
            ItemVenda newItem = itemVenda.updateItemVenda(id, novaQuantidade);
            return ResponseEntity.ok().body(newItem); 
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }
    
    @DeleteMapping("/deleteItemVenda/")
    public ResponseEntity<?> deleteItemVenda(@RequestParam Long id){
        try {
            this.itemVenda.excluirItem(id);
            return ResponseEntity.ok().body("Produto excluido com sucesso!");
        } catch (RuntimeException e) {
            return  ResponseEntity.badRequest().body("Nao foi possivel excluir esse item!");
        }
    }

}
