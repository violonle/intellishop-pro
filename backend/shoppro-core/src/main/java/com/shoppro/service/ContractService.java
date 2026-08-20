package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Contract;
import java.util.List;

public interface ContractService {
    
    Page<Contract> list(int page, int size, String keyword, String status);
    
    Contract getById(Long id);
    
    Contract create(Contract contract);
    
    Contract update(Contract contract);
    
    boolean delete(Long id);
    
    List<Contract> getByCustomerId(Long customerId);
    
    List<Contract> getByLeadId(Long leadId);
}
