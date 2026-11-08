package com.example.projetoestoque.Models;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.example.projetoestoque.Enum.TipoUsuarioEnum;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


@Entity
@Table(name= "usuarios")
public class User {

    public interface UpdatePassword{}
    public interface CreateUser{}

    @Id 
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "id", nullable= false)
    private Long id;

    @Column(name = "user_name", nullable= false, unique = true)
    @NotBlank(message = "Nome nao pode ser vazio.", groups = CreateUser.class)
    @Size(min = 8, max = 60, message= "Nome precisa ter entre 8 e 60 digitos.")
    private String user_name;

    @Column(name = "password", nullable = false)
    @NotBlank(message = "Senha nao pode ser vazio.", groups = {CreateUser.class, UpdatePassword.class})
    @Size(min= 8, max = 100, message = "Senha precisa ter entre 8 e 100 caracteries.")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_usuario", nullable = false)
    private TipoUsuarioEnum tipoUsuario;

    @Column(name = "name", nullable= false)
    @NotBlank(message = "Nao pode ser vazio. Coloque o nome que ser ser chamado.")
    @Size(min= 4, max = 10, message= "Nome deve ter entre 4 e 10 caracteries.")
    private String name;


    public User(){
        this.tipoUsuario = TipoUsuarioEnum.FUNCIONARIO;
    }

    @OneToMany(mappedBy="user")// Vai ser meio que, um para muitos, mapeado por "user".
    private List<Produto> produtos = new ArrayList<>();// entao quando criamos um user, sabemos que ele tera uma lista de produtos.


    public User(Long id, String userName,String name, String password, TipoUsuarioEnum tipoUsuario){
        this.id = id;
        this.password = password; 
        this.user_name = userName;
        this.name = name;
        this.tipoUsuario = TipoUsuarioEnum.FUNCIONARIO;
    }


    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserName() {
        return this.user_name;
    }

    public void setUserName(String userName) {
        this.user_name = userName;
    }

    @JsonProperty(access= JsonProperty.Access.WRITE_ONLY)
    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public TipoUsuarioEnum getTipoUsuario() {
        return this.tipoUsuario;
    }

    public void setTipoUsuario(TipoUsuarioEnum tipoUsuario) {
        this.tipoUsuario = tipoUsuario;
    }
    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (!(o instanceof User)) {
            return false;
        }

        User user = (User) o;

        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
}
