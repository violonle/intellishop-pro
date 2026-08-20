package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Customer;
import com.shoppro.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 客户服务层单元测试
 * 
 * @author ShopPro Team
 * @version 1.0.0
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("客户管理 - 服务层测试")
@org.springframework.context.annotation.Import(com.shoppro.testconfig.TestRunnerOverrides.class)
public class CustomerServiceTest {

    @MockBean(name = "ddlApplicationRunner")
    private ApplicationRunner ddlApplicationRunner;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Customer testCustomer;

    @BeforeEach
    public void setUp() {
        // 每个测试前清空数据，保证测试间互不影响
        jdbcTemplate.execute("DELETE FROM customers");
        
        // 创建测试客户
        testCustomer = new Customer();
        testCustomer.setName("李四");
        testCustomer.setPhone("13900139000");
        testCustomer.setEmail("lisi@test.com");
        testCustomer.setWechat("lisi123");
        testCustomer.setGender("female");
        testCustomer.setAge(28);
        testCustomer.setBirthday(java.time.LocalDate.of(1996, 3, 20));
        testCustomer.setSource("线上");
        testCustomer.setLevel("normal");
        testCustomer.setStatus("potential");
        testCustomer.setAddress("上海市浦东区");
        testCustomer.setCompany("科技公司");
        testCustomer.setPosition("经理");
        testCustomer.setAnnualIncome(new java.math.BigDecimal("300000.00"));
        testCustomer.setNotes("潜在客户");
        testCustomer.setCreatedBy(1L);
        testCustomer.setAssignedTo(2L);
        testCustomer.setDeleted(0);
    }

    // ======================== 创建和删除测试 ========================

    @Test
    @DisplayName("创建客户成功")
    public void testCreateCustomer_Success() {
        boolean result = customerService.createCustomer(testCustomer);
        assertTrue(result);
        
        Customer saved = customerRepository.selectById(testCustomer.getId());
        assertNotNull(saved);
        assertEquals("李四", saved.getName());
        assertEquals("13900139000", saved.getPhone());
    }

    @Test
    @DisplayName("删除客户成功")
    public void testDeleteCustomer_Success() {
        customerService.createCustomer(testCustomer);
        Long customerId = testCustomer.getId();

        boolean result = customerService.deleteCustomer(customerId);
        assertTrue(result);

        Customer deleted = customerRepository.selectById(customerId);
        assertTrue(deleted == null || deleted.getDeleted() == 1);
    }

    // ======================== 查询测试 ========================

    @Test
    @DisplayName("获取客户详情")
    public void testGetCustomerDetail() {
        customerService.createCustomer(testCustomer);
        
        Customer detail = customerService.getCustomerDetail(testCustomer.getId());
        assertNotNull(detail);
        assertEquals("李四", detail.getName());
        assertEquals("female", detail.getGender());
    }

    @Test
    @DisplayName("分页查询客户列表")
    public void testListCustomers() {
        // 创建多个测试客户
        for (int i = 0; i < 5; i++) {
            Customer customer = new Customer();
            customer.setName("客户" + i);
            customer.setPhone("139" + String.format("%08d", i));
            customer.setLevel("normal");
            customer.setStatus("active");
            customer.setCreatedBy(1L);
            customer.setDeleted(0);
            customerService.createCustomer(customer);
        }

        Page<Customer> result = customerService.listCustomers(1, 10, null, null);
        assertNotNull(result);
        assertTrue(result.getTotal() >= 5);
    }

    @Test
    @DisplayName("按状态过滤查询")
    public void testListCustomers_WithStatusFilter() {
        // 创建不同状态的客户
        Customer activeCustomer = new Customer();
        activeCustomer.setName("活跃客户");
        activeCustomer.setPhone("13901");
        activeCustomer.setStatus("active");
        activeCustomer.setLevel("normal");
        activeCustomer.setCreatedBy(1L);
        activeCustomer.setDeleted(0);
        customerService.createCustomer(activeCustomer);

        Customer potentialCustomer = new Customer();
        potentialCustomer.setName("潜在客户");
        potentialCustomer.setPhone("13902");
        potentialCustomer.setStatus("potential");
        potentialCustomer.setLevel("normal");
        potentialCustomer.setCreatedBy(1L);
        potentialCustomer.setDeleted(0);
        customerService.createCustomer(potentialCustomer);

        Page<Customer> result = customerService.listCustomers(1, 10, "active", null);
        assertNotNull(result);
        assertTrue(result.getRecords().stream().allMatch(c -> "active".equals(c.getStatus())));
    }

    @Test
    @DisplayName("搜索客户 - 按名称")
    public void testSearchCustomers_ByName() {
        customerService.createCustomer(testCustomer);

        Page<Customer> result = customerService.searchCustomers("李四", 1, 10);
        assertNotNull(result);
        assertTrue(result.getTotal() > 0);
        assertTrue(result.getRecords().stream().anyMatch(c -> c.getName().contains("李四")));
    }

    @Test
    @DisplayName("搜索客户 - 按电话")
    public void testSearchCustomers_ByPhone() {
        customerService.createCustomer(testCustomer);

        Page<Customer> result = customerService.searchCustomers("13900139000", 1, 10);
        assertNotNull(result);
        assertTrue(result.getTotal() > 0);
    }

    // ======================== VIP和活跃客户查询 ========================

    @Test
    @DisplayName("获取VIP客户列表")
    public void testGetVIPCustomers() {
        // 创建VIP客户
        Customer vipCustomer = new Customer();
        vipCustomer.setName("VIP客户");
        vipCustomer.setPhone("13910");
        vipCustomer.setLevel("vip");
        vipCustomer.setStatus("active");
        vipCustomer.setCreatedBy(1L);
        vipCustomer.setDeleted(0);
        customerService.createCustomer(vipCustomer);

        Page<Customer> result = customerService.getVIPCustomers(1, 10);
        assertNotNull(result);
        assertTrue(result.getRecords().stream().allMatch(c -> "vip".equals(c.getLevel())));
    }

    @Test
    @DisplayName("获取活跃客户列表")
    public void testGetActiveCustomers() {
        // 创建活跃客户
        Customer activeCustomer = new Customer();
        activeCustomer.setName("活跃客户");
        activeCustomer.setPhone("13920");
        activeCustomer.setLevel("normal");
        activeCustomer.setStatus("active");
        activeCustomer.setCreatedBy(1L);
        activeCustomer.setDeleted(0);
        customerService.createCustomer(activeCustomer);

        Page<Customer> result = customerService.getActiveCustomers(1, 10);
        assertNotNull(result);
        assertTrue(result.getRecords().stream().allMatch(c -> "active".equals(c.getStatus())));
    }

    // ======================== 分配测试 ========================

    @Test
    @DisplayName("分配客户给销售人员")
    public void testAssignCustomer() {
        customerService.createCustomer(testCustomer);
        Long customerId = testCustomer.getId();

        boolean result = customerService.assignCustomer(customerId, 3L);
        assertTrue(result);

        Customer assigned = customerRepository.selectById(customerId);
        assertEquals(3L, assigned.getAssignedTo());
    }

    @Test
    @DisplayName("批量分配客户")
    public void testAssignCustomersBatch() {
        // 创建多个客户
        Long id1 = null, id2 = null, id3 = null;
        
        for (int i = 0; i < 3; i++) {
            Customer customer = new Customer();
            customer.setName("客户" + i);
            customer.setPhone("139" + String.format("%08d", 100 + i));
            customer.setLevel("normal");
            customer.setStatus("active");
            customer.setCreatedBy(1L);
            customer.setDeleted(0);
            customerService.createCustomer(customer);
            
            if (i == 0) id1 = customer.getId();
            else if (i == 1) id2 = customer.getId();
            else id3 = customer.getId();
        }

        List<Long> customerIds = List.of(id1, id2, id3);
        boolean result = customerService.assignCustomersBatch(customerIds, 4L);
        assertTrue(result);

        // 验证分配结果
        for (Long id : customerIds) {
            Customer assigned = customerRepository.selectById(id);
            assertEquals(4L, assigned.getAssignedTo());
        }
    }

    // ======================== 等级升级和状态变更 ========================

    @Test
    @DisplayName("升级客户等级")
    public void testUpgradeCustomerLevel() {
        customerService.createCustomer(testCustomer);
        Long customerId = testCustomer.getId();
        assertEquals("normal", testCustomer.getLevel());

        boolean result = customerService.upgradeCustomerLevel(customerId, "vip");
        assertTrue(result);

        Customer upgraded = customerRepository.selectById(customerId);
        assertEquals("vip", upgraded.getLevel());
    }

    @Test
    @DisplayName("标记客户为流失")
    public void testMarkAsLostCustomer() {
        customerService.createCustomer(testCustomer);
        Long customerId = testCustomer.getId();
        assertEquals("potential", testCustomer.getStatus());

        boolean result = customerService.markAsLostCustomer(customerId, "长期无购买");
        assertTrue(result);

        Customer lost = customerRepository.selectById(customerId);
        assertEquals("lost", lost.getStatus());
    }

    @Test
    @DisplayName("恢复流失客户")
    public void testRecoverLostCustomer() {
        // 先标记为流失
        customerService.createCustomer(testCustomer);
        Long customerId = testCustomer.getId();
        customerService.markAsLostCustomer(customerId, "测试流失");

        // 再恢复
        boolean result = customerService.recoverLostCustomer(customerId);
        assertTrue(result);

        Customer recovered = customerRepository.selectById(customerId);
        assertNotEquals("lost", recovered.getStatus());
    }

    // ======================== 统计测试 ========================

    @Test
    @DisplayName("获取客户统计信息")
    public void testGetCustomerStatistics() {
        // 创建测试数据
        for (int i = 0; i < 3; i++) {
            Customer c = new Customer();
            c.setName("统计客户" + i);
            c.setPhone("139" + String.format("%08d", 200 + i));
            c.setLevel("normal");
            c.setStatus("active");
            c.setCreatedBy(1L);
            c.setDeleted(0);
            customerService.createCustomer(c);
        }

        Map<String, Object> stats = customerService.getCustomerStatistics();
        assertNotNull(stats);
        assertTrue(stats.containsKey("totalCustomers"));
    }

    @Test
    @DisplayName("获取按状态的客户统计")
    public void testGetCustomerStatisticsByStatus() {
        Map<String, Integer> stats = customerService.getCustomerStatisticsByStatus();
        assertNotNull(stats);
        assertTrue(stats.keySet().size() > 0);
    }

    @Test
    @DisplayName("获取按等级的客户统计")
    public void testGetCustomerStatisticsByLevel() {
        Map<String, Integer> stats = customerService.getCustomerStatisticsByLevel();
        assertNotNull(stats);
        assertTrue(stats.keySet().size() > 0);
    }

    // ======================== 数据验证测试 ========================

    @Test
    @DisplayName("检查电话是否已存在")
    public void testPhoneExists() {
        customerService.createCustomer(testCustomer);

        boolean exists = customerService.phoneExists("13900139000", null);
        assertTrue(exists);

        boolean notExists = customerService.phoneExists("99999999999", null);
        assertFalse(notExists);
    }

    @Test
    @DisplayName("检查邮箱是否已存在")
    public void testEmailExists() {
        customerService.createCustomer(testCustomer);

        boolean exists = customerService.emailExists("lisi@test.com", null);
        assertTrue(exists);

        boolean notExists = customerService.emailExists("notexist@test.com", null);
        assertFalse(notExists);
    }

    @Test
    @DisplayName("电话已存在但排除当前客户")
    public void testPhoneExists_ExcludeCurrentCustomer() {
        customerService.createCustomer(testCustomer);
        Long customerId = testCustomer.getId();

        // 排除当前客户，应返回false
        boolean exists = customerService.phoneExists("13900139000", customerId);
        assertFalse(exists);
    }

    // ======================== 客户360视图测试 ========================

    @Test
    @DisplayName("获取客户360视图")
    public void testGetCustomer360View() {
        customerService.createCustomer(testCustomer);
        
        Map<String, Object> view = customerService.getCustomer360View(testCustomer.getId());
        assertNotNull(view);
        assertTrue(view.containsKey("customer"));
        assertTrue(view.containsKey("interactions"));
        assertTrue(view.containsKey("purchases"));
    }
}
