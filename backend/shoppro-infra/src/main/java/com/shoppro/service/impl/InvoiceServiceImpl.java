package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Invoice;
import com.shoppro.repository.InvoiceRepository;
import com.shoppro.service.InvoiceService;
import com.shoppro.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public InvoiceServiceImpl(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    public Page<Invoice> list(int page, int size, String keyword, String status, String type) {
        LambdaQueryWrapper<Invoice> wrapper = new LambdaQueryWrapper<>();
        
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w
                    .like(Invoice::getInvoiceNo, keyword)
                    .or()
                    .like(Invoice::getCustomerName, keyword)
                    .or()
                    .like(Invoice::getTitle, keyword)
            );
        }
        
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Invoice::getStatus, status);
        }
        
        if (type != null && !type.isEmpty()) {
            wrapper.eq(Invoice::getType, type);
        }
        
        wrapper.orderByDesc(Invoice::getCreatedAt);
        
        return invoiceRepository.selectPage(new Page<>(page, size), wrapper);
    }

    @Override
    public Invoice getById(Long id) {
        return invoiceRepository.selectById(id);
    }

    @Override
    @Transactional
    public Invoice create(Invoice invoice) {
        invoice.setCreatedBy(SecurityUtils.getUserId());
        invoice.setCreatedAt(LocalDateTime.now());
        invoice.setUpdatedAt(LocalDateTime.now());
        
        String invoiceNo = generateInvoiceNo();
        invoice.setInvoiceNo(invoiceNo);
        
        if (invoice.getStatus() == null) {
            invoice.setStatus("draft");
        }
        
        if (invoice.getType() == null) {
            invoice.setType("vat");
        }
        
        invoiceRepository.insert(invoice);
        return invoice;
    }

    @Override
    @Transactional
    public Invoice update(Invoice invoice) {
        invoice.setUpdatedAt(LocalDateTime.now());
        invoiceRepository.updateById(invoice);
        return invoice;
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        return invoiceRepository.deleteById(id) > 0;
    }

    @Override
    public List<Invoice> getByOrderId(Long orderId) {
        return invoiceRepository.selectList(
                new LambdaQueryWrapper<Invoice>()
                        .eq(Invoice::getOrderId, orderId)
                        .orderByDesc(Invoice::getCreatedAt)
        );
    }

    @Override
    public List<Invoice> getByCustomerId(Long customerId) {
        return invoiceRepository.selectList(
                new LambdaQueryWrapper<Invoice>()
                        .eq(Invoice::getCustomerId, customerId)
                        .orderByDesc(Invoice::getCreatedAt)
        );
    }

    @Override
    @Transactional
    public Invoice issueInvoice(Long id) {
        Invoice invoice = invoiceRepository.selectById(id);
        if (invoice == null) {
            throw new IllegalArgumentException("发票不存在");
        }
        
        if (!"draft".equals(invoice.getStatus())) {
            throw new IllegalStateException("只有草稿状态的发票可以开具");
        }
        
        invoice.setStatus("issued");
        invoice.setIssueDate(java.time.LocalDate.now());
        invoice.setUpdatedAt(LocalDateTime.now());
        
        invoiceRepository.updateById(invoice);
        return invoice;
    }

    @Override
    @Transactional
    public Invoice cancelInvoice(Long id) {
        Invoice invoice = invoiceRepository.selectById(id);
        if (invoice == null) {
            throw new IllegalArgumentException("发票不存在");
        }
        
        if ("cancelled".equals(invoice.getStatus())) {
            throw new IllegalStateException("发票已取消");
        }
        
        invoice.setStatus("cancelled");
        invoice.setUpdatedAt(LocalDateTime.now());
        
        invoiceRepository.updateById(invoice);
        return invoice;
    }

    private String generateInvoiceNo() {
        String prefix = "INV";
        String date = java.time.LocalDate.now().toString().replace("-", "");
        String random = String.format("%05d", (int)(Math.random() * 100000));
        return prefix + date + random;
    }
}
