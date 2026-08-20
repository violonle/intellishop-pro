package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Enterprise;
import com.shoppro.repository.EnterpriseRepository;
import com.shoppro.service.TenantService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantServiceImpl implements TenantService {

    private final EnterpriseRepository enterpriseRepository;

    public TenantServiceImpl(EnterpriseRepository enterpriseRepository) {
        this.enterpriseRepository = enterpriseRepository;
    }

    @Override
    public Page<Enterprise> getTenantPage(int pageNo, int pageSize, String name, String status) {
        Page<Enterprise> page = new Page<>(pageNo, pageSize);
        QueryWrapper<Enterprise> queryWrapper = new QueryWrapper<>();
        if (name != null && !name.isEmpty()) {
            queryWrapper.like("name", name);
        }
        if (status != null && !status.isEmpty()) {
            // Map string status to integer if needed, but for now assuming it's direct or
            // handled by frontend
            // In Enterprise entity, status is Integer (0, 1, 2)
        }
        return enterpriseRepository.selectPage(page, queryWrapper);
    }

    @Override
    public Enterprise getTenantById(Long id) {
        return enterpriseRepository.selectById(id);
    }

    @Override
    @Transactional
    public Enterprise createTenant(Enterprise tenant) {
        enterpriseRepository.insert(tenant);
        return tenant;
    }

    @Override
    @Transactional
    public Enterprise updateTenant(Long id, Enterprise tenant) {
        tenant.setId(id);
        enterpriseRepository.updateById(tenant);
        return tenant;
    }

    @Override
    @Transactional
    public void deleteTenant(Long id) {
        enterpriseRepository.deleteById(id);
    }
}
