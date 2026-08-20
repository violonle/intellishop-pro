package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.FollowUpRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 跟进记录数据访问层
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Mapper
public interface FollowUpRecordRepository extends BaseMapper<FollowUpRecord> {

    /**
     * 根据线索ID查询跟进记录
     */
    @Select("SELECT * FROM follow_up_records WHERE lead_id = #{leadId} ORDER BY created_at DESC")
    List<FollowUpRecord> findByLeadId(@Param("leadId") Long leadId);

    /**
     * 根据客户ID查询跟进记录
     */
    @Select("SELECT * FROM follow_up_records WHERE customer_id = #{customerId} ORDER BY created_at DESC")
    List<FollowUpRecord> findByCustomerId(@Param("customerId") Long customerId);

    /**
     * 根据用户ID查询跟进记录
     */
    @Select("SELECT * FROM follow_up_records WHERE user_id = #{userId} ORDER BY created_at DESC")
    List<FollowUpRecord> findByUserId(@Param("userId") Long userId);

    /**
     * 根据跟进方式查询跟进记录
     */
    @Select("SELECT * FROM follow_up_records WHERE type = #{type} ORDER BY created_at DESC")
    List<FollowUpRecord> findByType(@Param("type") String type);

    /**
     * 查询待提醒的跟进记录(下次跟进日期在指定范围内)
     */
    @Select("SELECT * FROM follow_up_records WHERE next_follow_up_date IS NOT NULL " +
            "AND next_follow_up_date BETWEEN #{startDate} AND #{endDate} " +
            "ORDER BY next_follow_up_date ASC")
    List<FollowUpRecord> findPendingReminders(@Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);

    /**
     * 查询超期未跟进的记录
     */
    @Select("SELECT * FROM follow_up_records WHERE next_follow_up_date IS NOT NULL " +
            "AND next_follow_up_date < #{now} ORDER BY next_follow_up_date ASC")
    List<FollowUpRecord> findOverdueFollowUps(@Param("now") LocalDateTime now);

    /**
     * 按用户和日期查询跟进记录统计
     */
    @Select("SELECT type, COUNT(*) as count FROM follow_up_records " +
            "WHERE user_id = #{userId} AND DATE(created_at) = DATE(#{date}) " +
            "GROUP BY type")
    List<Object> findDailyStatistics(@Param("userId") Long userId, @Param("date") LocalDateTime date);

    /**
     * 按结果统计跟进记录
     */
    @Select("SELECT result, COUNT(*) as count FROM follow_up_records " +
            "WHERE user_id = #{userId} " +
            "AND created_at BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY result")
    List<Object> findResultStatistics(@Param("userId") Long userId,
                                     @Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);

    /**
     * 分页查询用户的跟进记录
     */
    @Select("SELECT * FROM follow_up_records WHERE user_id = #{userId} " +
            "<if test=\"type != null\">AND type = #{type}</if> " +
            "<if test=\"result != null\">AND result = #{result}</if> " +
            "ORDER BY created_at DESC")
    IPage<FollowUpRecord> findPageByUser(Page<FollowUpRecord> page,
                                        @Param("userId") Long userId,
                                        @Param("type") String type,
                                        @Param("result") String result);

    /**
     * 分页查询客户的所有跟进记录
     */
    @Select("SELECT * FROM follow_up_records WHERE customer_id = #{customerId} " +
            "ORDER BY created_at DESC")
    IPage<FollowUpRecord> findPageByCustomer(Page<FollowUpRecord> page,
                                             @Param("customerId") Long customerId);

    /**
     * 分页查询线索的所有跟进记录
     */
    @Select("SELECT * FROM follow_up_records WHERE lead_id = #{leadId} " +
            "ORDER BY created_at DESC")
    IPage<FollowUpRecord> findPageByLead(Page<FollowUpRecord> page,
                                        @Param("leadId") Long leadId);

    /**
     * 查询特定日期范围内的跟进记录数
     */
    @Select("SELECT COUNT(*) FROM follow_up_records " +
            "WHERE user_id = #{userId} " +
            "AND created_at BETWEEN #{startDate} AND #{endDate}")
    Long countInDateRange(@Param("userId") Long userId,
                         @Param("startDate") LocalDateTime startDate,
                         @Param("endDate") LocalDateTime endDate);
}
