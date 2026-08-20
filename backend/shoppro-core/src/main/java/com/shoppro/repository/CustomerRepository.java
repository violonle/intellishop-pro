package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Customer;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 客户数据访问层
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Repository
public interface CustomerRepository extends BaseMapper<Customer> {

    /**
     * 按名称、电话、邮箱搜索客户（全文搜索）
     *
     * @param keyword 搜索关键词
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Customer> searchByKeyword(@Param("keyword") String keyword, Page<Customer> page);

    /**
     * 按状态查询客户
     *
     * @param status 客户状态
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Customer> listByStatus(@Param("status") String status, Page<Customer> page);

    /**
     * 按等级查询客户
     *
     * @param level 客户等级
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Customer> listByLevel(@Param("level") String level, Page<Customer> page);

    /**
     * 按分配人查询客户
     *
     * @param assignedTo 分配人ID
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Customer> listByAssignedTo(@Param("assignedTo") Long assignedTo, Page<Customer> page);

    /**
     * 按创建人查询客户
     *
     * @param createdBy 创建人ID
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Customer> listByCreatedBy(@Param("createdBy") Long createdBy, Page<Customer> page);

    /**
     * 按公司名称查询客户
     *
     * @param company 公司名称
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Customer> listByCompany(@Param("company") String company, Page<Customer> page);

    /**
     * 按来源查询客户
     *
     * @param source 客户来源
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Customer> listBySource(@Param("source") String source, Page<Customer> page);

    /**
     * 查询指定状态的客户总数
     *
     * @param status 客户状态
     * @return 客户数量
     */
    Integer countByStatus(@Param("status") String status);

    /**
     * 查询指定等级的客户总数
     *
     * @param level 客户等级
     * @return 客户数量
     */
    Integer countByLevel(@Param("level") String level);

    /**
     * 查询指定分配人的客户总数
     *
     * @param assignedTo 分配人ID
     * @return 客户数量
     */
    Integer countByAssignedTo(@Param("assignedTo") Long assignedTo);

    /**
     * 查询所有活跃客户
     *
     * @return 活跃客户列表
     */
    List<Customer> listActiveCustomers();

    /**
     * 查询所有VIP客户
     *
     * @return VIP客户列表
     */
    List<Customer> listVIPCustomers();

    /**
     * 检查电话号码是否已存在
     *
     * @param phone 电话号码
     * @param excludeId 排除的客户ID（用于编辑时）
     * @return 是否存在
     */
    Boolean phoneExists(@Param("phone") String phone, @Param("excludeId") Long excludeId);

    /**
     * 检查邮箱是否已存在
     *
     * @param email 邮箱
     * @param excludeId 排除的客户ID（用于编辑时）
     * @return 是否存在
     */
    Boolean emailExists(@Param("email") String email, @Param("excludeId") Long excludeId);

    /**
     * 查询在线索中被提及的客户总数
     *
     * @return 客户数量
     */
    Integer countCustomersInLeads();
}
