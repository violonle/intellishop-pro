package com.shoppro.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DbInitConfig {

    @Bean
    @org.springframework.core.annotation.Order(1)
    public ApplicationRunner initTables(JdbcTemplate jdbcTemplate) {
        return args -> {
            System.out.println("Starting DbInitRunner: Initializing schema...");
            try {
                initializeBusinessSchema(jdbcTemplate);
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS system_configs (" +
                        "id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                        "config_key VARCHAR(100) NOT NULL UNIQUE," +
                        "config_value TEXT," +
                        "description VARCHAR(255)," +
                        "is_system TINYINT DEFAULT 0" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
                jdbcTemplate.update("INSERT INTO system_configs (config_key, config_value, description, is_system) " +
                        "VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE config_key=config_key",
                        "role.rank.config", "[{\"category\":\"管理职\",\"levels\":[\"M1\",\"M2\",\"M3\"]},{\"category\":\"专业职\",\"levels\":[\"P1\",\"P2\",\"P3\"]},{\"category\":\"操作职\",\"levels\":[\"O1\",\"O2\",\"O3\"]}]", "职级体系配置");
                // AI Scenarios
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS ai_scenarios (" +
                        "id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                        "code VARCHAR(50) UNIQUE NOT NULL COMMENT '场景代码'," +
                        "name VARCHAR(100) NOT NULL COMMENT '场景名称'," +
                        "description VARCHAR(500) COMMENT '描述'," +
                        "model_config JSON COMMENT '模型配置'," +
                        "is_enabled TINYINT DEFAULT 1 COMMENT '是否启用'," +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                        "INDEX idx_scenario_code (code)" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 场景配置表'");

                // Sales Scripts
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS sales_scripts (" +
                        "id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                        "title VARCHAR(200) NOT NULL COMMENT '话术标题'," +
                        "category VARCHAR(50) COMMENT '分类'," +
                        "content TEXT COMMENT '话术内容'," +
                        "tags VARCHAR(200) COMMENT '标签'," +
                        "usage_count INT DEFAULT 0 COMMENT '使用次数'," +
                        "success_rate DECIMAL(5,2) DEFAULT 0 COMMENT '成功率'," +
                        "last_used_at TIMESTAMP NULL COMMENT '最后使用时间'," +
                        "is_recommended TINYINT DEFAULT 0 COMMENT '是否推荐'," +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                        "INDEX idx_script_category (category)" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售话术表'");

                // Customer Personas
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS customer_personas (" +
                        "id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                        "customer_id BIGINT NOT NULL COMMENT '客户ID'," +
                        "tags JSON COMMENT '标签'," +
                        "score INT DEFAULT 0 COMMENT '画像评分'," +
                        "analysis_json JSON COMMENT '详细分析JSON'," +
                        "generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间'," +
                        "INDEX idx_persona_customer (customer_id)" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户画像表'");

                // AI Models
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS ai_models (" +
                        "id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                        "name VARCHAR(100) NOT NULL COMMENT '模型名称'," +
                        "provider VARCHAR(50) NOT NULL COMMENT '提供商'," +
                        "version VARCHAR(50) COMMENT '版本'," +
                        "status TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用'," +
                        "rpm VARCHAR(20) COMMENT '每分钟请求数'," +
                        "api_key VARCHAR(200) COMMENT 'API密钥'," +
                        "base_url VARCHAR(200) COMMENT '基础URL'," +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI模型表'");

                System.out.println("ShopPro schema initialized successfully.");
            } catch (Exception e) {
                System.err.println("Failed to initialize AI tables: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }

    private void initializeBusinessSchema(JdbcTemplate jdbcTemplate) {
        createOperationalTables(jdbcTemplate);
        addColumnIfMissing(jdbcTemplate, "users", "enterprise_id",
                "ALTER TABLE users ADD COLUMN enterprise_id BIGINT NULL AFTER department_id");
        addColumnIfMissing(jdbcTemplate, "customers", "enterprise_id",
                "ALTER TABLE customers ADD COLUMN enterprise_id BIGINT NULL AFTER assigned_to");
        addColumnIfMissing(jdbcTemplate, "leads", "enterprise_id",
                "ALTER TABLE leads ADD COLUMN enterprise_id BIGINT NULL AFTER assigned_to");
        addColumnIfMissing(jdbcTemplate, "roles", "deleted",
                "ALTER TABLE roles ADD COLUMN deleted TINYINT NOT NULL DEFAULT 0 AFTER updated_at");
        addColumnIfMissing(jdbcTemplate, "roles", "level_name",
                "ALTER TABLE roles ADD COLUMN level_name VARCHAR(50) NULL AFTER level");
        addColumnIfMissing(jdbcTemplate, "permissions", "deleted",
                "ALTER TABLE permissions ADD COLUMN deleted TINYINT NOT NULL DEFAULT 0 AFTER updated_at");

        jdbcTemplate.update("UPDATE users SET enterprise_id = 1 WHERE enterprise_id IS NULL");
        jdbcTemplate.update("UPDATE customers SET enterprise_id = 1 WHERE enterprise_id IS NULL");
        jdbcTemplate.update("UPDATE leads SET enterprise_id = 1 WHERE enterprise_id IS NULL");

        String roleSql = "INSERT INTO roles (name, code, display_name, description, level, level_name, sort_order, status, role_type, data_scope) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?) " +
                "ON DUPLICATE KEY UPDATE name=VALUES(name), display_name=VALUES(display_name), description=VALUES(description), " +
                "level=VALUES(level), level_name=VALUES(level_name), sort_order=VALUES(sort_order), status=1, " +
                "role_type=VALUES(role_type), data_scope=VALUES(data_scope), deleted=0";
        seedRole(jdbcTemplate, roleSql, "平台超级管理员", "super_admin", "平台全部权限", 100, "平台级", 10, "platform", "all");
        seedRole(jdbcTemplate, roleSql, "平台管理员", "platform_admin", "平台运营管理", 90, "平台级", 20, "platform", "all");
        seedRole(jdbcTemplate, roleSql, "企业管理员", "enterprise_admin", "企业配置、团队和销售参数管理", 80, "企业级", 30, "enterprise", "department_and_sub");
        seedRole(jdbcTemplate, roleSql, "销售负责人", "sales_director", "企业销售团队负责人", 60, "负责人", 40, "enterprise", "department_and_sub");
        seedRole(jdbcTemplate, roleSql, "销售经理", "sales_manager", "管理销售专员和团队业绩", 50, "经理", 50, "enterprise", "department_and_sub");
        seedRole(jdbcTemplate, roleSql, "销售专员", "sales", "负责本人线索、客户和跟进", 30, "专员", 60, "enterprise", "self");
        seedRole(jdbcTemplate, roleSql, "部门经理", "manager", "部门级业务管理", 50, "经理", 70, "system", "department_and_sub");
        seedRole(jdbcTemplate, roleSql, "普通用户", "user", "基础业务访问", 10, "普通", 80, "system", "self");
    }

    private void createOperationalTables(JdbcTemplate jdbcTemplate) {
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS automation_rules (" +
                "id BIGINT PRIMARY KEY AUTO_INCREMENT,tenant_id BIGINT NOT NULL,name VARCHAR(200) NOT NULL," +
                "description VARCHAR(500),trigger_event VARCHAR(100) NOT NULL,conditions TEXT,actions TEXT," +
                "is_active TINYINT DEFAULT 1,execution_count INT DEFAULT 0,last_executed_at DATETIME NULL," +
                "priority INT DEFAULT 0,created_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
                "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                "INDEX idx_automation_tenant (tenant_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS sop_templates (" +
                "id BIGINT PRIMARY KEY AUTO_INCREMENT,enterprise_id BIGINT NOT NULL,name VARCHAR(200) NOT NULL," +
                "description VARCHAR(500),steps TEXT,created_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
                "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                "INDEX idx_sop_enterprise (enterprise_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS customer_sops (" +
                "id BIGINT PRIMARY KEY AUTO_INCREMENT,customer_id BIGINT NOT NULL,sop_template_id BIGINT NOT NULL," +
                "status VARCHAR(30) NOT NULL,current_step INT DEFAULT 1,created_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
                "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                "INDEX idx_customer_sop_customer (customer_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS work_tasks (" +
                "id BIGINT PRIMARY KEY AUTO_INCREMENT,enterprise_id BIGINT NOT NULL,user_id BIGINT NOT NULL," +
                "customer_id BIGINT NULL,customer_sop_id BIGINT NULL,type VARCHAR(30),title VARCHAR(200) NOT NULL," +
                "description TEXT,status VARCHAR(30) NOT NULL,due_time DATETIME NULL,created_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
                "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                "INDEX idx_work_task_enterprise (enterprise_id),INDEX idx_work_task_user (user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS sop_audits (" +
                "id BIGINT PRIMARY KEY AUTO_INCREMENT,tenant_id BIGINT NOT NULL,sop_template_id BIGINT NULL," +
                "rule_name VARCHAR(200),trigger_event VARCHAR(100),target_type VARCHAR(50),target_name VARCHAR(200)," +
                "target_id BIGINT NULL,status VARCHAR(30),error_message TEXT,executed_at DATETIME NULL,duration INT NULL," +
                "created_at DATETIME DEFAULT CURRENT_TIMESTAMP,INDEX idx_sop_audit_tenant (tenant_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS channel_codes (" +
                "id BIGINT PRIMARY KEY AUTO_INCREMENT,enterprise_id BIGINT NOT NULL,user_id BIGINT NOT NULL," +
                "channel_type VARCHAR(50) NOT NULL,channel_name VARCHAR(200) NOT NULL,code_url VARCHAR(500)," +
                "description VARCHAR(500),scan_count INT DEFAULT 0,follow_count INT DEFAULT 0," +
                "created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                "INDEX idx_channel_enterprise (enterprise_id),INDEX idx_channel_user (user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS channel_code_stats (" +
                "id BIGINT PRIMARY KEY AUTO_INCREMENT,channel_code_id BIGINT NOT NULL,stat_date DATE NOT NULL," +
                "scan_count INT DEFAULT 0,follow_count INT DEFAULT 0,created_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
                "UNIQUE KEY uk_channel_stat_day (channel_code_id,stat_date)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS welcome_messages (" +
                "id BIGINT PRIMARY KEY AUTO_INCREMENT,tenant_id BIGINT NOT NULL,channel_code_id BIGINT NULL," +
                "channel_code_name VARCHAR(200),msg_type VARCHAR(50),content TEXT,is_active TINYINT DEFAULT 1," +
                "priority INT DEFAULT 0,created_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
                "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                "INDEX idx_welcome_tenant (tenant_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS marketing_fission (" +
                "id BIGINT PRIMARY KEY AUTO_INCREMENT,enterprise_id BIGINT NOT NULL,name VARCHAR(200) NOT NULL," +
                "type VARCHAR(50),config TEXT,status TINYINT DEFAULT 1,created_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
                "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                "INDEX idx_fission_enterprise (enterprise_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    }

    private void addColumnIfMissing(JdbcTemplate jdbcTemplate, String table, String column, String sql) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
                Integer.class, table, column);
        if (count != null && count == 0) {
            jdbcTemplate.execute(sql);
        }
    }

    private void seedRole(JdbcTemplate jdbcTemplate, String sql, String name, String code, String description,
                          int level, String levelName, int sortOrder, String roleType, String dataScope) {
        jdbcTemplate.update(sql, name, code, name, description, level, levelName, sortOrder, roleType, dataScope);
    }
}
