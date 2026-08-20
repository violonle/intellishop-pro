package com.shoppro.service.impl;

import com.shoppro.entity.Enterprise;
import com.shoppro.repository.EnterpriseRepository;
import com.shoppro.service.EnterpriseService;
import com.shoppro.service.DataScopeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 企业服务实现类
 */
@Service
public class EnterpriseServiceImpl implements EnterpriseService {

    private final EnterpriseRepository enterpriseRepository;
    private final DataScopeService dataScopeService;

    public EnterpriseServiceImpl(EnterpriseRepository enterpriseRepository, DataScopeService dataScopeService) {
        this.enterpriseRepository = enterpriseRepository;
        this.dataScopeService = dataScopeService;
    }

    @Override
    @Transactional
    public Enterprise submitCertification(Enterprise enterprise) {
        enterprise.setStatus(0); // 待审核
        if (enterprise.getId() == null) {
            enterpriseRepository.insert(enterprise);
        } else {
            enterpriseRepository.updateById(enterprise);
        }
        return enterprise;
    }

    @Override
    public Enterprise getCertificationStatus(Long enterpriseId) {
        assertAccessible(enterpriseId);
        return enterpriseRepository.selectById(enterpriseId);
    }

    @Override
    @Transactional
    public void updateAuditStatus(Long enterpriseId, Integer status, String reason) {
        Enterprise enterprise = enterpriseRepository.selectById(enterpriseId);
        if (enterprise != null) {
            enterprise.setStatus(status);
            enterprise.setRejectReason(reason);
            enterpriseRepository.updateById(enterprise);
        }
    }

    @Override
    public Enterprise getCurrent() {
        Long enterpriseId = dataScopeService.current().enterpriseId();
        return enterpriseId == null ? null : enterpriseRepository.selectById(enterpriseId);
    }

    @Override
    @Transactional
    public Enterprise updateCurrent(Enterprise enterprise) {
        Long enterpriseId = dataScopeService.current().enterpriseId();
        if (enterpriseId == null) throw new IllegalStateException("当前用户未绑定企业");
        enterprise.setId(enterpriseId);
        enterpriseRepository.updateById(enterprise);
        return enterpriseRepository.selectById(enterprise.getId());
    }

    private void assertAccessible(Long enterpriseId) {
        DataScopeService.Scope scope = dataScopeService.current();
        if (!scope.isAllScope() && (scope.enterpriseId() == null || !scope.enterpriseId().equals(enterpriseId))) {
            throw new SecurityException("无权访问其他企业");
        }
    }
}
