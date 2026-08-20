package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Role;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 角色管理Repository
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface RoleRepository extends BaseMapper<Role> {

    /**
     * 按角色名称查询
     */
    @Select("SELECT * FROM roles WHERE name = #{name} AND status = 1")
    Role findByName(@Param("name") String name);

    /**
     * 按角色代码查询
     */
    @Select("SELECT * FROM roles WHERE code = #{code} AND status = 1")
    Role findByCode(@Param("code") String code);

    /**
     * 获取所有启用的角色列表
     */
    @Select("SELECT * FROM roles WHERE status = 1 AND deleted = 0 ORDER BY sort_order ASC, id ASC")
    List<Role> findAllEnabled();

    /**
     * 分页查询角色列表
     */
    IPage<Role> findByPage(Page<Role> page, @Param("name") String name, @Param("status") Integer status);

    /**
     * 获取某个用户的所有角色
     */
    @Select("SELECT r.* FROM roles r " +
            "INNER JOIN user_roles ur ON r.id = ur.role_id " +
            "WHERE ur.user_id = #{userId} AND r.status = 1 " +
            "ORDER BY r.sort_order ASC")
    List<Role> findByUserId(@Param("userId") Long userId);

    /**
     * 统计启用角色数
     */
    @Select("SELECT COUNT(*) FROM roles WHERE status = 1")
    int countEnabled();

    /**
     * 检查角色名称是否存在（排除指定ID）
     */
    @Select("SELECT COUNT(*) FROM roles WHERE name = #{name} AND id != #{id}")
    int countByNameExcludeId(@Param("name") String name, @Param("id") Long id);

    /**
     * 检查角色代码是否存在（排除指定ID）
     */
    @Select("SELECT COUNT(*) FROM roles WHERE code = #{code} AND id != #{id}")
    int countByCodeExcludeId(@Param("code") String code, @Param("id") Long id);

    /**
     * 获取某个权限关联的所有角色
     */
    @Select("SELECT DISTINCT r.* FROM roles r " +
            "INNER JOIN role_permissions rp ON r.id = rp.role_id " +
            "WHERE rp.permission_id = #{permissionId} AND r.status = 1")
    List<Role> findByPermissionId(@Param("permissionId") Long permissionId);

    /**
     * 软删除角色
     */
    void softDelete(@Param("id") Long id);

    /**
     * 恢复软删除的角色
     */
    void restore(@Param("id") Long id);
}
