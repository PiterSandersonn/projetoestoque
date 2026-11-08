package com.example.projetoestoque.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.projetoestoque.Models.ItemVenda;
import com.example.projetoestoque.Repository.ItemVendaRepository;
import java.math.*;

@Service
public class ItemVendaService {

    @Autowired
    private ItemVendaRepository itemVendaRepository; 

    //Vamos settar o produto.
    public void createItemVenda(ItemVenda item){
        try{
            ItemVenda newItem = item;
            this.itemVendaRepository.save(newItem);    
        }catch(Exception e){
           throw new RuntimeException("Voce NAO passou o item corretamente.");
        }
    }
    

    public ItemVenda returnItemVenda(Long id){
        try{
            ItemVenda newItem = this.itemVendaRepository.findById(id).orElseThrow(()-> new RuntimeException("Produto nao encontardo"));
            return newItem;
        } catch(Exception e){
           throw new RuntimeException("Ocorreu um: "+e.getMessage());
        }
    }

    //update do ItemVenda ja que nao vamos ter o scanner, vamos colocar as cosias na mao.
    public ItemVenda updateItemVenda(Long id, BigDecimal novaQuantidade){
        try{
            ItemVenda newItem = this.returnItemVenda(id);
            newItem.setQuantidade(novaQuantidade);
            this.itemVendaRepository.save(newItem);

            return newItem;
        } catch(Exception e){
            throw new RuntimeException("Nao foi possivel atualizar esse produto.");
        }
    }
    
    //excluir o produto, por enquanto pode ser sem senha, mas mais pra frente somente com senha do user_sudo.
    public void excluirItem(Long id){
        try{
            ItemVenda newItem = this.returnItemVenda(id);
            this.itemVendaRepository.delete(newItem);
        } catch(Exception e){
            throw new RuntimeException("Ocorreu um erro ao deletar esse item da sua venda.");
        }
    }


    //ediatar quantidade, por enquanto pode ser sem senha, mas mais pra frente somente com senha do user_sudo.
    
}
