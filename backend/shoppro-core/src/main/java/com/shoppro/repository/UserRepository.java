package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.User;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 用户数据访问对象
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface UserRepository extends BaseMapper<User> {

        /**
         * 根据用户名查询用户
         */
        @Select("SELECT * FROM users WHERE username = #{username} AND deleted = 0")
        User selectByUsername(@Param("username") String username);

        /**
         * 根据手机号查询用户
         */
        @Select("SELECT * FROM users WHERE phone = #{phone} AND deleted = 0")
        User selectByPhone(@Param("phone") String phone);

        /**
         * 根据邮箱查询用户
         */
        @Select("SELECT * FROM users WHERE email = #{email} AND deleted = 0")
        User selectByEmail(@Param("email") String email);

        /**
         * 根据用户名或手机号或邮箱查询用户
         */
        User selectByUsernameOrPhoneOrEmail(@Param("username") String username,
                        @Param("phone") String phone,
                        @Param("email") String email);

        /**
         * 检查用户名是否存在
         */
        @Select("SELECT COUNT(*) FROM users WHERE username = #{username} AND deleted = 0")
        int countByUsername(@Param("username") String username);

        /**
         * 检查手机号是否存在
         */
        @Select("SELECT COUNT(*) FROM users WHERE phone = #{phone} AND deleted = 0")
        int countByPhone(@Param("phone") String phone);

        /**
         * 检查邮箱是否存在
         */
        @Select("SELECT COUNT(*) FROM users WHERE email = #{email} AND deleted = 0")
        int countByEmail(@Param("email") String email);

        /**
         * 更新用户最后登录时间
         */
        @Update("UPDATE users SET last_login_at = NOW() WHERE id = #{userId}")
        int updateLastLoginTime(@Param("userId") Long userId);

        /**
         * 更新用户密码
         */
        @Update("UPDATE users SET password = #{password}, updated_at = NOW() WHERE id = #{userId}")
        int updatePassword(@Param("userId") Long userId, @Param("password") String password);

        /**
         * 根据部门查询用户列表
         */
        @Select("SELECT * FROM users WHERE department_id = #{departmentId} AND status = 1 AND deleted = 0")
        List<User> selectByDepartmentId(@Param("departmentId") Long departmentId);

        /**
         * 根据角色查询用户列表
         */
        @Select("SELECT * FROM users WHERE role = #{role} AND status = 1 AND deleted = 0")
        List<User> selectByRole(@Param("role") String role);

        /**
         * 查询所有活跃用户
         */
        @Select("SELECT * FROM users WHERE status = 1 AND deleted = 0 ORDER BY created_at DESC")
        List<User> selectActiveUsers();

        /**
         * 禁用用户
         */
        @Update("UPDATE users SET status = 0, updated_at = NOW() WHERE id = #{userId}")
        int disableUser(@Param("userId") Long userId);

        /**
         * 启用用户
         */
        @Update("UPDATE users SET status = 1, updated_at = NOW() WHERE id = #{userId}")
        int enableUser(@Param("userId") Long userId);

        /**
         * 软删除用户
         */
        @Update("UPDATE users SET deleted = 1, updated_at = NOW() WHERE id = #{userId}")
        int softDeleteUser(@Param("userId") Long userId);

        /**
         * 直接更新用户信息（原生SQL）
         */
        @Update("UPDATE users SET " +
                        "real_name = #{realName}, " +
                        "phone = #{phone}, " +
                        "email = #{email}, " +
                        "role = #{role}, " +
                        "enterprise_id = #{enterpriseId}, " +
                        "sales_targets = #{salesTargets}, " +
                        "updated_at = NOW() " +
                        "WHERE id = #{id}")
        int updateUserInfoDirect(@Param("id") Long id,
                        @Param("realName") String realName,
                        @Param("phone") String phone,
                        @Param("email") String email,
                        @Param("role") String role,
                        @Param("enterpriseId") Long enterpriseId,
                        @Param("salesTargets") String salesTargets);
}
