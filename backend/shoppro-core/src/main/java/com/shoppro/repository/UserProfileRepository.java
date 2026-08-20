package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.UserProfile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * UserProfile 数据访问层
 */
@Mapper
public interface UserProfileRepository extends BaseMapper<UserProfile> {

    /**
     * 根据用户名查询
     */
    UserProfile selectByUsername(@Param("username") String username);

    /**
     * 根据手机号查询
     */
    UserProfile selectByPhone(@Param("phone") String phone);

    /**
     * 根据邮箱查询
     */
    UserProfile selectByEmail(@Param("email") String email);

    /**
     * 统计用户名数量
     */
    long countByUsername(@Param("username") String username);

    /**
     * 统计手机号数量
     */
    long countByPhone(@Param("phone") String phone);

    /**
     * 统计邮箱数量
     */
    long countByEmail(@Param("email") String email);
}
