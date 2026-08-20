package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.UserRole;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 用户角色关系Repository
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface UserRoleRepository extends BaseMapper<UserRole> {

    /**
     * 获取用户的所有角色
     */
    @Select("SELECT * FROM user_roles WHERE user_id = #{userId}")
    List<UserRole> findByUserId(@Param("userId") Long userId);

    /**
     * 获取角色的所有用户
     */
    @Select("SELECT * FROM user_roles WHERE role_id = #{roleId}")
    List<UserRole> findByRoleId(@Param("roleId") Long roleId);

    /**
     * 检查用户是否拥有某个角色
     */
    @Select("SELECT COUNT(*) FROM user_roles WHERE user_id = #{userId} AND role_id = #{roleId}")
    int countByUserAndRole(@Param("userId") Long userId, @Param("roleId") Long roleId);

    /**
     * 删除用户的所有角色
     */
    @Delete("DELETE FROM user_roles WHERE user_id = #{userId}")
    int deleteByUserId(@Param("userId") Long userId);

    /**
     * 删除角色的所有用户关系
     */
    @Delete("DELETE FROM user_roles WHERE role_id = #{roleId}")
    int deleteByRoleId(@Param("roleId") Long roleId);

    /**
     * 删除特定的用户角色关系
     */
    @Delete("DELETE FROM user_roles WHERE user_id = #{userId} AND role_id = #{roleId}")
    int deleteByUserAndRole(@Param("userId") Long userId, @Param("roleId") Long roleId);

    /**
     * 批量删除用户角色关系
     */
    void deleteByUserIds(@Param("userIds") List<Long> userIds);

    /**
     * 获取拥有某个角色的用户数
     */
    @Select("SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role_id = #{roleId}")
    int countUsersByRole(@Param("roleId") Long roleId);

    /**
     * 获取用户拥有的角色ID列表
     */
    @Select("SELECT role_id FROM user_roles WHERE user_id = #{userId}")
    List<Long> findRoleIdsByUserId(@Param("userId") Long userId);

    /**
     * 获取拥有特定角色的用户ID列表
     */
    @Select("SELECT user_id FROM user_roles WHERE role_id = #{roleId}")
    List<Long> findUserIdsByRoleId(@Param("roleId") Long roleId);

    /**
     * 批量添加用户角色
     */
    void insertBatch(@Param("userRoles") List<UserRole> userRoles);
}
