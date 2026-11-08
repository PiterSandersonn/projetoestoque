package com.example.projetoestoque.Services;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.projetoestoque.Enum.TipoMovimentacao;
import com.example.projetoestoque.Models.MovimentacaoEstoque;
import com.example.projetoestoque.Models.Produto;
import com.example.projetoestoque.Models.User;
import com.example.projetoestoque.Repository.MovimentacaoRepository;
import com.example.projetoestoque.Repository.ProdutoRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional 
public class MovimentacaoEstoqueService {

     @Autowired 
     private UserService userService;

     @Autowired 
     private MovimentacaoRepository movimentacaoRepository;

     @Autowired 
     private ProdutoRepository produtoRepository;
     @Autowired 
     private ProdutoService produtoService;


     //Movimentacao entrada/ Cadastro de produtos inexistentes.
     public void movimentacaoCadastroEstoque(Long userId, List<Produto> produtos){
        if(userId == null){
            throw new RuntimeException("Id do usuario nao pode ser nulo.");
        }

        User usuario = this.userService.findBy(userId);

        if(produtos == null|| produtos.isEmpty()){
            throw new RuntimeException("A lista de produtos nao pode ser vazia.");  
        }

        for(Produto produto: produtos){
            
            if (produto == null) {
                throw new RuntimeException("Produto nao pode ser nulo.");
            }
            if(produto.getNome() == null || produto.getNome().isEmpty()){
                throw new RuntimeException("Nome do produto nao pode ser nulo nem vazio."+produto.getNome());
            }

            if(produto.getQuantidade() == null|| BigDecimal.ZERO.compareTo(produto.getQuantidade()) > 0){
                throw new RuntimeException("Quantidade nao pode ser nula nem inferior a zero."+produto.getNome());
            }

            if(produto.getCategoria() == null){
                throw new RuntimeException("Categoria do produto nao pode ser nula. "+produto.getNome());
            }

            if(produto.getValor() == null || produto.getValor().signum() <= 0){
                throw new RuntimeException("Valor do produto nao pode ser nulo, nem inferior a zero"+produto.getNome());
            }

            Produto item = this.produtoService.createProduto(produto, usuario.getId());
            
            MovimentacaoEstoque novaMovimentacao = new MovimentacaoEstoque();

            novaMovimentacao.setProduto(item);


            novaMovimentacao.setEstoqueAnterior(BigDecimal.ZERO);
            novaMovimentacao.setEstoquePosterior(item.getQuantidade());
            novaMovimentacao.setUsuario(usuario);
            novaMovimentacao.setMovimentacao(TipoMovimentacao.CADASTRO);
            novaMovimentacao.setDataHora(LocalDateTime.now());
            this.produtoRepository.save(item);
            this.movimentacaoRepository.save(novaMovimentacao);
        }
    }

    public void movimentacaoEstoqueEntrada(Long userId, List<Produto> produtos){
        if(userId == null){
            throw new RuntimeException("Id do usuario nao pode ser nulo.");
        }

        User usuario = this.userService.findBy(userId);

        if(produtos == null|| produtos.isEmpty()){
            throw new RuntimeException("A lista de produtos nao pode ser nula.");  
        }

        for(Produto produto: produtos){
            if (produto == null || produto.getId() == null) {
                throw new RuntimeException("Todos os produtos devem possuir um id.");
            }
            Produto item = this.produtoRepository.findById(produto.getId()).orElseThrow(()-> new RuntimeException("Esse produto nao existe no banco de dados: "+ produto.getNome()));
            
            MovimentacaoEstoque novaMovimentacao = new MovimentacaoEstoque();

            novaMovimentacao.setProduto(item);

            if(produto.getQuantidade() == null|| BigDecimal.ZERO.compareTo(produto.getQuantidade()) > 0){
                throw new RuntimeException("Quantidade nao pode ser nula nem inferior a zero."+ produto.getNome());
            }
            if(item.getQuantidade() == null){
                throw new RuntimeException("Item cadastrado no banco esta com quantidade nula: "+item.getNome());
            }
            novaMovimentacao.setEstoqueAnterior(item.getQuantidade());
            novaMovimentacao.setEstoquePosterior(item.getQuantidade().add(produto.getQuantidade()));
            novaMovimentacao.setUsuario(usuario);
            item.setQuantidade(item.getQuantidade().add(produto.getQuantidade()));
            novaMovimentacao.setMovimentacao(TipoMovimentacao.ENTRADA);
            novaMovimentacao.setDataHora(LocalDateTime.now());
            this.produtoRepository.save(item);
            this.movimentacaoRepository.save(novaMovimentacao);
        }

    }

    //SAIDA
    public void saidaEstoque(Long userId, List<Produto> produtos){
        if(userId == null){
            throw new RuntimeException("Id do usuario nao pode ser nulo.");
        }

        User usuario = this.userService.findBy(userId);

        if(produtos == null|| produtos.isEmpty()){
            throw new RuntimeException("A lista de produtos nao pode ser nula.");  
        }

        for(Produto produto: produtos){

            if (produto == null || produto.getId() == null) {
                throw new RuntimeException("Todos os produtos devem possuir um id.");
            }
            Produto item = this.produtoRepository.findById(produto.getId()).orElseThrow(()-> new RuntimeException("Esse produto nao existe no banco de dados: "+ produto.getNome()));
            MovimentacaoEstoque novaMovimentacao = new MovimentacaoEstoque();

            novaMovimentacao.setProduto(item);

            if(produto.getQuantidade() == null|| BigDecimal.ZERO.compareTo(produto.getQuantidade()) > 0){
                throw new RuntimeException("Quantidade nao pode ser nula nem in derio a zero."+ produto.getNome());
            }
            if(item.getQuantidade() == null){
                throw new RuntimeException("Item cadastrado no banco esta com quantidade nula: "+item.getNome());
            }
            if (produto.getQuantidade().compareTo(item.getQuantidade()) > 0) {
               throw new RuntimeException("A quantidade de produtos no estoque 'e insuficente a quantidade da saida."); 
            }
            novaMovimentacao.setEstoqueAnterior(item.getQuantidade());
            novaMovimentacao.setEstoquePosterior(item.getQuantidade().subtract(produto.getQuantidade()));
            novaMovimentacao.setUsuario(usuario);
            item.setQuantidade(item.getQuantidade().subtract(produto.getQuantidade()));
            novaMovimentacao.setMovimentacao(TipoMovimentacao.SAIDA_VENDA);
            novaMovimentacao.setDataHora(LocalDateTime.now());
            this.produtoRepository.save(item);
            this.movimentacaoRepository.save(novaMovimentacao);
        }
    }

    //CANCELAMENTO,
        public void cancelamentoEstoque(Long userId, List<Produto> produtos){
        if(userId == null){
            throw new RuntimeException("Id do usuario nao pode ser nulo.");
        }
        User usuario = this.userService.findBy(userId);

        if(produtos == null|| produtos.isEmpty()){
            throw new RuntimeException("A lista de produtos nao pode ser nula.");  
        }
        for(Produto produto: produtos){

            if (produto == null || produto.getId() == null) {
                throw new RuntimeException("Todos os produtos devem possuir um id.");
            }
            Produto item = this.produtoRepository.findById(produto.getId()).orElseThrow(()-> new RuntimeException("Esse produto nao existe no banco de dados: "+ produto.getNome()));
            MovimentacaoEstoque novaMovimentacao = new MovimentacaoEstoque();

            novaMovimentacao.setProduto(item);

            if(produto.getQuantidade() == null|| BigDecimal.ZERO.compareTo(produto.getQuantidade()) > 0){
                throw new RuntimeException("Quantidade nao pode ser nula nem inferior a zero."+ produto.getNome());
            }
            if(item.getQuantidade() == null){
                throw new RuntimeException("Item cadastrado no banco esta com quantidade nula: "+item.getNome());
            }

            novaMovimentacao.setEstoqueAnterior(item.getQuantidade());
            novaMovimentacao.setEstoquePosterior(item.getQuantidade().add(produto.getQuantidade()));
            novaMovimentacao.setUsuario(usuario);
            item.setQuantidade(item.getQuantidade().add(produto.getQuantidade()));
            novaMovimentacao.setMovimentacao(TipoMovimentacao.CANCELAMENTO);
            novaMovimentacao.setDataHora(LocalDateTime.now());
            this.produtoRepository.save(item);
            this.movimentacaoRepository.save(novaMovimentacao);
        }
    }
    
    //PERDA,
    public void perdaEstoque(Long userId, List<Produto> produtos){
        if(userId == null){
            throw new RuntimeException("Id do usuario nao pode ser nulo.");
        }
        User usuario = this.userService.findBy(userId);

        if(produtos == null|| produtos.isEmpty()){
            throw new RuntimeException("A lista de produtos nao pode ser nula.");  
        }

        for(Produto produto: produtos){

            if (produto == null || produto.getId() == null) {
                throw new RuntimeException("Todos os produtos devem possuir um id.");
            }
            Produto item = this.produtoRepository.findById(produto.getId()).orElseThrow(()-> new RuntimeException("Esse produto nao existe no banco de dados: "+ produto.getNome()));
            MovimentacaoEstoque novaMovimentacao = new MovimentacaoEstoque();

            novaMovimentacao.setProduto(item);

            if(produto.getQuantidade() == null|| BigDecimal.ZERO.compareTo(produto.getQuantidade()) > 0){
                throw new RuntimeException("Quantidade nao pode ser nula nem in derio a zero."+ produto.getNome());
            }
            if(item.getQuantidade() == null){
                throw new RuntimeException("Item cadastrado no banco esta com quantidade nula: "+item.getNome());
            }
            if (produto.getQuantidade().compareTo(item.getQuantidade()) > 0) {
               throw new RuntimeException("A quantidade de produtos no estoque 'e insuficente a quantidade da perda. Conte novamente."); 
            }
            novaMovimentacao.setEstoqueAnterior(item.getQuantidade());
            novaMovimentacao.setEstoquePosterior(item.getQuantidade().subtract(produto.getQuantidade()));
            novaMovimentacao.setUsuario(usuario);
            item.setQuantidade(item.getQuantidade().subtract(produto.getQuantidade()));
            novaMovimentacao.setMovimentacao(TipoMovimentacao.PERDA);
            novaMovimentacao.setDataHora(LocalDateTime.now());
            this.produtoRepository.save(item);
            this.movimentacaoRepository.save(novaMovimentacao);
        }

    }
    //DEVOLUCAO
    public void devolucaoEstoque(Long userId, List<Produto> produtos){
        if(userId == null){
            throw new RuntimeException("Id do usuario nao pode ser nulo.");
        }
        User usuario = this.userService.findBy(userId);

        if(produtos == null || produtos.isEmpty()){
            throw new RuntimeException("A lista de produtos nao pode ser nula.");  
        }

        for(Produto produto: produtos){
            if (produto == null || produto.getId() == null) {
                throw new RuntimeException("Todos os produtos devem possuir um id.");
            }
            Produto item = this.produtoRepository.findById(produto.getId()).orElseThrow(()-> new RuntimeException("Esse produto nao existe no banco de dados: "+ produto.getNome()));
            MovimentacaoEstoque novaMovimentacao = new MovimentacaoEstoque();
            novaMovimentacao.setProduto(item);
            
            if(produto.getQuantidade() == null|| BigDecimal.ZERO.compareTo(produto.getQuantidade()) > 0){
                throw new RuntimeException("Quantidade nao pode ser nula nem in derio a zero."+ produto.getNome());
            }
            if(item.getQuantidade() == null){
                throw new RuntimeException("Item cadastrado no banco esta com quantidade nula."+item.getNome());
            }
            novaMovimentacao.setEstoqueAnterior(item.getQuantidade());
            novaMovimentacao.setEstoquePosterior(item.getQuantidade().add(produto.getQuantidade()));
            novaMovimentacao.setUsuario(usuario);
            item.setQuantidade(item.getQuantidade().add(produto.getQuantidade()) );
            novaMovimentacao.setMovimentacao(TipoMovimentacao.DEVOLUCAO);
            novaMovimentacao.setDataHora(LocalDateTime.now());
            this.produtoRepository.save(item);
            this.movimentacaoRepository.save(novaMovimentacao);

        }
    }

    public List<MovimentacaoEstoque> retornoMovimentacao(Long userId){
        if (userId == null) {
            throw new RuntimeException("Id do usuario nao pode ser nulo.");
        }

        this.userService.findBy(userId); // Aqui ja vai retornar um erro caso user nao exista. 

        return this.movimentacaoRepository.findByUsuarioIdOrderByDataHoraDesc(userId);

    }



   }
