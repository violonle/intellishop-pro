package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Department;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 部门管理Repository
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface DepartmentRepository extends BaseMapper<Department> {

    /**
     * 按部门名称查询
     */
    @Select("SELECT * FROM departments WHERE name = #{name} AND status = 1")
    Department findByName(@Param("name") String name);

    /**
     * 获取所有启用的部门列表（按排序）
     */
    @Select("SELECT * FROM departments WHERE status = 1 ORDER BY sort_order ASC, id ASC")
    List<Department> findAllEnabled();

    /**
     * 获取顶级部门列表（parent_id=0）
     */
    @Select("SELECT * FROM departments WHERE parent_id = 0 AND status = 1 ORDER BY sort_order ASC")
    List<Department> findRootDepartments();

    /**
     * 获取子部门列表
     */
    @Select("SELECT * FROM departments WHERE parent_id = #{parentId} AND status = 1 ORDER BY sort_order ASC")
    List<Department> findChildren(@Param("parentId") Long parentId);

    /**
     * 分页查询部门列表
     */
    IPage<Department> findByPage(Page<Department> page, @Param("name") String name, @Param("status") Integer status);

    /**
     * 获取部门的完整层级路径
     */
    @Select("WITH RECURSIVE dept_tree AS (" +
            "SELECT id, name, parent_id FROM departments WHERE id = #{id} " +
            "UNION ALL " +
            "SELECT d.id, d.name, d.parent_id FROM departments d " +
            "INNER JOIN dept_tree dt ON d.id = dt.parent_id " +
            ") SELECT * FROM dept_tree ORDER BY parent_id DESC, id DESC")
    List<Department> findAncestors(@Param("id") Long id);

    /**
     * 统计某个部门的子部门数
     */
    @Select("SELECT COUNT(*) FROM departments WHERE parent_id = #{parentId} AND status = 1")
    int countChildren(@Param("parentId") Long parentId);

    /**
     * 统计启用部门数
     */
    @Select("SELECT COUNT(*) FROM departments WHERE status = 1")
    int countEnabled();

    /**
     * 检查部门名称是否存在（排除指定ID）
     */
    @Select("SELECT COUNT(*) FROM departments WHERE name = #{name} AND id != #{id}")
    int countByNameExcludeId(@Param("name") String name, @Param("id") Long id);

    /**
     * 获取某个部门管理者管理的所有部门及子部门
     */
    @Select("WITH RECURSIVE dept_tree AS (" +
            "SELECT id FROM departments WHERE manager_id = #{managerId} AND status = 1 " +
            "UNION ALL " +
            "SELECT d.id FROM departments d " +
            "INNER JOIN dept_tree dt ON d.parent_id = dt.id " +
            "WHERE d.status = 1 " +
            ") SELECT * FROM departments WHERE id IN (SELECT id FROM dept_tree)")
    List<Department> findManagedDepartments(@Param("managerId") Long managerId);

    /**
     * 获取某个部门下的所有用户数
     */
    @Select("SELECT COUNT(*) FROM users WHERE department_id = #{departmentId} AND status = 1")
    int countUsersByDepartment(@Param("departmentId") Long departmentId);

    /**
     * 软删除部门
     */
    void softDelete(@Param("id") Long id);

    /**
     * 恢复软删除的部门
     */
    void restore(@Param("id") Long id);

    /**
     * 批量软删除部门
     */
    void softDeleteBatch(@Param("ids") List<Long> ids);

    /**
     * 获取部门树（包含完整的父子关系）
     */
    @Select("<script>" +
            "WITH RECURSIVE dept_tree AS (" +
            "SELECT id, parent_id, name, sort_order FROM departments WHERE parent_id = #{parentId} AND status = 1 " +
            "UNION ALL " +
            "SELECT d.id, d.parent_id, d.name, d.sort_order FROM departments d " +
            "INNER JOIN dept_tree dt ON d.parent_id = dt.id " +
            "WHERE d.status = 1 " +
            ") SELECT * FROM dept_tree ORDER BY sort_order ASC, id ASC" +
            "</script>")
    List<Department> findDepartmentTree(@Param("parentId") Long parentId);
}
