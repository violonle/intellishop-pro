package com.shoppro.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shoppro.entity.Customer;
import com.shoppro.entity.Lead;
import com.shoppro.repository.CustomerRepository;
import com.shoppro.repository.LeadRepository;
import com.shoppro.service.DataScopeService;
import com.shoppro.service.export.DataExportService;
import com.shoppro.util.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/export")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'SALES_DIRECTOR', 'SALES_MANAGER', 'MANAGER', 'SALES')")
public class DataExportController {

    private static final Logger log = LoggerFactory.getLogger(DataExportController.class);
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyyMMdd_HHmmss");

    private final DataExportService exportService;
    private final CustomerRepository customerRepository;
    private final LeadRepository leadRepository;
    private final DataScopeService dataScopeService;

    public DataExportController(DataExportService exportService, CustomerRepository customerRepository,
            LeadRepository leadRepository, DataScopeService dataScopeService) {
        this.exportService = exportService;
        this.customerRepository = customerRepository;
        this.leadRepository = leadRepository;
        this.dataScopeService = dataScopeService;
    }

    @GetMapping("/customers/excel")
    public ResponseEntity<byte[]> exportCustomersToExcel(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String level) throws Exception {

        log.info("导出客户数据到Excel: status={}, level={}", status, level);

        QueryWrapper<Customer> wrapper = new QueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq("status", status);
        }
        if (level != null && !level.isEmpty()) {
            wrapper.eq("level", level);
        }
        dataScopeService.applyCustomerScope(wrapper);
        List<Customer> customers = customerRepository.selectList(wrapper);

        List<Map<String, Object>> data = new ArrayList<>();
        for (Customer c : customers) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", c.getId());
            row.put("name", c.getName());
            row.put("phone", c.getPhone());
            row.put("email", c.getEmail());
            row.put("company", c.getCompany());
            row.put("status", c.getStatus());
            row.put("level", c.getLevel());
            row.put("source", c.getSource());
            row.put("address", c.getAddress());
            row.put("notes", c.getNotes());
            row.put("createdAt", c.getCreatedAt());
            data.add(row);
        }

        String[] headers = {"ID", "姓名", "电话", "邮箱", "公司", "状态", "等级", "来源", "地址", "备注", "创建时间"};
        String[] fields = {"id", "name", "phone", "email", "company", "status", "level", "source", "address", "notes", "createdAt"};

        byte[] content = exportService.exportToExcel(data, headers, fields, "客户数据");

        String fileName = "customers_" + DATE_FORMAT.format(new Date()) + ".xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodeFileName(fileName) + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
    }

    @GetMapping("/customers/csv")
    public ResponseEntity<byte[]> exportCustomersToCsv(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String level) throws Exception {

        log.info("导出客户数据到CSV: status={}, level={}", status, level);

        QueryWrapper<Customer> wrapper = new QueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq("status", status);
        }
        if (level != null && !level.isEmpty()) {
            wrapper.eq("level", level);
        }
        dataScopeService.applyCustomerScope(wrapper);
        List<Customer> customers = customerRepository.selectList(wrapper);

        List<Map<String, Object>> data = new ArrayList<>();
        for (Customer c : customers) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", c.getName());
            row.put("phone", c.getPhone());
            row.put("email", c.getEmail());
            row.put("company", c.getCompany());
            row.put("status", c.getStatus());
            row.put("level", c.getLevel());
            row.put("source", c.getSource());
            row.put("address", c.getAddress());
            row.put("notes", c.getNotes());
            data.add(row);
        }

        String[] headers = {"姓名", "电话", "邮箱", "公司", "状态", "等级", "来源", "地址", "备注"};
        String[] fields = {"name", "phone", "email", "company", "status", "level", "source", "address", "notes"};

        byte[] content = exportService.exportToCsv(data, headers, fields);
        content = new String(content, StandardCharsets.UTF_8).getBytes(StandardCharsets.UTF_8);

        String fileName = "customers_" + DATE_FORMAT.format(new Date()) + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodeFileName(fileName) + "\"")
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .body(content);
    }

    @PostMapping("/customers/import")
    public ResponseEntity<Map<String, Object>> importCustomers(@RequestParam("file") MultipartFile file) throws Exception {

        log.info("导入客户数据: 文件名={}, 大小={}", file.getOriginalFilename(), file.getSize());

        String filename = file.getOriginalFilename();
        if (filename == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "文件名不能为空"));
        }

        String[] fields = {"name", "phone", "email", "company", "status", "level", "source", "address", "notes"};

        List<Map<String, Object>> data;
        if (filename.toLowerCase().endsWith(".xlsx") || filename.toLowerCase().endsWith(".xls")) {
            data = exportService.parseExcel(file.getBytes(), fields, 1);
        } else if (filename.toLowerCase().endsWith(".csv")) {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            data = exportService.parseCsv(content, fields);
        } else {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "不支持的文件格式"));
        }

        int successCount = 0;
        int failCount = 0;
        List<String> errors = new ArrayList<>();
        Long currentUserId = SecurityUtils.getUserId();

        for (int i = 0; i < data.size(); i++) {
            try {
                Map<String, Object> row = data.get(i);
                String name = (String) row.get("name");
                String phone = (String) row.get("phone");

                if (name == null || name.trim().isEmpty()) {
                    errors.add("第" + (i + 2) + "行: 姓名不能为空");
                    failCount++;
                    continue;
                }

                Customer customer = new Customer();
                customer.setName(name.trim());
                customer.setPhone(phone != null ? phone.trim() : null);
                customer.setEmail((String) row.get("email"));
                customer.setCompany((String) row.get("company"));
                customer.setStatus(row.get("status") != null ? row.get("status").toString() : "active");
                customer.setLevel(row.get("level") != null ? row.get("level").toString() : "normal");
                customer.setSource((String) row.get("source"));
                customer.setAddress((String) row.get("address"));
                customer.setNotes((String) row.get("notes"));
                customer.setCreatedBy(currentUserId);
                customer.setEnterpriseId(currentEnterpriseId());
                if (dataScopeService.current().isSelfScope()) {
                    customer.setAssignedTo(currentUserId);
                }
                customer.setCreatedAt(LocalDateTime.now());

                customerRepository.insert(customer);
                successCount++;

            } catch (Exception e) {
                errors.add("第" + (i + 2) + "行: " + e.getMessage());
                failCount++;
            }
        }

        log.info("客户数据导入完成: 成功={}, 失败={}", successCount, failCount);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("total", data.size());
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("errors", errors.size() > 10 ? errors.subList(0, 10) : errors);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/customers/template")
    public ResponseEntity<byte[]> downloadCustomerTemplate(@RequestParam(defaultValue = "xlsx") String format) throws Exception {

        log.info("下载客户导入模板: format={}", format);

        String[] headers = {"姓名", "电话", "邮箱", "公司", "状态", "等级", "来源", "地址", "备注"};
        String[] fields = {"name", "phone", "email", "company", "status", "level", "source", "address", "notes"};

        byte[] content;
        String fileName;
        MediaType mediaType;

        if ("csv".equalsIgnoreCase(format)) {
            String template = exportService.generateTemplate(headers, fields, "csv");
            content = template.getBytes(StandardCharsets.UTF_8);
            fileName = "customer_import_template.csv";
            mediaType = MediaType.parseMediaType("text/csv;charset=UTF-8");
        } else {
            List<Map<String, Object>> sampleData = new ArrayList<>();
            Map<String, Object> sample = new LinkedHashMap<>();
            sample.put("name", "张三");
            sample.put("phone", "13800138000");
            sample.put("email", "zhangsan@example.com");
            sample.put("company", "示例公司");
            sample.put("status", "active");
            sample.put("level", "normal");
            sample.put("source", "网站");
            sample.put("address", "北京市朝阳区");
            sample.put("notes", "示例备注");
            sampleData.add(sample);

            content = exportService.exportToExcel(sampleData, headers, fields, "客户导入模板");
            fileName = "customer_import_template.xlsx";
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodeFileName(fileName) + "\"")
                .contentType(mediaType)
                .body(content);
    }

    @GetMapping("/leads/excel")
    public ResponseEntity<byte[]> exportLeadsToExcel(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String stage) throws Exception {

        log.info("导出线索数据到Excel: status={}, stage={}", status, stage);

        QueryWrapper<Lead> wrapper = new QueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq("status", status);
        }
        if (stage != null && !stage.isEmpty()) {
            wrapper.eq("stage", stage);
        }
        dataScopeService.applyLeadScope(wrapper);
        List<Lead> leads = leadRepository.selectList(wrapper);

        List<Map<String, Object>> data = new ArrayList<>();
        for (Lead l : leads) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", l.getId());
            row.put("title", l.getTitle());
            row.put("description", l.getDescription());
            row.put("source", l.getSource());
            row.put("status", l.getStatus());
            row.put("stage", l.getStage());
            row.put("priority", l.getPriority());
            row.put("estimatedValue", l.getEstimatedValue());
            row.put("successProbability", l.getSuccessProbability());
            row.put("assignedTo", l.getAssignedTo());
            row.put("createdAt", l.getCreatedAt());
            data.add(row);
        }

        String[] headers = {"ID", "标题", "描述", "来源", "状态", "阶段", "优先级", "预估价值", "成功概率", "分配给", "创建时间"};
        String[] fields = {"id", "title", "description", "source", "status", "stage", "priority", "estimatedValue", "successProbability", "assignedTo", "createdAt"};

        byte[] content = exportService.exportToExcel(data, headers, fields, "线索数据");

        String fileName = "leads_" + DATE_FORMAT.format(new Date()) + ".xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodeFileName(fileName) + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
    }

    @PostMapping("/leads/import")
    public ResponseEntity<Map<String, Object>> importLeads(@RequestParam("file") MultipartFile file) throws Exception {

        log.info("导入线索数据: 文件名={}, 大小={}", file.getOriginalFilename(), file.getSize());

        String filename = file.getOriginalFilename();
        if (filename == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "文件名不能为空"));
        }

        String[] fields = {"title", "description", "source", "status", "stage", "priority", "estimatedValue", "successProbability"};

        List<Map<String, Object>> data;
        if (filename.toLowerCase().endsWith(".xlsx") || filename.toLowerCase().endsWith(".xls")) {
            data = exportService.parseExcel(file.getBytes(), fields, 1);
        } else if (filename.toLowerCase().endsWith(".csv")) {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            data = exportService.parseCsv(content, fields);
        } else {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "不支持的文件格式"));
        }

        int successCount = 0;
        int failCount = 0;
        List<String> errors = new ArrayList<>();
        Long currentUserId = SecurityUtils.getUserId();

        for (int i = 0; i < data.size(); i++) {
            try {
                Map<String, Object> row = data.get(i);
                String title = (String) row.get("title");

                if (title == null || title.trim().isEmpty()) {
                    errors.add("第" + (i + 2) + "行: 标题不能为空");
                    failCount++;
                    continue;
                }

                Lead lead = new Lead();
                lead.setTitle(title.trim());
                lead.setDescription((String) row.get("description"));
                lead.setSource((String) row.get("source"));
                lead.setStatus(row.get("status") != null ? row.get("status").toString() : "new");
                lead.setStage(row.get("stage") != null ? row.get("stage").toString() : "prospecting");
                lead.setPriority(row.get("priority") != null ? row.get("priority").toString() : "normal");
                if (row.get("estimatedValue") != null) {
                    lead.setEstimatedValue(new java.math.BigDecimal(row.get("estimatedValue").toString()));
                }
                if (row.get("successProbability") != null) {
                    lead.setSuccessProbability(Integer.parseInt(row.get("successProbability").toString()));
                }
                lead.setCreatedBy(currentUserId);
                lead.setAssignedTo(currentUserId);
                lead.setEnterpriseId(currentEnterpriseId());
                lead.setCreatedAt(LocalDateTime.now());

                leadRepository.insert(lead);
                successCount++;

            } catch (Exception e) {
                errors.add("第" + (i + 2) + "行: " + e.getMessage());
                failCount++;
            }
        }

        log.info("线索数据导入完成: 成功={}, 失败={}", successCount, failCount);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("total", data.size());
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("errors", errors.size() > 10 ? errors.subList(0, 10) : errors);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/leads/template")
    public ResponseEntity<byte[]> downloadLeadTemplate(@RequestParam(defaultValue = "xlsx") String format) throws Exception {

        log.info("下载线索导入模板: format={}", format);

        String[] headers = {"标题", "描述", "来源", "状态", "阶段", "优先级", "预估价值", "成功概率"};
        String[] fields = {"title", "description", "source", "status", "stage", "priority", "estimatedValue", "successProbability"};

        byte[] content;
        String fileName;
        MediaType mediaType;

        if ("csv".equalsIgnoreCase(format)) {
            String template = exportService.generateTemplate(headers, fields, "csv");
            content = template.getBytes(StandardCharsets.UTF_8);
            fileName = "lead_import_template.csv";
            mediaType = MediaType.parseMediaType("text/csv;charset=UTF-8");
        } else {
            List<Map<String, Object>> sampleData = new ArrayList<>();
            Map<String, Object> sample = new LinkedHashMap<>();
            sample.put("title", "王五的采购需求");
            sample.put("description", "客户需要采购一批办公设备");
            sample.put("source", "线上推广");
            sample.put("status", "new");
            sample.put("stage", "prospecting");
            sample.put("priority", "normal");
            sample.put("estimatedValue", "50000");
            sample.put("successProbability", "30");
            sampleData.add(sample);

            content = exportService.exportToExcel(sampleData, headers, fields, "线索导入模板");
            fileName = "lead_import_template.xlsx";
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodeFileName(fileName) + "\"")
                .contentType(mediaType)
                .body(content);
    }

    private Long currentEnterpriseId() {
        if (SecurityUtils.getLoginUser() == null || SecurityUtils.getLoginUser().getUser() == null
                || SecurityUtils.getLoginUser().getUser().getEnterpriseId() == null) {
            throw new IllegalStateException("当前用户未绑定企业");
        }
        return SecurityUtils.getLoginUser().getUser().getEnterpriseId();
    }

    private String encodeFileName(String fileName) {
        try {
            return URLEncoder.encode(fileName, StandardCharsets.UTF_8.name()).replace("+", "%20");
        } catch (Exception e) {
            return fileName;
        }
    }
}
