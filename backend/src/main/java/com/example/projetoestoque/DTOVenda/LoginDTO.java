package com.example.projetoestoque.DTOVenda;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public class LoginDTO {

    @NotBlank(message = "Nome de usuario nao pode ser vazio!")
    @Size(min = 8, max = 60, message= "Nome precisa ter entre 8 e 60 digitos.")
    private String userName;

    @NotBlank(message= "A senha nao pode ser vazia!")
    @Size(min= 8, max = 100, message = "Senha precisa ter entre 8 e 100 caracteries.")
    private String password;

    public LoginDTO(){}


    public String getUserName() {
        return this.userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    
}
