package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.RolePermission;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 角色权限关系Repository
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface RolePermissionRepository extends BaseMapper<RolePermission> {

    /**
     * 获取角色的所有权限
     */
    @Select("SELECT * FROM role_permissions WHERE role_id = #{roleId}")
    List<RolePermission> findByRoleId(@Param("roleId") Long roleId);

    /**
     * 获取权限对应的所有角色
     */
    @Select("SELECT * FROM role_permissions WHERE permission_id = #{permissionId}")
    List<RolePermission> findByPermissionId(@Param("permissionId") Long permissionId);

    /**
     * 检查角色是否拥有某个权限
     */
    @Select("SELECT COUNT(*) FROM role_permissions WHERE role_id = #{roleId} AND permission_id = #{permissionId}")
    int countByRoleAndPermission(@Param("roleId") Long roleId, @Param("permissionId") Long permissionId);

    /**
     * 删除角色的所有权限
     */
    @Delete("DELETE FROM role_permissions WHERE role_id = #{roleId}")
    int deleteByRoleId(@Param("roleId") Long roleId);

    /**
     * 删除权限的所有角色关系
     */
    @Delete("DELETE FROM role_permissions WHERE permission_id = #{permissionId}")
    int deleteByPermissionId(@Param("permissionId") Long permissionId);

    /**
     * 删除特定的角色权限关系
     */
    @Delete("DELETE FROM role_permissions WHERE role_id = #{roleId} AND permission_id = #{permissionId}")
    int deleteByRoleAndPermission(@Param("roleId") Long roleId, @Param("permissionId") Long permissionId);

    /**
     * 获取拥有某个权限的角色数
     */
    @Select("SELECT COUNT(DISTINCT role_id) FROM role_permissions WHERE permission_id = #{permissionId}")
    int countRolesByPermission(@Param("permissionId") Long permissionId);

    /**
     * 获取角色拥有的权限ID列表
     */
    @Select("SELECT permission_id FROM role_permissions WHERE role_id = #{roleId}")
    List<Long> findPermissionIdsByRoleId(@Param("roleId") Long roleId);

    /**
     * 获取权限对应的角色ID列表
     */
    @Select("SELECT role_id FROM role_permissions WHERE permission_id = #{permissionId}")
    List<Long> findRoleIdsByPermissionId(@Param("permissionId") Long permissionId);

    /**
     * 批量删除角色权限关系
     */
    void deleteByRoleIds(@Param("roleIds") List<Long> roleIds);

    /**
     * 批量添加角色权限
     */
    void insertBatch(@Param("rolePermissions") List<RolePermission> rolePermissions);

    /**
     * 获取角色的权限ID集合
     */
    @Select("<script>"
            + "SELECT DISTINCT permission_id FROM role_permissions WHERE role_id IN "
            + "<foreach item='roleId' collection='roleIds' open='(' separator=',' close=')'>"
            + "#{roleId}"
            + "</foreach>"
            + "</script>")
    List<Long> findPermissionIdsByRoleIds(@Param("roleIds") List<Long> roleIds);
}