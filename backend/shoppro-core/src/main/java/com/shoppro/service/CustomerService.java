package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.shoppro.entity.Customer;

import java.util.List;
import java.util.Map;

/**
 * 客户服务接口
 */
public interface CustomerService extends IService<Customer> {

    /**
     * 分页查询客户列表
     * @param pageNo 页码
     * @param pageSize 每页数量
     * @param status 客户状态（可选）
     * @param level 客户等级（可选）
     * @return 分页结果
     */
    Page<Customer> listCustomers(int pageNo, int pageSize, String status, String level);

    /**
     * 搜索客户
     * @param keyword 搜索关键词（名称、电话、邮箱）
     * @param pageNo 页码
     * @param pageSize 每页数量
     * @return 分页结果
     */
    Page<Customer> searchCustomers(String keyword, int pageNo, int pageSize);

    /**
     * 获取客户详情
     * @param id 客户ID
     * @return 客户信息
     */
    Customer getCustomerDetail(Long id);

    /**
     * 创建客户
     * @param customer 客户信息
     * @return 是否成功
     */
    boolean createCustomer(Customer customer);

    /**
     * 更新客户信息
     * @param customer 客户信息
     * @return 是否成功
     */
    boolean updateCustomer(Customer customer);

    /**
     * 删除客户
     * @param id 客户ID
     * @return 是否成功
     */
    boolean deleteCustomer(Long id);

    /**
     * 分配客户给销售人员
     * @param customerId 客户ID
     * @param userId 销售人员ID
     * @return 是否成功
     */
    boolean assignCustomer(Long customerId, Long userId);

    /**
     * 批量分配客户
     * @param customerIds 客户ID列表
     * @param userId 销售人员ID
     * @return 是否成功
     */
    boolean assignCustomersBatch(List<Long> customerIds, Long userId);

    /**
     * 获取指定用户的客户列表
     * @param userId 用户ID
     * @param pageNo 页码
     * @param pageSize 每页数量
     * @return 分页结果
     */
    Page<Customer> getCustomersByUser(Long userId, int pageNo, int pageSize);

    /**
     * 获取VIP客户列表
     * @param pageNo 页码
     * @param pageSize 每页数量
     * @return 分页结果
     */
    Page<Customer> getVIPCustomers(int pageNo, int pageSize);

    /**
     * 获取活跃客户列表
     * @param pageNo 页码
     * @param pageSize 每页数量
     * @return 分页结果
     */
    Page<Customer> getActiveCustomers(int pageNo, int pageSize);

    /**
     * 获取客户统计信息
     * @return 统计数据
     */
    Map<String, Object> getCustomerStatistics();

    /**
     * 获取按状态的客户统计
     * @return 统计数据
     */
    Map<String, Integer> getCustomerStatisticsByStatus();

    /**
     * 获取按等级的客户统计
     * @return 统计数据
     */
    Map<String, Integer> getCustomerStatisticsByLevel();

    /**
     * 检查电话是否已存在
     * @param phone 电话号码
     * @param excludeId 排除的客户ID（编辑时使用）
     * @return 是否存在
     */
    boolean phoneExists(String phone, Long excludeId);

    /**
     * 检查邮箱是否已存在
     * @param email 邮箱
     * @param excludeId 排除的客户ID（编辑时使用）
     * @return 是否存在
     */
    boolean emailExists(String email, Long excludeId);

    /**
     * 升级客户等级
     * @param customerId 客户ID
     * @param newLevel 新等级
     * @return 是否成功
     */
    boolean upgradeCustomerLevel(Long customerId, String newLevel);

    /**
     * 标记客户为流失
     * @param customerId 客户ID
     * @param reason 流失原因
     * @return 是否成功
     */
    boolean markAsLostCustomer(Long customerId, String reason);

    /**
     * 恢复流失客户
     * @param customerId 客户ID
     * @return 是否成功
     */
    boolean recoverLostCustomer(Long customerId);

    /**
     * 获取客户的360视图（包含所有相关数据）
     * @param customerId 客户ID
     * @return 客户360视图数据
     */
    Map<String, Object> getCustomer360View(Long customerId);
}