package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Permission;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 权限管理Repository
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface PermissionRepository extends BaseMapper<Permission> {

    /**
     * 按权限代码查询
     */
    @Select("SELECT * FROM permissions WHERE code = #{code} AND status = 1")
    Permission findByCode(@Param("code") String code);

    /**
     * 按权限名称查询
     */
    @Select("SELECT * FROM permissions WHERE name = #{name} AND status = 1")
    Permission findByName(@Param("name") String name);

    /**
     * 获取所有启用的权限列表
     */
    @Select("SELECT * FROM permissions WHERE status = 1 ORDER BY sort_order ASC, id ASC")
    List<Permission> findAllEnabled();

    /**
     * 分页查询权限列表
     */
    IPage<Permission> findByPage(Page<Permission> page, @Param("name") String name, 
                                  @Param("resource") String resource, @Param("status") Integer status);

    /**
     * 获取某个资源的所有权限
     */
    @Select("SELECT * FROM permissions WHERE resource = #{resource} AND status = 1 ORDER BY sort_order ASC")
    List<Permission> findByResource(@Param("resource") String resource);

    /**
     * 获取某个用户的所有权限
     */
    @Select("SELECT DISTINCT p.* FROM permissions p " +
            "INNER JOIN role_permissions rp ON p.id = rp.permission_id " +
            "INNER JOIN user_roles ur ON rp.role_id = ur.role_id " +
            "WHERE ur.user_id = #{userId} AND p.status = 1 " +
            "UNION " +
            "SELECT DISTINCT p.* FROM permissions p " +
            "INNER JOIN user_permissions up ON p.id = up.permission_id " +
            "WHERE up.user_id = #{userId} AND p.status = 1")
    List<Permission> findByUserId(@Param("userId") Long userId);

    /**
     * 获取某个角色的所有权限
     */
    @Select("SELECT p.* FROM permissions p " +
            "INNER JOIN role_permissions rp ON p.id = rp.permission_id " +
            "WHERE rp.role_id = #{roleId} AND p.status = 1 " +
            "ORDER BY p.sort_order ASC")
    List<Permission> findByRoleId(@Param("roleId") Long roleId);

    /**
     * 统计启用权限数
     */
    @Select("SELECT COUNT(*) FROM permissions WHERE status = 1")
    int countEnabled();

    /**
     * 检查权限代码是否存在（排除指定ID）
     */
    @Select("SELECT COUNT(*) FROM permissions WHERE code = #{code} AND id != #{id}")
    int countByCodeExcludeId(@Param("code") String code, @Param("id") Long id);

    /**
     * 按资源和操作查询
     */
    @Select("SELECT * FROM permissions WHERE resource = #{resource} AND action = #{action} AND status = 1")
    Permission findByResourceAndAction(@Param("resource") String resource, @Param("action") String action);

    /**
     * 批量查询权限
     */
    @Select("<script>" +
            "SELECT * FROM permissions WHERE status = 1 AND id IN " +
            "<foreach item='id' collection='ids' open='(' separator=',' close=')'>" +
            "#{id}" +
            "</foreach>" +
            "</script>")
    List<Permission> findByIds(@Param("ids") List<Long> ids);

    /**
     * 软删除权限
     */
    void softDelete(@Param("id") Long id);

    /**
     * 恢复软删除的权限
     */
    void restore(@Param("id") Long id);
}
