package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.shoppro.entity.Customer;
import com.shoppro.entity.Lead;
import com.shoppro.entity.LeadTransfer;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface LeadService extends IService<Lead> {

    Page<Lead> listLeads(int pageNo, int pageSize, Map<String, Object> filters);

    Page<Lead> searchLeads(String keyword, int pageNo, int pageSize);

    Lead getLeadDetail(Long id);

    Lead createLead(Lead lead, Long userId);

    Lead updateLead(Lead lead, Long updatedBy);

    boolean deleteLead(Long id);

    void assignLead(Long leadId, Long userId);

    void assignLeadsBatch(List<Long> leadIds, Long userId);

    Page<Lead> getLeadsByAssignee(Long userId, int pageNo, int pageSize);

    void updateLeadStatus(Long leadId, String status);

    Customer convertToCustomer(Long leadId, Long convertedBy);

    Customer convertToCustomer(Long leadId, Long convertedBy, Customer details);

    Map<String, Object> getLeadStatistics();

    List<Lead> getOverdueLeads();

    List<Lead> getHighValueLeads(BigDecimal threshold);

    void transferLead(Long leadId, Long toUserId, String reason, Long transferredBy);

    void transferLeadsBatch(List<Long> leadIds, Long toUserId, String reason, Long transferredBy);

    List<LeadTransfer> getLeadTransferHistory(Long leadId);

    LeadTransfer getLastTransfer(Long leadId);
}
