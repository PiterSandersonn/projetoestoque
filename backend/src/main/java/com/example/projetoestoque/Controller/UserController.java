package com.example.projetoestoque.Controller;

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

import com.example.projetoestoque.DTOVenda.LoginDTO;
import com.example.projetoestoque.Models.User;
import com.example.projetoestoque.Services.UserService;
import com.example.projetoestoque.UserDTO.UserDTOseguro;
import jakarta.validation.Valid;



@RestController 
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired 
    private UserService userService;

    //Create
    @PostMapping("/user/create")
    public ResponseEntity<?> createUser(@Valid @RequestBody User usuario){
        try{
            this.userService.createUser(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body("usuario criando com sucesso!");
        } catch(RuntimeException e){
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }  
    }
    //Return
    @GetMapping("/returnUser/{id}")
    public ResponseEntity<?> returnUser(@PathVariable("id") Long userId) {
        try {
            User newUser = this.userService.findBy(userId);
            return ResponseEntity.ok().body(newUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ocorreu um erro: "+e.getMessage());
        }
    }
    //Update
    @PutMapping("/updateUser/{id}")
    public ResponseEntity<?> updateUser(@PathVariable("id") Long userId,@Valid @RequestBody UserDTOseguro dto){
        try {
            this.userService.updateUser(userId, dto.getPassword());// aqui ja fazemos as verificacoes intrenamente.
            return ResponseEntity.ok().body("Senha alterada com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());// aqui é not found caso o user nao existir. Estamos fazendo essa verificacao de existencia dentro do metodo "updateUser".
        }
    }

    //Delete
    @DeleteMapping("/deleteUser/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id, @RequestParam String password){
        try {
            this.userService.deleteUser(id, password);// Aqui internamete ja estamos vendo se o user existe.
            return ResponseEntity.ok().body("Usuário deletado com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ocorreu um erro: "+e.getMessage());
        }
    }

    //LoginUser
    @PostMapping("/loginUser")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginDTO dto){
        try{
            User newUser = this.userService.loginUser(dto);
            return ResponseEntity.ok().body(newUser);
        } catch(RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    } 
}