package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shoppro.entity.Department;
import com.shoppro.entity.User;
import com.shoppro.repository.DepartmentRepository;
import com.shoppro.repository.UserRepository;
import com.shoppro.service.DepartmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 部门服务实现
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Service
public class DepartmentServiceImpl extends ServiceImpl<DepartmentRepository, Department> implements DepartmentService {

    private static final Logger log = LoggerFactory.getLogger(DepartmentServiceImpl.class);

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository, UserRepository userRepository) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public Department createDepartment(Department department) {
        log.info("创建部门: {}", department.getName());
        
        // 验证部门名称唯一性
        if (existsByName(department.getName(), null)) {
            throw new IllegalArgumentException("部门名称已存在: " + department.getName());
        }
        
        // 验证父部门存在性
        if (department.getParentId() != null && department.getParentId() > 0) {
            Department parent = this.getById(department.getParentId());
            if (parent == null) {
                throw new IllegalArgumentException("父部门不存在: " + department.getParentId());
            }
            
            // 设置层级
            department.setLevel(parent.getLevel() + 1);
        } else {
            department.setParentId(0L); // 顶级部门
            department.setLevel(1);
        }
        
        // 设置默认值
        if (department.getStatus() == null) {
            department.setStatus(1); // 启用
        }
        if (department.getSort() == null) {
            department.setSort(0);
        }
        
        department.setCreateTime(LocalDateTime.now());
        department.setUpdateTime(LocalDateTime.now());
        
        this.save(department);
        log.info("部门创建成功: ID={}, 名称={}", department.getId(), department.getName());
        return department;
    }

    @Override
    @Transactional
    public Department updateDepartment(Department department) {
        log.info("更新部门: ID={}, 名称={}", department.getId(), department.getName());
        
        Department existing = this.getById(department.getId());
        if (existing == null) {
            throw new IllegalArgumentException("部门不存在: " + department.getId());
        }
        
        // 检查部门名称唯一性（排除自身）
        if (!Objects.equals(existing.getName(), department.getName()) && 
            existsByName(department.getName(), department.getId())) {
            throw new IllegalArgumentException("部门名称已存在: " + department.getName());
        }
        
        // 如果修改了父部门，需要验证和更新层级
        if (!Objects.equals(existing.getParentId(), department.getParentId())) {
            if (department.getParentId() != null && department.getParentId() > 0) {
                // 验证不能设置自己为父部门
                if (Objects.equals(department.getId(), department.getParentId())) {
                    throw new IllegalArgumentException("不能设置自己为父部门");
                }
                
                // 验证不能设置子部门为父部门
                if (isSubDepartmentOf(department.getParentId(), department.getId())) {
                    throw new IllegalArgumentException("不能设置子部门为父部门");
                }
                
                Department parent = this.getById(department.getParentId());
                if (parent == null) {
                    throw new IllegalArgumentException("父部门不存在: " + department.getParentId());
                }
                
                department.setLevel(parent.getLevel() + 1);
            } else {
                department.setParentId(0L);
                department.setLevel(1);
            }
            
            // 更新所有子部门的层级
            updateChildDepartmentLevels(department.getId());
        }
        
        department.setUpdateTime(LocalDateTime.now());
        this.updateById(department);
        
        log.info("部门更新成功: ID={}", department.getId());
        return department;
    }

    @Override
    @Transactional
    public boolean deleteDepartment(Long departmentId) {
        log.info("删除部门: ID={}", departmentId);
        
        if (!canDeleteDepartment(departmentId)) {
            throw new IllegalArgumentException("部门有子部门或用户，无法删除");
        }
        
        boolean result = this.removeById(departmentId);
        if (result) {
            log.info("部门删除成功: ID={}", departmentId);
        }
        return result;
    }

    @Override
    @Transactional
    public boolean softDeleteDepartment(Long departmentId) {
        log.info("软删除部门: ID={}", departmentId);
        
        Department department = this.getById(departmentId);
        if (department == null) {
            return false;
        }
        
        // 递归软删除所有子部门
        List<Department> children = getChildDepartments(departmentId);
        for (Department child : children) {
            softDeleteDepartment(child.getId());
        }
        
        department.setDeleted(1);
        department.setUpdateTime(LocalDateTime.now());
        return this.updateById(department);
    }

    @Override
    @Transactional
    public boolean restoreDepartment(Long departmentId) {
        log.info("恢复部门: ID={}", departmentId);
        
        Department department = this.getById(departmentId);
        if (department == null) {
            return false;
        }
        
        // 检查父部门是否存在且未被删除
        if (department.getParentId() != null && department.getParentId() > 0) {
            Department parent = this.getById(department.getParentId());
            if (parent == null || parent.getDeleted() == 1) {
                throw new IllegalArgumentException("父部门不存在或已被删除，无法恢复");
            }
        }
        
        department.setDeleted(0);
        department.setUpdateTime(LocalDateTime.now());
        return this.updateById(department);
    }

    @Override
    @Transactional
    public boolean softDeleteBatch(List<Long> departmentIds) {
        log.info("批量软删除部门: {}", departmentIds);
        
        for (Long id : departmentIds) {
            softDeleteDepartment(id);
        }
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public Department getById(Long departmentId) {
        return this.baseMapper.selectById(departmentId);
    }

    @Override
    @Transactional(readOnly = true)
    public Department getByName(String name) {
        return this.getOne(new LambdaQueryWrapper<Department>()
                .eq(Department::getName, name)
                .eq(Department::getDeleted, 0));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Department> pageDepartments(int pageNo, int pageSize, String name, Integer status) {
        Page<Department> page = new Page<>(pageNo, pageSize);
        
        LambdaQueryWrapper<Department> queryWrapper = new LambdaQueryWrapper<Department>()
                .eq(Department::getDeleted, 0);
        
        if (name != null && !name.trim().isEmpty()) {
            queryWrapper.like(Department::getName, name.trim());
        }
        
        if (status != null) {
            queryWrapper.eq(Department::getStatus, status);
        }
        
        queryWrapper.orderByAsc(Department::getLevel)
                   .orderByAsc(Department::getSort)
                   .orderByAsc(Department::getId);
        
        return this.page(page, queryWrapper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Department> getAllEnabledDepartments() {
        return this.list(new LambdaQueryWrapper<Department>()
                .eq(Department::getStatus, 1)
                .eq(Department::getDeleted, 0)
                .orderByAsc(Department::getLevel)
                .orderByAsc(Department::getSort));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Department> getRootDepartments() {
        return this.list(new LambdaQueryWrapper<Department>()
                .eq(Department::getParentId, 0L)
                .eq(Department::getDeleted, 0)
                .orderByAsc(Department::getSort));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Department> getChildDepartments(Long parentId) {
        return this.list(new LambdaQueryWrapper<Department>()
                .eq(Department::getParentId, parentId)
                .eq(Department::getDeleted, 0)
                .orderByAsc(Department::getSort));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Department> getDepartmentTree(Long parentId) {
        List<Department> departments = getChildDepartments(parentId);
        
        // 递归构建树形结构
        for (Department dept : departments) {
            List<Department> children = getDepartmentTree(dept.getId());
            dept.setChildren(children);
        }
        
        return departments;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Department> getDepartmentPath(Long departmentId) {
        List<Department> path = new ArrayList<>();
        Department current = this.getById(departmentId);
        
        while (current != null && current.getParentId() != null && current.getParentId() > 0) {
            path.add(0, current); // 插入到开头
            current = this.getById(current.getParentId());
        }
        
        if (current != null) {
            path.add(0, current);
        }
        
        return path;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Department> getAllSubDepartments(Long departmentId) {
        List<Department> result = new ArrayList<>();
        List<Department> children = getChildDepartments(departmentId);
        
        for (Department child : children) {
            result.add(child);
            result.addAll(getAllSubDepartments(child.getId()));
        }
        
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String name, Long excludeId) {
        LambdaQueryWrapper<Department> queryWrapper = new LambdaQueryWrapper<Department>()
                .eq(Department::getName, name)
                .eq(Department::getDeleted, 0);
        
        if (excludeId != null) {
            queryWrapper.ne(Department::getId, excludeId);
        }
        
        return this.count(queryWrapper) > 0;
    }

    @Override
    @Transactional(readOnly = true)
    public int countEnabledDepartments() {
        return Math.toIntExact(this.count(new LambdaQueryWrapper<Department>()
                .eq(Department::getStatus, 1)
                .eq(Department::getDeleted, 0)));
    }

    @Override
    @Transactional(readOnly = true)
    public int countUsersByDepartment(Long departmentId) {
        return Math.toIntExact(userRepository.selectCount(
                new LambdaQueryWrapper<User>()
                        .eq(User::getDepartmentId, departmentId)
                        .eq(User::getDeleted, 0)));
    }

    @Override
    @Transactional(readOnly = true)
    public int countChildDepartments(Long parentId) {
        return Math.toIntExact(this.count(new LambdaQueryWrapper<Department>()
                .eq(Department::getParentId, parentId)
                .eq(Department::getDeleted, 0)));
    }

    @Override
    @Transactional
    public void moveDepartment(Long departmentId, Long newParentId) {
        log.info("移动部门: ID={}, 新父部门={}", departmentId, newParentId);
        
        Department department = this.getById(departmentId);
        if (department == null) {
            throw new IllegalArgumentException("部门不存在: " + departmentId);
        }
        
        // 验证不能移动到自己或子部门下
        if (Objects.equals(departmentId, newParentId) || isSubDepartmentOf(newParentId, departmentId)) {
            throw new IllegalArgumentException("不能移动到自己或子部门下");
        }
        
        department.setParentId(newParentId);
        
        if (newParentId != null && newParentId > 0) {
            Department parent = this.getById(newParentId);
            if (parent == null) {
                throw new IllegalArgumentException("目标父部门不存在: " + newParentId);
            }
            department.setLevel(parent.getLevel() + 1);
        } else {
            department.setParentId(0L);
            department.setLevel(1);
        }
        
        department.setUpdateTime(LocalDateTime.now());
        this.updateById(department);
        
        // 更新所有子部门的层级
        updateChildDepartmentLevels(departmentId);
    }

    @Override
    @Transactional
    public void updateDepartmentOrder(Long departmentId, int newOrder) {
        log.info("修改部门排序: ID={}, 新排序={}", departmentId, newOrder);
        
        Department department = this.getById(departmentId);
        if (department != null) {
            department.setSort(newOrder);
            department.setUpdateTime(LocalDateTime.now());
            this.updateById(department);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSubDepartmentOf(Long departmentId, Long parentId) {
        Department current = this.getById(departmentId);
        
        while (current != null && current.getParentId() != null && current.getParentId() > 0) {
            if (Objects.equals(current.getParentId(), parentId)) {
                return true;
            }
            current = this.getById(current.getParentId());
        }
        
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Department> getManagedDepartments(Long managerId) {
        return this.list(new LambdaQueryWrapper<Department>()
                .eq(Department::getManagerId, managerId)
                .eq(Department::getDeleted, 0)
                .orderByAsc(Department::getLevel)
                .orderByAsc(Department::getSort));
    }

    @Override
    @Transactional
    public void enableDepartment(Long departmentId) {
        log.info("启用部门: ID={}", departmentId);
        
        Department department = this.getById(departmentId);
        if (department != null) {
            department.setStatus(1);
            department.setUpdateTime(LocalDateTime.now());
            this.updateById(department);
        }
    }

    @Override
    @Transactional
    public void disableDepartment(Long departmentId) {
        log.info("禁用部门: ID={}", departmentId);
        
        Department department = this.getById(departmentId);
        if (department != null) {
            department.setStatus(0);
            department.setUpdateTime(LocalDateTime.now());
            this.updateById(department);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canDeleteDepartment(Long departmentId) {
        // 检查是否有子部门
        if (countChildDepartments(departmentId) > 0) {
            return false;
        }
        
        // 检查是否有用户
        if (countUsersByDepartment(departmentId) > 0) {
            return false;
        }
        
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public String getDepartmentFullPath(Long departmentId) {
        List<Department> path = getDepartmentPath(departmentId);
        return path.stream()
                .map(Department::getName)
                .collect(Collectors.joining(" > "));
    }

    /**
     * 更新子部门的层级
     */
    private void updateChildDepartmentLevels(Long parentId) {
        Department parent = this.getById(parentId);
        if (parent == null) return;
        
        List<Department> children = getChildDepartments(parentId);
        for (Department child : children) {
            child.setLevel(parent.getLevel() + 1);
            child.setUpdateTime(LocalDateTime.now());
            this.updateById(child);
            
            // 递归更新子部门的子部门
            updateChildDepartmentLevels(child.getId());
        }
    }
}