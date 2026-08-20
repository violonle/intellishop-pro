package com.shoppro.service;

import com.shoppro.entity.Enterprise;

/**
 * 企业服务接口
 */
public interface EnterpriseService {
    /**
     * 提交企业认证信息
     * 
     * @param enterprise 企业信息
     * @return 提交结果
     */
    Enterprise submitCertification(Enterprise enterprise);

    /**
     * 获取企业认证状态
     * 
     * @param enterpriseId 企业ID
     * @return 企业信息（包含状态）
     */
    Enterprise getCertificationStatus(Long enterpriseId);

    /**
     * 更新认证状态 (管理端使用)
     * 
     * @param enterpriseId 企业ID
     * @param status       状态
     * @param reason       理由
     */
    void updateAuditStatus(Long enterpriseId, Integer status, String reason);

    /**
     * 获取当前企业信息
     * 
     * @return 企业信息
     */
    Enterprise getCurrent();

    /**
     * 更新当前企业信息
     * 
     * @param enterprise 企业信息
     * @return 更新后的企业信息
     */
    Enterprise updateCurrent(Enterprise enterprise);
}
