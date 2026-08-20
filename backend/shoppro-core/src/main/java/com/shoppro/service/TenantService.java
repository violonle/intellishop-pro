package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Enterprise;

/**
 * 租户（企业）服务接口
 */
public interface TenantService {
    Page<Enterprise> getTenantPage(int pageNo, int pageSize, String name, String status);

    Enterprise getTenantById(Long id);

    Enterprise createTenant(Enterprise tenant);

    Enterprise updateTenant(Long id, Enterprise tenant);

    void deleteTenant(Long id);
}
