package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.LeadTransfer;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface LeadTransferRepository extends BaseMapper<LeadTransfer> {

    List<LeadTransfer> findByLeadIdOrderByCreatedAtDesc(Long leadId);
}
