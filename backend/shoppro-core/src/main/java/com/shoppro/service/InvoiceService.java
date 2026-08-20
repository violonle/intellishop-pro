package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Invoice;
import java.util.List;

public interface InvoiceService {
    
    Page<Invoice> list(int page, int size, String keyword, String status, String type);
    
    Invoice getById(Long id);
    
    Invoice create(Invoice invoice);
    
    Invoice update(Invoice invoice);
    
    boolean delete(Long id);
    
    List<Invoice> getByOrderId(Long orderId);
    
    List<Invoice> getByCustomerId(Long customerId);
    
    Invoice issueInvoice(Long id);
    
    Invoice cancelInvoice(Long id);
}
