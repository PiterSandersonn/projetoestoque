package com.example.projetoestoque.Services;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.projetoestoque.DTOVenda.CaixaFecharDTO;
import com.example.projetoestoque.Enum.FormaPagamentoEnum;
import com.example.projetoestoque.Enum.StatusCaixa;
import com.example.projetoestoque.Enum.StatusEnum;
import com.example.projetoestoque.Models.Caixa;
import com.example.projetoestoque.Models.User;
import com.example.projetoestoque.Repository.CaixaRepository;
import com.example.projetoestoque.Repository.VendaRepository;

import jakarta.transaction.Transactional;

@Service 
public class CaixaService {
    @Autowired
    private UserService userService;
    @Autowired 
    private CaixaRepository caixaRepository;
    @Autowired 
    private VendaRepository vendaRepository;

    // Abrir caixa
    @Transactional
    public Caixa abrirCaixa(BigDecimal valor, Long userId){
        if(userId == null){
            throw new RuntimeException("Id do usuario nao pode ser vazio.");
        }
        User usuario = this.userService.findBy(userId); // so para depois eu assinar que ele 'e o responsavel pela venda.
        if(valor == null || valor.compareTo(BigDecimal.ZERO) < 0){
            throw new RuntimeException("Valor nao pode ser vazio e precisa ser maiorou igual que zero.");
        }
        if (this.caixaRepository.findByUserIdIdAndStatus(userId, StatusCaixa.ABERTO).isPresent()){
            throw new RuntimeException("Esse usuario ja possui um caixa aberto.");
        }
        Caixa caixa = new Caixa();
        caixa.setValorInicial(valor);
        caixa.setHorarioAbertura(LocalDateTime.now()); // O horario exato do computador hospedeiro.
        caixa.setStatus(StatusCaixa.ABERTO);

        caixa.setUserId(usuario); // Aqui estamos assinando quem 'e o usuario resposavel pela venda.
        return this.caixaRepository.save(caixa);

    }

    @Transactional 
    public Caixa fecharCaixa(CaixaFecharDTO dto, Long caixaId){
        if(caixaId == null){
            throw new RuntimeException("O id do caixa nao foi informado.");
        }
        if(dto == null){
            throw new RuntimeException("Os dados do fechamento nao foram informado.");

        }
        if(dto.getValorInformado() == null || dto.getValorInformado().compareTo(BigDecimal.ZERO) < 0){
            throw new RuntimeException("Valor do caixa nao pode ser negativo.");
        }
        Caixa newCaixa = this.caixaRepository.findById(caixaId).orElseThrow(()->new RuntimeException("Caixa nao existente."));

        if(newCaixa.getStatus() != StatusCaixa.ABERTO){
            throw new RuntimeException("Esse caixa ja esta fechado: "+ newCaixa.getHorarioFechamento()+ "<-- Essa foi a data e hora.");
        }
        
        BigDecimal totalDinheiro = this.vendaRepository.somarVendasDoCaixa(newCaixa.getId(), FormaPagamentoEnum.DINHEIRO, StatusEnum.PAGO);
        if(totalDinheiro == null){
            totalDinheiro = BigDecimal.ZERO;
        }
        BigDecimal valorEsperado = newCaixa.getValorInicial().add(totalDinheiro);

        BigDecimal diferenca = dto.getValorInformado().subtract(valorEsperado);

        newCaixa.setDiferenca(diferenca);
        newCaixa.setValorEsperado(valorEsperado);
        newCaixa.setValorContado(dto.getValorInformado());
        

        newCaixa.setHorarioFechamento(LocalDateTime.now());

        newCaixa.setStatus(StatusCaixa.FECHADO);

        return this.caixaRepository.save(newCaixa);

    }

    public Caixa bucarCaixaAberto(Long userId){
        if(userId == null){
            throw new RuntimeException("Precisa passar o id do usuario.");
        }
        User usuario = userService.findBy(userId);

        return this.caixaRepository.findByUserIdIdAndStatus(usuario.getId(), StatusCaixa.ABERTO).orElse(null);
            
        }
    
}
  
