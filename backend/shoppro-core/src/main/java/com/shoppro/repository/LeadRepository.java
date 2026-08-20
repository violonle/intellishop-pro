package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Lead;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * 销售线索数据访问层
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Repository
public interface LeadRepository extends BaseMapper<Lead> {

    /**
     * 按标题、描述搜索线索
     *
     * @param keyword 搜索关键词
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Lead> searchByKeyword(@Param("keyword") String keyword, Page<Lead> page);

    /**
     * 按状态查询线索
     *
     * @param status 线索状态
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Lead> listByStatus(@Param("status") String status, Page<Lead> page);

    /**
     * 按优先级查询线索
     *
     * @param priority 优先级
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Lead> listByPriority(@Param("priority") String priority, Page<Lead> page);

    /**
     * 按分配人查询线索
     *
     * @param assignedTo 分配人ID
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Lead> listByAssignedTo(@Param("assignedTo") Long assignedTo, Page<Lead> page);

    /**
     * 按创建人查询线索
     *
     * @param createdBy 创建人ID
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Lead> listByCreatedBy(@Param("createdBy") Long createdBy, Page<Lead> page);

    /**
     * 按来源查询线索
     *
     * @param source 线索来源
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Lead> listBySource(@Param("source") String source, Page<Lead> page);

    /**
     * 按阶段查询线索
     *
     * @param stage 销售阶段
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Lead> listByStage(@Param("stage") String stage, Page<Lead> page);

    /**
     * 查询高优先级且未分配的线索
     *
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Lead> listHighPriorityUnassigned(Page<Lead> page);

    /**
     * 查询待跟进的线索（状态不为已成交或已流失）
     *
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Lead> listPendingFollowUp(Page<Lead> page);

    /**
     * 查询指定状态的线索总数
     *
     * @param status 线索状态
     * @return 线索数量
     */
    Integer countByStatus(@Param("status") String status);

    /**
     * 查询指定优先级的线索总数
     *
     * @param priority 优先级
     * @return 线索数量
     */
    Integer countByPriority(@Param("priority") String priority);

    /**
     * 查询指定分配人的线索总数
     *
     * @param assignedTo 分配人ID
     * @return 线索数量
     */
    Integer countByAssignedTo(@Param("assignedTo") Long assignedTo);

    /**
     * 查询预估价值大于指定金额的线索
     *
     * @param minValue 最小价值
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Lead> listByMinValue(@Param("minValue") BigDecimal minValue, Page<Lead> page);

    /**
     * 查询成功概率大于等于指定值的线索
     *
     * @param minProbability 最小概率（0-100）
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Lead> listByMinProbability(@Param("minProbability") Integer minProbability, Page<Lead> page);

    /**
     * 检查客户是否已关联为线索
     *
     * @param customerId 客户ID
     * @return 是否存在
     */
    Boolean customerHasLead(@Param("customerId") Long customerId);

    /**
     * 获取近期未跟进的线索（超过N天未跟进）
     *
     * @param days 天数
     * @param page 分页信息
     * @return 分页结果
     */
    IPage<Lead> listUnfollowedForDays(@Param("days") Integer days, Page<Lead> page);

    /**
     * 获取已成交线索总数
     *
     * @return 数量
     */
    Integer countWonLeads();

    /**
     * 获取已流失线索总数
     *
     * @return 数量
     */
    Integer countLostLeads();

    /**
     * 获取平均成交周期（天数）
     *
     * @return 平均天数
     */
    Double getAverageClosingCycle();
}
