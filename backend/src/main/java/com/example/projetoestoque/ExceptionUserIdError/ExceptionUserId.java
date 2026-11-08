package com.example.projetoestoque.ExceptionUserIdError;

public class ExceptionUserId extends RuntimeException{
    public ExceptionUserId(){
        super("Id do usuario nao pode ser nulo.");
    }
}
