package com.example.projetoestoque.Services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.projetoestoque.Enum.TipoMovimentacao;
import com.example.projetoestoque.Enum.TipoVendaEnum;
import com.example.projetoestoque.ExceptionUserIdError.ExceptionUserId;
import com.example.projetoestoque.Models.MovimentacaoEstoque;
import com.example.projetoestoque.Models.Produto;
import com.example.projetoestoque.Models.User;
import com.example.projetoestoque.Repository.MovimentacaoRepository;
import com.example.projetoestoque.Repository.ProdutoRepository;

@Service
public class ProdutoService {

    @Autowired 
    private ProdutoRepository produtoRepository;

    @Autowired
    private UserService userService;
    
    @Autowired
    private MovimentacaoRepository movimentacaoRepository;




    //create
    public Produto createProduto(Produto produto, Long userId ){
        if(userId == null){
            throw new ExceptionUserId();
            // Eu nao sei se tyenho que validar algo de independe do usuario.
        }

        User newUser = this.userService.findBy(userId); // aqui ja vamos estar retornando um erro caso o user nao exista.

        if(produto == null){
            throw new RuntimeException("Produto nao pode ser nulo.");
        }
        if (produto.getNome() == null
                ||produto.getNome().isBlank()
                ||produto.getQuantidade() == null
                ||produto.getValor() == null
                ||produto.getCategoria() == null
                ||produto.getMarca() == null
                || produto.getMarca().isBlank()
                || produto.getTipoVenda() == null) {

            throw new RuntimeException("O produto nao esta com todos os campos preenchidos.");
        }

        if(produto.getValor().compareTo(BigDecimal.ZERO) <=0){//Esse compareTo com BigDecimal.zero pode nos dar 3 valores, menor que zero(negativo), igual a zero(normal), superior a zero(positivo.)
            //Ai temos que fazer a validacao depois(inferio ou igual a zero.)
            throw new RuntimeException("Valor nao pode ser menor ou igual a zero");
        }
        if(produto.getQuantidade().compareTo(BigDecimal.ZERO) <= 0 ){
            throw new RuntimeException("Quantiade nao pode ser negativa.");
        }
        if(produto.getTipoVenda() == TipoVendaEnum.PESO && produto.getCodigo() == null){
            throw new RuntimeException("produtos vendidos por peso necessitam de codigo para que possam ser viddos por fracoes.");
        }
        if(produto.getTipoVenda() == TipoVendaEnum.PESO && produto.getCodigo() <= 0){
            throw new RuntimeException("O codigo deve ser superior a zero.");
        }
        
        List<Produto> Existentes = this.produtoRepository.findByUserId(userId);

        for(Produto product : Existentes){
            if(product.getCategoria() == (produto.getCategoria()) && product.getNome().equalsIgnoreCase(produto.getNome()) && product.getMarca().equalsIgnoreCase(produto.getMarca())){
                throw new RuntimeException("Esse produto ja existe.");
            }
            if(produto.getTipoVenda() == TipoVendaEnum.PESO && produto.getCodigo() != null && product.getCodigo()!= null && product.getCodigo().equals(produto.getCodigo())){
                throw new RuntimeException("Esse codigo ja esta cadastrado em outro produto.");
            }

        }


        produto.setId(null);
        produto.setUser(newUser);

        Produto newproduct = this.produtoRepository.save(produto); //Se passar pelas validacoes, ai ele salva.

        MovimentacaoEstoque movimentacao = new MovimentacaoEstoque();
        movimentacao.setDataHora(LocalDateTime.now());
        movimentacao.setEstoqueAnterior(BigDecimal.ZERO);
        movimentacao.setEstoquePosterior(newproduct.getQuantidade());
        movimentacao.setProduto(newproduct);
        movimentacao.setUsuario(newUser);
        movimentacao.setMovimentacao(TipoMovimentacao.ENTRADA);
        movimentacao.setQuantidade(newproduct.getQuantidade());
        this.movimentacaoRepository.save(movimentacao);

        return newproduct;
    }

    //return
    public Produto returnProduto(Long id){
        if(id == null){
            throw new RuntimeException("Id do produto nao pode ser nulo.");
        }
        Produto newProduct = this.produtoRepository.findById(id).orElseThrow(()-> new RuntimeException("produto nao existente.")); 
        return newProduct; // O meu return esta diretamente ligado com o que retorno para o front. Quando é assim, precisamos mesmo retornar o produto inteiro. Isso vai facilitar no nosso proximo metodo aqui (update).
    }
    //return List<Produto>
    public List<Produto> returnListaProdutos(Long userId, String busca){
        if(userId == null){
            throw new ExceptionUserId();
        }
        User newUser = this.userService.findBy(userId); // aqui ja retornamos um erro internamente desse metodo do userService.
        if(busca != null && !busca.trim().isEmpty()){
            List<Produto> produtos = this.produtoRepository.buscarPorNomeOuCategoria(userId, busca);
            return produtos;
        }

        List<Produto> ListProduct = this.produtoRepository.findByUserId(newUser.getId()); // Nao precisamos tratar quando 'e lista pq o findBy ja vai retornar uma lista vazia, caso ela nao tenha nada.
        return  ListProduct;
    }


    //update 
    public void updateProduto(Produto produto, Long userId){
        if(userId == null){
          throw new ExceptionUserId();
        }

        User newUser = this.userService.findBy(userId);// aqui ja vamos retornar erro tambem.

        if(produto == null){
            throw new RuntimeException("Produto nao pode ser nulo.");
        }
        if(produto.getId() == null){
            throw new RuntimeException("Id do produto nao pode ser nulo.");
        }
        if(produto.getNome() == null
            ||produto.getNome().isBlank()
            ||produto.getCategoria() == null
            ||produto.getValor() == null
            ||produto.getQuantidade() == null
            ||produto.getTipoVenda() == null
            ||produto.getMarca() == null
            ||produto.getMarca().isBlank()){
               throw new RuntimeException("Necessario preencher todos os campos do produto.");
            }
        if(produto.getQuantidade().compareTo(BigDecimal.ZERO) <= 0){
            throw new RuntimeException("Quantidade nao pode ser negativa.");
        }
        if(produto.getValor().compareTo(BigDecimal.ZERO) <= 0){
            throw new RuntimeException("Valor deve ser superior a zero!");
        }
        if(produto.getTipoVenda() == TipoVendaEnum.PESO && produto.getCodigo() == null){
            throw new RuntimeException("produtos vendidos por peso necessitam de codigo para que possam ser viddos por fracoes.");
        }

        if(produto.getTipoVenda() == TipoVendaEnum.PESO && produto.getCodigo() <= 0){
            throw new RuntimeException("O codigo deve ser superior a zero.");
        }


        Produto newProduct = this.returnProduto(produto.getId());// Estamos verificando se o produto realmente existe, ja que é um update.

        BigDecimal quantidade = newProduct.getQuantidade();

        if(newProduct.getUser() == null || !newProduct.getUser().getId().equals(newUser.getId())){
            throw new RuntimeException("Esse id nao pode acessar produtos de outros usuarios, senao os seus mesmos.");
        }
        
        List<Produto> ListProduct = this.produtoRepository.findByUserId(newUser.getId());

        for(Produto item : ListProduct){
            boolean mesmoProduto = item.getId().equals(newProduct.getId());//Aqui 'e o seguinte, se 'e o mesmo Id, 'e o mesmo produto e pode continuar com o mesmo nome
            // Agora se for outro Id(lembrando que o Id 'e gerado na CRIACAO de um produto, entao nao posso ter dois produtos com o mesmo nome ou categria.)
            if(!mesmoProduto && item.getMarca().equalsIgnoreCase(produto.getMarca()) && item.getNome().equalsIgnoreCase(produto.getNome())
                && item.getCategoria().equals(produto.getCategoria())){
                    throw new RuntimeException("Ja existe outro produto com o mesmo nome, categoria ou codigo. Edite ele!");
            }
            if(!mesmoProduto && item.getCodigo() != null && item.getCodigo().equals(produto.getCodigo())){
                throw new RuntimeException("Esse codigo aj esta cadastrado em outro produto.");
            }
        }

        newProduct.setNome(produto.getNome().trim());
        newProduct.setMarca(produto.getMarca().trim());
        newProduct.setQuantidade(produto.getQuantidade());
        newProduct.setCodigo(produto.getCodigo());
        newProduct.setValor(produto.getValor());
        newProduct.setCategoria(produto.getCategoria());
        newProduct.setTipoVenda(produto.getTipoVenda());

        
        Produto produtoSalvo = this.produtoRepository.save(newProduct); // Estamos salvando o prduto inteiro, pq o front nos retorna ele inteiro ja. Ao inves de ficar slavando campo por campo, a gente salva ele completo em um so comando.
        
        MovimentacaoEstoque movimentacao = new MovimentacaoEstoque();
        movimentacao.setDataHora(LocalDateTime.now());
        movimentacao.setEstoqueAnterior(quantidade);
        movimentacao.setEstoquePosterior(produtoSalvo.getQuantidade());
        movimentacao.setMovimentacao(TipoMovimentacao.ATUALIZACAO);
        movimentacao.setUsuario(newUser);
        movimentacao.setProduto(produtoSalvo);
        movimentacao.setQuantidade(produtoSalvo.getQuantidade());
        movimentacaoRepository.save(movimentacao);
        
    }

    //delete 
    public void deleteProduto(Long id, Long userId){
        if(userId == null){
            throw new ExceptionUserId();
        }
        User newUser = this.userService.findBy(userId);   

        if(id == null){
            throw new RuntimeException("Id do produto nao pode ser nulo.");
        }

        Produto newProduct = this.returnProduto(id); //Isso aqui te der dois Ids ate pode parecer chato, mas o front-end ja vai envciar tudo isso no meu requestBody, entao ja aproveito para fazer a "seguranca".
        if(newProduct.getUser() == null || !newProduct.getUser().getId().equals(newUser.getId())){
            throw new RuntimeException("Esse produto so pode ser deletado pelo usuario criador do mesmo.");
        }
        this.produtoRepository.delete(newProduct);
    }

}
