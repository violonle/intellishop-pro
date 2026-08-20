package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.ChannelCode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * Customer Acquisition Channel Codes Repository
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
@Mapper
public interface ChannelCodeRepository extends BaseMapper<ChannelCode> {

    @Select("SELECT SUM(scan_count) as totalScans, SUM(follow_count) as totalLeads FROM channel_codes WHERE enterprise_id = #{tenantId}")
    Map<String, Object> getGlobalStats(@org.apache.ibatis.annotations.Param("tenantId") Long tenantId);

    @Select("SELECT channel_type as name, SUM(scan_count) as value FROM channel_codes WHERE enterprise_id = #{tenantId} GROUP BY channel_type")
    List<Map<String, Object>> getChannelDistribution(@org.apache.ibatis.annotations.Param("tenantId") Long tenantId);

    @Select("SELECT u.real_name as name, SUM(c.scan_count) as scans, SUM(c.follow_count) as conversions " +
            "FROM channel_codes c JOIN users u ON c.user_id = u.id " +
            "WHERE c.enterprise_id = #{tenantId} GROUP BY c.user_id, u.real_name")
    List<Map<String, Object>> getSalesRanking(@org.apache.ibatis.annotations.Param("tenantId") Long tenantId);
}
