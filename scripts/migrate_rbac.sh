#!/bin/bash

# ==========================================
# ShopPro RBAC 权限系统改造 - 一键执行脚本
# ==========================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
DB_CONTAINER="shoppro-mysql"
DB_USER="shoppro"
DB_PASSWORD="ShopProDB2024!"
DB_NAME="shoppro_db"
BACKUP_DIR="./backups"
MIGRATION_SCRIPT="./backend/shoppro-infra/src/main/resources/db/migration_rbac.sql"

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 容器是否运行
check_docker() {
    print_info "检查 MySQL 容器状态..."
    if ! docker ps | grep -q "$DB_CONTAINER"; then
        print_error "MySQL 容器未运行！请先启动容器。"
        exit 1
    fi
    print_success "MySQL 容器运行正常"
}

# 创建备份目录
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_info "创建备份目录: $BACKUP_DIR"
    fi
}

# 备份数据库
backup_database() {
    print_info "开始备份数据库..."
    BACKUP_FILE="$BACKUP_DIR/shoppro_db_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    docker exec "$DB_CONTAINER" mysqldump \
        -u "$DB_USER" \
        -p"$DB_PASSWORD" \
        "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "数据库备份成功: $BACKUP_FILE"
        # 显示备份文件大小
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_info "备份文件大小: $BACKUP_SIZE"
    else
        print_error "数据库备份失败！"
        exit 1
    fi
}

# 备份 users 表
backup_users_table() {
    print_info "单独备份 users 表..."
    USERS_BACKUP="$BACKUP_DIR/users_table_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    docker exec "$DB_CONTAINER" mysqldump \
        -u "$DB_USER" \
        -p"$DB_PASSWORD" \
        "$DB_NAME" users > "$USERS_BACKUP" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "users 表备份成功: $USERS_BACKUP"
    else
        print_warning "users 表备份失败（可能表不存在）"
    fi
}

# 执行迁移脚本
execute_migration() {
    print_info "开始执行 RBAC 迁移脚本..."
    
    if [ ! -f "$MIGRATION_SCRIPT" ]; then
        print_error "迁移脚本不存在: $MIGRATION_SCRIPT"
        exit 1
    fi
    
    docker exec -i "$DB_CONTAINER" mysql \
        -u "$DB_USER" \
        -p"$DB_PASSWORD" \
        "$DB_NAME" < "$MIGRATION_SCRIPT" 2>&1 | grep -v "Warning: Using a password"
    
    if [ $? -eq 0 ]; then
        print_success "RBAC 迁移脚本执行成功！"
    else
        print_error "迁移脚本执行失败！"
        print_warning "请检查错误信息，必要时使用备份恢复数据"
        exit 1
    fi
}

# 验证迁移结果
verify_migration() {
    print_info "验证迁移结果..."
    
    # 检查新表是否创建成功
    TABLES=(
        "user_profiles"
        "employee_profiles"
        "customer_profiles"
        "user_permissions"
        "data_permissions"
        "role_inheritance"
    )
    
    for table in "${TABLES[@]}"; do
        COUNT=$(docker exec "$DB_CONTAINER" mysql \
            -u "$DB_USER" \
            -p"$DB_PASSWORD" \
            -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME' AND table_name='$table';" 2>/dev/null)
        
        if [ "$COUNT" -eq 1 ]; then
            print_success "✓ 表 $table 创建成功"
        else
            print_error "✗ 表 $table 创建失败"
        fi
    done
    
    # 检查数据迁移
    print_info "检查数据迁移情况..."
    
    USER_COUNT=$(docker exec "$DB_CONTAINER" mysql \
        -u "$DB_USER" \
        -p"$DB_PASSWORD" \
        -N -e "SELECT COUNT(*) FROM $DB_NAME.user_profiles;" 2>/dev/null)
    
    print_info "user_profiles 表记录数: $USER_COUNT"
    
    EMPLOYEE_COUNT=$(docker exec "$DB_CONTAINER" mysql \
        -u "$DB_USER" \
        -p"$DB_PASSWORD" \
        -N -e "SELECT COUNT(*) FROM $DB_NAME.employee_profiles;" 2>/dev/null)
    
    print_info "employee_profiles 表记录数: $EMPLOYEE_COUNT"
    
    # 检查视图
    VIEW_EXISTS=$(docker exec "$DB_CONTAINER" mysql \
        -u "$DB_USER" \
        -p"$DB_PASSWORD" \
        -N -e "SELECT COUNT(*) FROM information_schema.views WHERE table_schema='$DB_NAME' AND table_name='users';" 2>/dev/null)
    
    if [ "$VIEW_EXISTS" -eq 1 ]; then
        print_success "✓ users 视图创建成功（保持向后兼容）"
    else
        print_warning "✗ users 视图创建失败"
    fi
    
    # 检查权限数据
    PERM_COUNT=$(docker exec "$DB_CONTAINER" mysql \
        -u "$DB_USER" \
        -p"$DB_PASSWORD" \
        -N -e "SELECT COUNT(*) FROM $DB_NAME.permissions;" 2>/dev/null)
    
    print_info "permissions 表记录数: $PERM_COUNT"
    
    ROLE_COUNT=$(docker exec "$DB_CONTAINER" mysql \
        -u "$DB_USER" \
        -p"$DB_PASSWORD" \
        -N -e "SELECT COUNT(*) FROM $DB_NAME.roles;" 2>/dev/null)
    
    print_info "roles 表记录数: $ROLE_COUNT"
}

# 显示迁移总结
show_summary() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}RBAC 权限系统改造完成！${NC}"
    echo "=========================================="
    echo ""
    echo "📋 改造内容："
    echo "  ✓ 用户表拆分为多表结构"
    echo "  ✓ 创建员工和客户扩展表"
    echo "  ✓ 增强角色和权限表"
    echo "  ✓ 新增用户权限、数据权限表"
    echo "  ✓ 创建 users 视图保持兼容性"
    echo "  ✓ 初始化基础权限数据"
    echo ""
    echo "📁 备份文件位置："
    echo "  $BACKUP_DIR"
    echo ""
    echo "📖 详细文档："
    echo "  docs/RBAC_MIGRATION_GUIDE.md"
    echo ""
    echo "🔧 下一步操作："
    echo "  1. 查看文档了解新的权限系统"
    echo "  2. 重启后端服务使改动生效"
    echo "  3. 测试登录和权限功能"
    echo ""
    echo "⚠️  注意事项："
    echo "  - 现有代码无需修改（通过视图兼容）"
    echo "  - 如遇问题可使用备份恢复"
    echo "  - 建议在测试环境先验证"
    echo ""
}

# 回滚函数
rollback() {
    print_warning "开始回滚到备份..."
    
    if [ -z "$1" ]; then
        print_error "请指定备份文件路径"
        echo "用法: $0 rollback <backup_file>"
        exit 1
    fi
    
    BACKUP_FILE="$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "备份文件不存在: $BACKUP_FILE"
        exit 1
    fi
    
    print_info "从备份恢复: $BACKUP_FILE"
    
    docker exec -i "$DB_CONTAINER" mysql \
        -u "$DB_USER" \
        -p"$DB_PASSWORD" \
        "$DB_NAME" < "$BACKUP_FILE" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "数据库恢复成功！"
    else
        print_error "数据库恢复失败！"
        exit 1
    fi
}

# 主函数
main() {
    echo ""
    echo "=========================================="
    echo "  ShopPro RBAC 权限系统改造工具"
    echo "=========================================="
    echo ""
    
    # 检查参数
    if [ "$1" == "rollback" ]; then
        rollback "$2"
        exit 0
    fi
    
    # 确认执行
    print_warning "此操作将修改数据库结构，建议先在测试环境验证！"
    read -p "是否继续？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "操作已取消"
        exit 0
    fi
    
    # 执行步骤
    check_docker
    create_backup_dir
    backup_database
    backup_users_table
    execute_migration
    verify_migration
    show_summary
    
    print_success "所有操作完成！"
}

# 执行主函数
main "$@"
