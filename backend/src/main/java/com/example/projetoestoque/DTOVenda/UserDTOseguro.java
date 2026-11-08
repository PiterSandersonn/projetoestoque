package com.example.projetoestoque.DTOVenda;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserDTOseguro {

    @NotBlank(message = "Senha nao pode ser vazia!")
    @Size(min= 8, max = 100, message = "Senha precisa ter entre 8 e 100 caracteries.")
    private String password;


    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    //Geramos esse DTO aqui, pq nao precisamos receber um User completo apenas para atualizar a senha do usuario. 
    
}
