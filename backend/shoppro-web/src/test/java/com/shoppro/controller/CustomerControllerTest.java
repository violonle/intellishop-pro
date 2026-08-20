package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shoppro.dto.*;
import com.shoppro.entity.Customer;
import com.shoppro.exception.BusinessException;
import com.shoppro.exception.ResourceNotFoundException;
import com.shoppro.service.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.boot.ApplicationRunner;
import org.springframework.test.context.ActiveProfiles;

/**
 * 客户管理控制器集成测试
 * 
 * @author ShopPro Team
 * @version 1.0.0
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("客户管理 - 集成测试")
@ActiveProfiles("test")
@org.springframework.context.annotation.Import(com.shoppro.testconfig.TestRunnerOverrides.class)
public class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CustomerService customerService;

    @MockBean(name = "ddlApplicationRunner")
    private ApplicationRunner ddlApplicationRunner;

    private Customer testCustomer;
    private Page<Customer> pageResult;

    @BeforeEach
    public void setUp() {
        // 创建测试客户数据
        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setName("张三");
        testCustomer.setPhone("13800138000");
        testCustomer.setEmail("zhangsan@test.com");
        testCustomer.setWechat("zhangsan123");
        testCustomer.setGender("male");
        testCustomer.setAge(30);
        testCustomer.setBirthday(LocalDate.of(1994, 5, 15));
        testCustomer.setSource("线上");
        testCustomer.setLevel("vip");
        testCustomer.setStatus("active");
        testCustomer.setTags(Arrays.asList("意向客户", "高价值"));
        testCustomer.setAddress("北京市朝阳区");
        testCustomer.setCompany("某某公司");
        testCustomer.setPosition("经理");
        testCustomer.setAnnualIncome(new BigDecimal("500000.00"));
        testCustomer.setNotes("重点客户");
        testCustomer.setCreatedBy(1L);
        testCustomer.setAssignedTo(2L);
        testCustomer.setCreatedAt(LocalDateTime.now());
        testCustomer.setUpdatedAt(LocalDateTime.now());
        testCustomer.setDeleted(0);

        // 创建分页结果
        pageResult = new Page<>();
        pageResult.setRecords(Arrays.asList(testCustomer));
        pageResult.setCurrent(1);
        pageResult.setSize(10);
        pageResult.setTotal(1);
    }

    // ======================== CRUD测试 ========================

    @Test
    @DisplayName("获取客户列表 - 分页成功")
    @WithMockUser(roles = "ADMIN")
    public void testListCustomers_Success() throws Exception {
        when(customerService.listCustomers(1, 10, null, null))
                .thenReturn(pageResult);

        mockMvc.perform(get("/api/customers/list")
                .param("pageNo", "1")
                .param("pageSize", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("查询成功"))
                .andExpect(jsonPath("$.data.records", hasSize(1)))
                .andExpect(jsonPath("$.data.records[0].id").value(1))
                .andExpect(jsonPath("$.data.records[0].name").value("张三"));

        verify(customerService, times(1)).listCustomers(1, 10, null, null);
    }

    @Test
    @DisplayName("分页查询 - 带过滤条件")
    @WithMockUser(roles = "ADMIN")
    public void testListCustomers_WithFilter() throws Exception {
        when(customerService.listCustomers(1, 10, "active", "vip"))
                .thenReturn(pageResult);

        mockMvc.perform(get("/api/customers/list")
                .param("pageNo", "1")
                .param("pageSize", "10")
                .param("status", "active")
                .param("level", "vip")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(customerService, times(1)).listCustomers(1, 10, "active", "vip");
    }

    @Test
    @DisplayName("搜索客户 - 按关键词")
    @WithMockUser(roles = "ADMIN")
    public void testSearchCustomers_Success() throws Exception {
        when(customerService.searchCustomers("张三", 1, 10))
                .thenReturn(pageResult);

        mockMvc.perform(get("/api/customers/search")
                .param("keyword", "张三")
                .param("pageNo", "1")
                .param("pageSize", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("搜索成功"));

        verify(customerService, times(1)).searchCustomers("张三", 1, 10);
    }

    @Test
    @DisplayName("获取客户详情 - 存在")
    @WithMockUser(roles = "ADMIN")
    public void testGetCustomerDetail_Success() throws Exception {
        when(customerService.getCustomerDetail(1L))
                .thenReturn(testCustomer);

        mockMvc.perform(get("/api/customers/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("张三"))
                .andExpect(jsonPath("$.data.phone").value("13800138000"));

        verify(customerService, times(1)).getCustomerDetail(1L);
    }

    @Test
    @DisplayName("获取客户详情 - 不存在返回404")
    @WithMockUser(roles = "ADMIN")
    public void testGetCustomerDetail_NotFound() throws Exception {
        when(customerService.getCustomerDetail(999L))
                .thenReturn(null);

        mockMvc.perform(get("/api/customers/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.message").value("客户不存在"));
    }

    @Test
    @DisplayName("创建客户 - 成功")
    @WithMockUser(roles = "SALES")
    public void testCreateCustomer_Success() throws Exception {
        when(customerService.createCustomer(org.mockito.ArgumentMatchers.any(Customer.class)))
                .thenReturn(true);

        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCustomer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("创建成功"));

        verify(customerService, times(1)).createCustomer(org.mockito.ArgumentMatchers.any(Customer.class));
    }

    @Test
    @DisplayName("创建客户 - 权限不足")
    @WithMockUser(roles = "USER")
    public void testCreateCustomer_Forbidden() throws Exception {
        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCustomer)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("更新客户 - 成功")
    @WithMockUser(roles = "SALES")
    public void testUpdateCustomer_Success() throws Exception {
        testCustomer.setName("李四");
        when(customerService.updateCustomer(org.mockito.ArgumentMatchers.any(Customer.class)))
                .thenReturn(true);

        mockMvc.perform(put("/api/customers/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCustomer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("更新成功"));

        verify(customerService, times(1)).updateCustomer(org.mockito.ArgumentMatchers.any(Customer.class));
    }

    @Test
    @DisplayName("删除客户 - 成功")
    @WithMockUser(roles = "MANAGER")
    public void testDeleteCustomer_Success() throws Exception {
        when(customerService.deleteCustomer(1L))
                .thenReturn(true);

        mockMvc.perform(delete("/api/customers/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("删除成功"));

        verify(customerService, times(1)).deleteCustomer(1L);
    }

    @Test
    @DisplayName("删除客户 - 权限不足")
    @WithMockUser(roles = "SALES")
    public void testDeleteCustomer_Forbidden() throws Exception {
        mockMvc.perform(delete("/api/customers/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    // ======================== 分配测试 ========================

    @Test
    @DisplayName("分配客户 - 成功")
    @WithMockUser(roles = "MANAGER")
    public void testAssignCustomer_Success() throws Exception {
        when(customerService.assignCustomer(1L, 2L))
                .thenReturn(true);

        mockMvc.perform(post("/api/customers/1/assign")
                .param("userId", "2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("分配成功"));

        verify(customerService, times(1)).assignCustomer(1L, 2L);
    }

    @Test
    @DisplayName("批量分配客户 - 成功")
    @WithMockUser(roles = "MANAGER")
    public void testAssignCustomerBatch_Success() throws Exception {
        List<Long> customerIds = Arrays.asList(1L, 2L, 3L);
        when(customerService.assignCustomersBatch(customerIds, 2L))
                .thenReturn(true);

        mockMvc.perform(post("/api/customers/assign-batch")
                .param("userId", "2")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customerIds)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("批量分配成功"));

        verify(customerService, times(1)).assignCustomersBatch(customerIds, 2L);
    }

    // ======================== 查询特殊客户测试 ========================

    @Test
    @DisplayName("获取VIP客户列表")
    @WithMockUser(roles = "ADMIN")
    public void testGetVIPCustomers_Success() throws Exception {
        when(customerService.getVIPCustomers(1, 10))
                .thenReturn(pageResult);

        mockMvc.perform(get("/api/customers/vip")
                .param("pageNo", "1")
                .param("pageSize", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records", hasSize(1)));

        verify(customerService, times(1)).getVIPCustomers(1, 10);
    }

    @Test
    @DisplayName("获取活跃客户列表")
    @WithMockUser(roles = "ADMIN")
    public void testGetActiveCustomers_Success() throws Exception {
        when(customerService.getActiveCustomers(1, 10))
                .thenReturn(pageResult);

        mockMvc.perform(get("/api/customers/active")
                .param("pageNo", "1")
                .param("pageSize", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(customerService, times(1)).getActiveCustomers(1, 10);
    }

    // ======================== 统计和分析测试 ========================

    @Test
    @DisplayName("获取客户统计信息")
    @WithMockUser(roles = "ADMIN")
    public void testGetStatistics_Success() throws Exception {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCustomers", 100);
        stats.put("vipCount", 10);
        stats.put("activeCount", 80);
        stats.put("lostCount", 10);

        when(customerService.getCustomerStatistics())
                .thenReturn(stats);

        mockMvc.perform(get("/api/customers/statistics")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.totalCustomers").value(100))
                .andExpect(jsonPath("$.data.vipCount").value(10));

        verify(customerService, times(1)).getCustomerStatistics();
    }

    @Test
    @DisplayName("获取客户360视图")
    @WithMockUser(roles = "ADMIN")
    public void testGet360View_Success() throws Exception {
        Map<String, Object> view = new HashMap<>();
        view.put("customer", testCustomer);
        view.put("interactions", Arrays.asList("电话", "邮件"));
        view.put("purchases", Arrays.asList("产品A", "产品B"));
        view.put("tags", Arrays.asList("VIP", "高价值"));

        when(customerService.getCustomer360View(1L))
                .thenReturn(view);

        mockMvc.perform(get("/api/customers/1/360view")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.customer.id").value(1));

        verify(customerService, times(1)).getCustomer360View(1L);
    }

    // ======================== 客户等级和状态操作测试 ========================

    @Test
    @DisplayName("升级客户等级 - 成功")
    @WithMockUser(roles = "MANAGER")
    public void testUpgradeLevel_Success() throws Exception {
        when(customerService.upgradeCustomerLevel(1L, "diamond"))
                .thenReturn(true);

        mockMvc.perform(post("/api/customers/1/upgrade-level")
                .param("newLevel", "diamond")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("升级成功"));

        verify(customerService, times(1)).upgradeCustomerLevel(1L, "diamond");
    }

    @Test
    @DisplayName("标记客户为流失 - 成功")
    @WithMockUser(roles = "MANAGER")
    public void testMarkAsLost_Success() throws Exception {
        when(customerService.markAsLostCustomer(1L, "主动停止购买"))
                .thenReturn(true);

        mockMvc.perform(post("/api/customers/1/mark-lost")
                .param("reason", "主动停止购买")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("标记成功"));

        verify(customerService, times(1)).markAsLostCustomer(1L, "主动停止购买");
    }

    @Test
    @DisplayName("恢复流失客户 - 成功")
    @WithMockUser(roles = "MANAGER")
    public void testRecoverLost_Success() throws Exception {
        when(customerService.recoverLostCustomer(1L))
                .thenReturn(true);

        mockMvc.perform(post("/api/customers/1/recover")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("恢复成功"));

        verify(customerService, times(1)).recoverLostCustomer(1L);
    }

    // ======================== 错误处理测试 ========================

    @Test
    @DisplayName("创建客户 - 操作失败")
    @WithMockUser(roles = "SALES")
    public void testCreateCustomer_Failure() throws Exception {
        when(customerService.createCustomer(org.mockito.ArgumentMatchers.any(Customer.class)))
                .thenReturn(false);

        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCustomer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("创建失败"));
    }

    @Test
    @DisplayName("未认证用户访问受保护资源")
    public void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/customers/list")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("搜索客户 - 空关键词处理")
    @WithMockUser(roles = "ADMIN")
    public void testSearchCustomers_EmptyKeyword() throws Exception {
        when(customerService.searchCustomers("", 1, 10))
                .thenReturn(pageResult);

        mockMvc.perform(get("/api/customers/search")
                .param("keyword", "")
                .param("pageNo", "1")
                .param("pageSize", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    // ======================== 分页边界测试 ========================

    @Test
    @DisplayName("分页 - 第一页")
    @WithMockUser(roles = "ADMIN")
    public void testPagination_FirstPage() throws Exception {
        when(customerService.listCustomers(1, 10, null, null))
                .thenReturn(pageResult);

        mockMvc.perform(get("/api/customers/list")
                .param("pageNo", "1")
                .param("pageSize", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.current").value(1));
    }

    @Test
    @DisplayName("分页 - 指定页码")
    @WithMockUser(roles = "ADMIN")
    public void testPagination_SpecifiedPage() throws Exception {
        pageResult.setCurrent(2);
        when(customerService.listCustomers(2, 10, null, null))
                .thenReturn(pageResult);

        mockMvc.perform(get("/api/customers/list")
                .param("pageNo", "2")
                .param("pageSize", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("分页参数归一化 - 页码与页大小下限")
    @WithMockUser(roles = "ADMIN")
    public void testListCustomers_NormalizeLowerBounds() throws Exception {
        Page<Customer> localPage = new Page<>(1, 1);
        localPage.setRecords(Arrays.asList(testCustomer));
        localPage.setTotal(1);
        when(customerService.listCustomers(1, 1, null, null)).thenReturn(localPage);
    
        mockMvc.perform(get("/api/customers/list")
                .param("pageNo", "0")
                .param("pageSize", "0")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.current").value(1))
                .andExpect(jsonPath("$.data.size").value(1));
    
        verify(customerService, times(1)).listCustomers(1, 1, null, null);
    }

    @Test
    @DisplayName("分页参数归一化 - 页大小上限100")
    @WithMockUser(roles = "ADMIN")
    public void testListCustomers_ClampPageSizeUpperBound() throws Exception {
        Page<Customer> localPage = new Page<>(1, 100);
        localPage.setRecords(Arrays.asList(testCustomer));
        localPage.setTotal(1);
        when(customerService.listCustomers(1, 100, null, null)).thenReturn(localPage);
    
        mockMvc.perform(get("/api/customers/list")
                .param("pageNo", "1")
                .param("pageSize", "500")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.current").value(1))
                .andExpect(jsonPath("$.data.size").value(100));
    
        verify(customerService, times(1)).listCustomers(1, 100, null, null);
    }

    @Test
    @DisplayName("搜索分页参数归一化 - 页码与页大小")
    @WithMockUser(roles = "ADMIN")
    public void testSearchCustomers_NormalizePaginationParams() throws Exception {
        Page<Customer> localPage = new Page<>(1, 100);
        localPage.setRecords(Arrays.asList(testCustomer));
        localPage.setTotal(1);
        when(customerService.searchCustomers("vip", 1, 100)).thenReturn(localPage);
    
        mockMvc.perform(get("/api/customers/search")
                .param("keyword", "vip")
                .param("pageNo", "0")
                .param("pageSize", "1000")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("搜索成功"))
                .andExpect(jsonPath("$.data.current").value(1))
                .andExpect(jsonPath("$.data.size").value(100));
    
        verify(customerService, times(1)).searchCustomers("vip", 1, 100);
    }
}
