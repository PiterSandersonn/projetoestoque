package com.example.projetoestoque.Services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.projetoestoque.DTOVenda.CancelarVendaDTO;
import com.example.projetoestoque.DTOVenda.DadosDTO;
import com.example.projetoestoque.DTOVenda.VendaDTO;
import com.example.projetoestoque.Enum.StatusCaixa;
import com.example.projetoestoque.Enum.StatusEnum;
import com.example.projetoestoque.Enum.TipoMovimentacao;
import com.example.projetoestoque.Enum.TipoVendaEnum;
import com.example.projetoestoque.Models.Caixa;
import com.example.projetoestoque.Models.ItemVenda;
import com.example.projetoestoque.Models.MovimentacaoEstoque;
import com.example.projetoestoque.Models.Produto;
import com.example.projetoestoque.Models.User;
import com.example.projetoestoque.Models.Venda;
import com.example.projetoestoque.Repository.CaixaRepository;
import com.example.projetoestoque.Repository.MovimentacaoRepository;
import com.example.projetoestoque.Repository.ProdutoRepository;
import com.example.projetoestoque.Repository.VendaRepository;

import jakarta.transaction.Transactional;


@Service 
public class VendaService {


    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired 
    private VendaRepository vendasRepository;

    @Autowired 
    private UserService userService;

    @Autowired 
    private CaixaRepository caixaRepository;

    @Autowired 
    private MovimentacaoRepository movimentacaoRepository;



    //create Venda
    @Transactional 
    public Venda createVenda(DadosDTO dados){
        // Validar se a lista esta completa. 
        if (dados == null){
            throw new RuntimeException("Os dados da venda nao podem ser nulos.");
        }
        if(dados.getUserId() == null){
            throw new RuntimeException("Usuario nao pode ser nulo. (UserId)");
        }
        if (dados.getPagamento() == null) {
            throw new RuntimeException("Forma de pagamento nao pode ser nula.");   
        }
        if(dados.getLista() == null|| dados.getLista().isEmpty()){
            throw new RuntimeException("A venda precisa conter pelo menos um item.");
        } 

        Long userId = dados.getUserId();
        User usuario = this.userService.findBy(userId);

        Venda venda = new Venda();
        Caixa caixa = this.caixaRepository.findByUserIdIdAndStatus(usuario.getId(), StatusCaixa.ABERTO).orElseThrow(()-> new RuntimeException("Esse usuario nao possui caixa aberto."));
        venda.setCaixa(caixa);
        venda.setId(null);
        venda.setPagamento(dados.getPagamento());
        venda.setStatusPagamento(StatusEnum.PAGO);
        venda.setuserId(usuario.getId());

        BigDecimal total = BigDecimal.ZERO;
       
        List<ItemVenda> itensVenda = new ArrayList<>();
        Set<Long> produtosUsados = new HashSet<>();
            
        for(VendaDTO item : dados.getLista()){
            if(item == null){
                 throw new RuntimeException("item nao pode ser nulo.");
            }
            if (item.getProdutoId() == null){
                throw new RuntimeException("O id do produto nao pode ser nullo.");  
            }

            if(item.getQuantidade() == null || item.getQuantidade().compareTo(BigDecimal.ZERO) <= 0){
                throw new RuntimeException("Quantidade precisa ser maior que zero!");
            }
            if(!produtosUsados.add(item.getProdutoId())){
                throw new RuntimeException("Nao podemos ter dois produtos iguais na mesma venda. Altere a quantidade, nao adcione o mesmo produto.");
            }
        

            Produto produto = this.produtoRepository.findById(item.getProdutoId()).orElseThrow(()-> new RuntimeException("Esse id que vc passou nao corresponde a nenhum produto cadastrado."));
            
            
            if(produto.getUser() == null|| produto.getUser().getId() == null|| !produto.getUser().getId().equals(userId)){
                throw new RuntimeException("Esse produto nao pertence ao usuario informado.");
            }
            if(produto.getQuantidade() == null){
                throw new RuntimeException("Quantidade do produto nao foi definida no estoque.");
            }
            if (item.getQuantidade().compareTo(produto.getQuantidade()) > 0) {
                throw new RuntimeException("Estoque insuaficiente: "+ produto.getQuantidade());
            }
            
            if(produto.getValor() == null){
                throw new RuntimeException("Valor do produto nao foi definido.");
            }
            if(produto.getTipoVenda() == null){
                throw new RuntimeException("Tipo venda nao pode ser nulo.");
            }
            if(produto.getTipoVenda() == TipoVendaEnum.UNIDADE && item.getQuantidade().stripTrailingZeros().scale() > 0){
                throw new RuntimeException("Produto vendido por unidade deve ter quantidade como um valor inteiro.");
            }



            BigDecimal valorUnitario = produto.getValor();
            

            BigDecimal subtotal = valorUnitario.multiply(item.getQuantidade()).setScale(2, RoundingMode.HALF_UP); 
            
            total = total.add(subtotal);

            BigDecimal estoqueAnterior = produto.getQuantidade();
            BigDecimal estoquePosterior = (estoqueAnterior).subtract(item.getQuantidade());
            produto.setQuantidade(estoquePosterior); // baixa por saida. 

            //aqui estamos dando baixa no estoque junto com a venda.
            this.produtoRepository.save(produto);

            //Agora vamos assinar a movimentacao. 
            MovimentacaoEstoque movimentacao = new MovimentacaoEstoque();
            movimentacao.setDataHora(LocalDateTime.now());
            movimentacao.setEstoqueAnterior(estoqueAnterior);
            movimentacao.setEstoquePosterior(estoquePosterior);
            movimentacao.setUsuario(usuario);            
            movimentacao.setProduto(produto);
            movimentacao.setQuantidade(item.getQuantidade());
            movimentacao.setMovimentacao(TipoMovimentacao.SAIDA_VENDA);
            this.movimentacaoRepository.save(movimentacao);

            ItemVenda itemVenda1 = new ItemVenda(
                produto,
                produto.getNome(),
                item.getQuantidade(),
                valorUnitario
            );

            itemVenda1.setVenda(venda);
            itensVenda.add(itemVenda1);
            
            
        }

        venda.setItens(itensVenda);
        venda.setTotal(total.setScale(2, RoundingMode.HALF_UP));

        return this.vendasRepository.save(venda);
    }

    // cancelar venda.

    @Transactional 
    public Venda cancelarVenda(CancelarVendaDTO dados){

         // Validar se a lista esta completa. 
        if (dados == null){
            throw new RuntimeException("Os dados da venda nao podem ser nulos.");
        }
        if( dados.getUserId() == null){
            throw new RuntimeException("Usuario nao pode ser nulo. (UserId)");
        }

        if(dados.getVendaId() == null){
            throw new RuntimeException("Id de venda nao pode ser nula.");   
        }

        Long userId = dados.getUserId(); // aqui 'e apenas o usuario que foi informado pelo front.
        User usuario = this.userService.findBy(userId);//Aqui estamos validando esse usuario no banco.


        Venda vendaExistente = vendasRepository.findById(dados.getVendaId()).orElseThrow(()-> new RuntimeException("Essa venda nao foi encontrada no banco de dados."));

        // Aqui vamos comecar a validacao da venda.

        if(vendaExistente.getCaixa() == null 
        || vendaExistente.getCaixa().getUserId() == null 
        || vendaExistente.getCaixa().getUserId().getId()== null 
        || !vendaExistente.getCaixa().getUserId().getId().equals(userId)){
            throw new RuntimeException("Somente o usuario que fez a venda pode cancelar. Ou seja, seu id nao corresponde ao vendedor que concluiu a venda.");
        }

        if(!vendaExistente.getStatusPagamento().equals(StatusEnum.PAGO)){
            throw new RuntimeException("Essa compra ja foi cancelada. "+vendaExistente.getId());
        }

        if(dados.getSenhaCancelamento() == null || dados.getSenhaCancelamento().isBlank()){
            throw new RuntimeException("Senha do cancelamento nao foi informada.");
        }

        if(!dados.getSenhaCancelamento().equals(usuario.getPassword())){
            throw new RuntimeException("A senha do cancelamento esta incorreta. Ela precisa corresponder a senha do usuario logado: "+usuario.getName());
        }

        

        if(vendaExistente.getItens() == null || vendaExistente.getItens().isEmpty()){
            throw new RuntimeException("nao tem nenhum item na lista da venda que voce passou." );
        }

        for(ItemVenda item : vendaExistente.getItens()){

            if(item == null || item.getProduto() == null){
                throw new RuntimeException("Item nao esta nao esta relacionado ao produto.");
            }

            Produto produto = item.getProduto();

            if(produto.getQuantidade() == null){
                throw new RuntimeException("Quantidade do produto nao foi definida no banco.");
            }

            if(item.getQuantidade() == null || BigDecimal.ZERO.compareTo(item.getQuantidade()) <= 0){
                throw new RuntimeException("Quantidade nao pode ser nula e deve ser superior a zero.");

            }

            BigDecimal estoqueAnterior = produto.getQuantidade();
            BigDecimal estoquePosterior = estoqueAnterior.add(item.getQuantidade());

            produto.setQuantidade(estoquePosterior);

            this.produtoRepository.save(produto);

            MovimentacaoEstoque movimentacao = new MovimentacaoEstoque();

            movimentacao.setDataHora(LocalDateTime.now());
            movimentacao.setEstoqueAnterior(estoqueAnterior);
            movimentacao.setEstoquePosterior(estoquePosterior);
            movimentacao.setProduto(produto);
            movimentacao.setUsuario(usuario);
            movimentacao.setMovimentacao(TipoMovimentacao.CANCELAMENTO);
            movimentacao.setQuantidade(item.getQuantidade());
            this.movimentacaoRepository.save(movimentacao);

        }

        vendaExistente.setStatusPagamento(StatusEnum.CANCELADO);
        return this.vendasRepository.save(vendaExistente);

    
    }

}
     

