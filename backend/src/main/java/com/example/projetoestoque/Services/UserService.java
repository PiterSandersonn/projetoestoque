package com.example.projetoestoque.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.projetoestoque.DTOVenda.LoginDTO;
import com.example.projetoestoque.Enum.TipoUsuarioEnum;
import com.example.projetoestoque.Models.User;
import com.example.projetoestoque.Repository.UserRepository;

import jakarta.transaction.Transactional;

@Service //sempre colocamos essas anotacoes quandoe stamos usando o spring-boot.
public class UserService {

    @Autowired 
    private UserRepository userRepository;


    //return: uam dica legal é a gente fazer o return antes do create. Pq quando formos fazer o cerate, podemos usar o return para validar se o usuario exeiste ou nao.
    public User findBy(Long id){
        if(id == null){
            throw new RuntimeException("Id nao pode ser nulo.");
        }

        User newUser = this.userRepository.findById(id).orElseThrow(()-> new RuntimeException("Usuario nao existente."));
        return newUser;
    }
    //create 
    @Transactional
    public void  createUser(User usuario){
        if(usuario == null){
            throw new RuntimeException("Usuario nao foi enviado!");
        }

        if(usuario.getUserName() == null || usuario.getUserName().isBlank()){
            throw new RuntimeException("O nome do usuario nao foi enviando!");
        }

        if(usuario.getPassword() == null || usuario.getPassword().isBlank()) {
            throw new RuntimeException("Senha nao pode ser nula.");
        }
        if(usuario.getName() == null){
            throw new RuntimeException("O nome de usuario nao pode ser nulo.");
        }
        if(usuario.getName().length() > 10){
            throw new RuntimeException("O nome de usuario deve ter ate 10 caracteries apenas.");
        }
        if(usuario.getName().length() < 4){
            throw new RuntimeException("O nome de usuario deve ter mais que 4 caracteries.");
        }
        if (this.userRepository.boolByUserName(usuario.getUserName())){
            throw new RuntimeException("Usuario existente! Tente outro.");
        }
       

        

        usuario.setId(null);

        usuario.setTipoUsuario(TipoUsuarioEnum.FUNCIONARIO);

        this.userRepository.save(usuario); 
    }
    
    //update
    @Transactional 
    public void updateUser(Long id, String password){
        User newUser = findBy(id); // Aqui ja retornamos um erro internamente.
        if(password == null || password.isBlank()){
            throw new RuntimeException("Senha nao pode ser nula.");
        }
        if(!password.equals(newUser.getPassword())){
            throw new RuntimeException("A senha esta incorreta!");
        }
        newUser.setPassword(password);
        this.userRepository.save(newUser);
    }
  
    //delete
    @Transactional
    public void deleteUser(Long id, String password){
        User newUser = this.findBy(id); // aqui tambem aj vamos retornar um erro internamente.
        if(password == null || password.isBlank()){
            throw new RuntimeException("Senha nao pode sre nula!");
        }
        if(!newUser.getPassword().equals(password)){
            throw new RuntimeException("A senha esta incorreta!");
        }
        this.userRepository.delete(newUser);
    } 

    //Login acessar.
    public User loginUser(LoginDTO dto){
        if(dto == null){
            throw new RuntimeException("Os dados nao foram eviandos. Envie os dados corretamente.");
        }
        if (dto.getUserName() == null || dto.getUserName().isBlank()){
            throw new RuntimeException("Nome do usuario nao pode ser nulo.");
        }
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new RuntimeException("Senha nao pode ser vazia.");
        }
        User newUser = this.userRepository.findByUserName(dto.getUserName());//Aqui ja estamos retornando um erro internamente.
        
        if(newUser == null){
            throw new RuntimeException("Usuario nao encontardo no banco de dados.");
        }

        if (!dto.getPassword().equals(newUser.getPassword())){
           throw new RuntimeException("Senha incorreta!"); 
        }

        return newUser; //se nao cair no erro, aqui retornamos um user.
        
    }
}