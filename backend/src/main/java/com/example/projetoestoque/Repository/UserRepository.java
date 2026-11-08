package com.example.projetoestoque.Repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.projetoestoque.Models.User;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.user_name = :userName")
    boolean boolByUserName(@Param("userName") String userName);

    // Retorna Optional<User> -> Usado no findBy para carregar o objeto User inteiro
    @Query("SELECT u FROM User u WHERE u.user_name = :userName")
    User findByUserName(@Param("userName") String userName);

}
