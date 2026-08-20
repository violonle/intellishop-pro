package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Contract;
import com.shoppro.repository.ContractRepository;
import com.shoppro.service.ContractService;
import com.shoppro.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;

    public ContractServiceImpl(ContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    @Override
    public Page<Contract> list(int page, int size, String keyword, String status) {
        LambdaQueryWrapper<Contract> wrapper = new LambdaQueryWrapper<>();
        
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w
                    .like(Contract::getTitle, keyword)
                    .or()
                    .like(Contract::getContractNo, keyword)
                    .or()
                    .like(Contract::getCustomerName, keyword)
            );
        }
        
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Contract::getStatus, status);
        }
        
        wrapper.orderByDesc(Contract::getCreatedAt);
        
        return contractRepository.selectPage(new Page<>(page, size), wrapper);
    }

    @Override
    public Contract getById(Long id) {
        return contractRepository.selectById(id);
    }

    @Override
    @Transactional
    public Contract create(Contract contract) {
        contract.setCreatedBy(SecurityUtils.getUserId());
        contract.setCreatedAt(LocalDateTime.now());
        contract.setUpdatedAt(LocalDateTime.now());
        
        String contractNo = generateContractNo();
        contract.setContractNo(contractNo);
        
        if (contract.getStatus() == null) {
            contract.setStatus("draft");
        }
        
        contractRepository.insert(contract);
        return contract;
    }

    @Override
    @Transactional
    public Contract update(Contract contract) {
        contract.setUpdatedAt(LocalDateTime.now());
        contractRepository.updateById(contract);
        return contract;
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        return contractRepository.deleteById(id) > 0;
    }

    @Override
    public List<Contract> getByCustomerId(Long customerId) {
        return contractRepository.selectList(
                new LambdaQueryWrapper<Contract>()
                        .eq(Contract::getCustomerId, customerId)
                        .orderByDesc(Contract::getCreatedAt)
        );
    }

    @Override
    public List<Contract> getByLeadId(Long leadId) {
        return contractRepository.selectList(
                new LambdaQueryWrapper<Contract>()
                        .eq(Contract::getLeadId, leadId)
                        .orderByDesc(Contract::getCreatedAt)
        );
    }

    private String generateContractNo() {
        String prefix = "CT";
        String date = java.time.LocalDate.now().toString().replace("-", "");
        String random = String.format("%04d", (int)(Math.random() * 10000));
        return prefix + date + random;
    }
}
