package com.shoppro.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shoppro.entity.Customer;
import com.shoppro.entity.Lead;
import com.shoppro.entity.User;
import com.shoppro.repository.UserRepository;
import com.shoppro.security.LoginUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

/**
 * 统一处理企业和销售数据范围。控制器的角色校验只负责“能否调用”，
 * 本服务负责“调用后能看到哪些对象”。
 */
@Service
public class DataScopeService {

    private final ObjectProvider<UserRepository> userRepositoryProvider;

    public DataScopeService(ObjectProvider<UserRepository> userRepositoryProvider) {
        this.userRepositoryProvider = userRepositoryProvider;
    }

    public Scope current() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return Scope.anonymous();
        }
        UserRepository userRepository = userRepositoryProvider.getIfAvailable();
        User user = userRepository == null ? null : userRepository.selectByUsername(authentication.getName());
        if (authentication.getPrincipal() instanceof LoginUser loginUser
                && (user == null || user.getEnterpriseId() == null)) {
            user = loginUser.getUser();
        }
        return user == null ? Scope.anonymous() : new Scope(user);
    }

    public void applyCustomerScope(QueryWrapper<Customer> wrapper) {
        applyScope(wrapper, "enterprise_id", "assigned_to");
    }

    public void applyLeadScope(QueryWrapper<Lead> wrapper) {
        applyScope(wrapper, "enterprise_id", "assigned_to");
    }

    private void applyScope(QueryWrapper<?> wrapper, String enterpriseColumn, String ownerColumn) {
        Scope scope = current();
        if (scope.all()) {
            return;
        }
        if (scope.self()) {
            wrapper.eq(ownerColumn, scope.userId());
            return;
        }
        if (scope.enterpriseId() == null) {
            wrapper.eq("id", -1L);
            return;
        }
        wrapper.eq(enterpriseColumn, scope.enterpriseId());
    }

    public boolean canAccess(Customer customer) {
        return customer != null && canAccess(customer.getEnterpriseId(), customer.getAssignedTo());
    }

    public boolean canAccess(Lead lead) {
        return lead != null && canAccess(lead.getEnterpriseId(), lead.getAssignedTo());
    }

    private boolean canAccess(Long enterpriseId, Long ownerId) {
        Scope scope = current();
        return scope.all() || (scope.self() && scope.userId() != null && scope.userId().equals(ownerId))
                || (!scope.self() && scope.enterpriseId() != null && scope.enterpriseId().equals(enterpriseId));
    }

    public void applyDefaults(Customer customer) {
        Scope scope = current();
        if (customer.getEnterpriseId() == null) customer.setEnterpriseId(scope.enterpriseId());
        if (scope.self()) customer.setAssignedTo(scope.userId());
    }

    public void applyDefaults(Lead lead, Long createdBy) {
        Scope scope = current();
        if (lead.getEnterpriseId() == null) lead.setEnterpriseId(scope.enterpriseId());
        if (lead.getAssignedTo() == null && scope.self()) lead.setAssignedTo(createdBy);
    }

    public record Scope(Long userId, Long enterpriseId, String role) {
        static Scope anonymous() { return new Scope(null, null, "anonymous"); }
        Scope(User user) { this(user.getId(), user.getEnterpriseId(), user.getRole()); }
        boolean all() {
            return role != null && switch (role.toLowerCase()) {
                case "super_admin", "admin", "platform_admin" -> true;
                default -> false;
            };
        }
        boolean self() {
            return role == null || switch (role.toLowerCase()) {
                case "sales", "user" -> true;
                default -> false;
            };
        }
        public boolean isSelfScope() { return self(); }
        public boolean isAllScope() { return all(); }
    }
}
