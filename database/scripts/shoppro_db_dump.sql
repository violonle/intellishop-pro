-- MySQL dump 10.13  Distrib 8.0.44, for Linux (aarch64)
--
-- Host: localhost    Database: shoppro_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `shoppro_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `shoppro_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `shoppro_db`;

--
-- Table structure for table `ai_analytics`
--

DROP TABLE IF EXISTS `ai_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_analytics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `entity_type` enum('customer','lead','sales','product') COLLATE utf8mb4_general_ci NOT NULL COMMENT '分析对象类型',
  `entity_id` bigint NOT NULL COMMENT '分析对象ID',
  `analysis_type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '分析类型',
  `algorithm` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '使用的算法',
  `input_data` json DEFAULT NULL COMMENT '输入数据',
  `result` json DEFAULT NULL COMMENT '分析结果',
  `confidence_score` float DEFAULT NULL COMMENT '置信度（0-1）',
  `model_version` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '模型版本',
  `processing_time` int DEFAULT NULL COMMENT '处理时间（毫秒）',
  `status` enum('pending','completed','failed') COLLATE utf8mb4_general_ci DEFAULT 'pending' COMMENT '分析状态',
  `error_message` text COLLATE utf8mb4_general_ci COMMENT '错误信息',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_type` (`analysis_type`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='AI分析结果表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_analytics`
--

LOCK TABLES `ai_analytics` WRITE;
/*!40000 ALTER TABLE `ai_analytics` DISABLE KEYS */;
INSERT INTO `ai_analytics` VALUES (1,'customer',1,'customer_profile','RandomForest',NULL,'{\"profile\": \"高价值客户\", \"risk_level\": \"低\", \"purchase_tendency\": \"高\", \"preferred_products\": [\"ERP\", \"数据分析\"]}',0.89,'v2.1',1250,'completed',NULL,'2025-10-24 07:20:00'),(2,'lead',1,'success_prediction','GradientBoosting',NULL,'{\"key_factors\": [\"预算充足\", \"决策快\", \"需求明确\"], \"recommendation\": \"重点跟进，建议提供定制方案\", \"success_probability\": 0.85}',0.92,'v2.1',980,'completed',NULL,'2025-10-24 07:20:00'),(3,'customer',3,'churn_risk','LogisticRegression',NULL,'{\"risk_factors\": [\"沟通频率高\", \"满意度高\"], \"retention_score\": 0.95, \"churn_probability\": 0.15}',0.87,'v2.1',756,'completed',NULL,'2025-10-24 07:20:00');
/*!40000 ALTER TABLE `ai_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_models`
--

DROP TABLE IF EXISTS `ai_models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_models` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `status` tinyint DEFAULT '1',
  `rpm` varchar(20) DEFAULT NULL,
  `api_key` varchar(200) DEFAULT NULL,
  `base_url` varchar(200) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_models`
--

LOCK TABLES `ai_models` WRITE;
/*!40000 ALTER TABLE `ai_models` DISABLE KEYS */;
INSERT INTO `ai_models` VALUES (1,'GPT-4 Turbo','OpenAI','gpt-4-turbo-preview',1,'10000',NULL,NULL,'2025-12-20 03:53:35','2025-12-20 03:53:35'),(2,'GPT-3.5 Turbo','OpenAI','gpt-3.5-turbo',1,'20000',NULL,NULL,'2025-12-20 03:53:35','2025-12-20 03:53:35'),(3,'Claude 3 Opus','Anthropic','claude-3-opus-20240229',1,'5000',NULL,NULL,'2025-12-20 03:53:35','2025-12-20 03:53:35');
/*!40000 ALTER TABLE `ai_models` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_scenarios`
--

DROP TABLE IF EXISTS `ai_scenarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_scenarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT '场景代码',
  `name` varchar(100) NOT NULL COMMENT '场景名称',
  `description` varchar(500) DEFAULT NULL COMMENT '描述',
  `model_config` json DEFAULT NULL COMMENT '模型配置',
  `is_enabled` tinyint DEFAULT '1' COMMENT '是否启用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_scenario_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI 场景配置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_scenarios`
--

LOCK TABLES `ai_scenarios` WRITE;
/*!40000 ALTER TABLE `ai_scenarios` DISABLE KEYS */;
INSERT INTO `ai_scenarios` VALUES (1,'ai_assistant','AI 智能助理','提供智能对话、任务辅助和实时决策建议','{\"model\": \"gpt-4\", \"temperature\": 0.7}',1,'2025-12-20 03:53:35','2025-12-20 03:53:35','conversation'),(2,'sales_script','智能话术推荐','根据客户画像和上下文推荐最佳销售话术','{\"model\": \"gpt-3.5-turbo\", \"temperature\": 0.8}',1,'2025-12-20 03:53:35','2025-12-20 03:53:35','conversation'),(3,'sales_team_analysis','销售团队洞察','分析销售团队业绩，识别优劣势并提供改进建议','{\"model\": \"gpt-4\", \"temperature\": 0.6}',1,'2025-12-20 03:53:35','2025-12-20 03:53:35','analysis'),(4,'user_persona','用户画像分析','深度分析客户特征、需求和决策倾向','{\"model\": \"gpt-4\", \"temperature\": 0.5}',1,'2025-12-20 03:53:35','2025-12-20 03:53:35','analysis'),(5,'lead_evaluation','线索智能评估','评估线索质量、意向度和成交概率','{\"model\": \"gpt-4\", \"temperature\": 0.3}',1,'2025-12-20 03:53:35','2025-12-20 03:53:35','analysis'),(6,'risk_alert','智能风险预警','实时监控业务风险并提供预警','{\"model\": \"rule_engine\", \"threshold\": 0.8}',1,'2025-12-20 03:53:35','2025-12-20 03:53:35','prediction'),(7,'sales_analytics_insight','AI 智能洞察','针对高级分析页面提供深度业务洞察建议','{\"model\": \"gpt-4\", \"temperature\": 0.5}',1,'2025-12-20 03:53:35','2025-12-20 03:53:35','analysis');
/*!40000 ALTER TABLE `ai_scenarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_personas`
--

DROP TABLE IF EXISTS `customer_personas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_personas` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL COMMENT '客户ID',
  `tags` json DEFAULT NULL COMMENT '标签',
  `score` int DEFAULT '0' COMMENT '画像评分',
  `analysis_json` json DEFAULT NULL COMMENT '详细分析JSON',
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
  PRIMARY KEY (`id`),
  KEY `idx_persona_customer` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='客户画像表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_personas`
--

LOCK TABLES `customer_personas` WRITE;
/*!40000 ALTER TABLE `customer_personas` DISABLE KEYS */;
INSERT INTO `customer_personas` VALUES (1,1,'[\"价格敏感\", \"竞品对比\", \"家庭用车\"]',85,'{\"name\": \"张先生\", \"work\": \"IT行业中层管理，年薪30-40万，工作忙碌\", \"avatar\": \"text-blue-600 bg-blue-100\", \"family\": \"已婚，一孩（5岁），父母同住\", \"economics\": \"中产阶级，注重性价比，对后期用车成本敏感（油耗/保养）\", \"personality\": \"理性分析型，决策周期长，喜欢研究参数配置，容易受专家评测影响\", \"productTarget\": \"20-25万区间，大空间SUV，高安全性，智能配置丰富\", \"suggestedScript\": \"张先生，考虑到您对家庭出行的重视，Model Y的超大空间和五星安全评级非常适合您。而且相比燃油车，它每年能为您节省约1.5万元的养车成本，性价比极高。\"}','2025-12-20 03:53:35'),(2,2,'[\"外观控\", \"注重安全\", \"首次购车\"]',92,'{\"name\": \"李女士\", \"work\": \"新媒体运营，审美要求高，追求时尚\", \"avatar\": \"text-purple-600 bg-purple-100\", \"family\": \"未婚，独居，养一只猫\", \"economics\": \"消费观念开放，愿意为颜值和品牌溢价买单，不太关注具体参数\", \"personality\": \"感性冲动型，决策快，注重第一眼眼缘，容易受朋友推荐影响\", \"productTarget\": \"15-20万区间，精致小车/轿跑，外观时尚，内饰精致，好停车\", \"suggestedScript\": \"李女士，这款车的星空灰配色非常符合您的气质。它的360全景影像能让您停车特别轻松，而且内饰采用了环保材质，即便是新车也没有任何异味，对您养猫也更友好。\"}','2025-12-20 03:53:35');
/*!40000 ALTER TABLE `customer_personas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_profiles`
--

DROP TABLE IF EXISTS `customer_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `customer_no` varchar(50) DEFAULT NULL COMMENT '客户编号',
  `company_name` varchar(200) DEFAULT NULL COMMENT '公司名称',
  `industry` varchar(100) DEFAULT NULL COMMENT '所属行业',
  `level` enum('vip','high','medium','low') DEFAULT 'medium' COMMENT '客户等级',
  `source` varchar(100) DEFAULT NULL COMMENT '客户来源',
  `owner_id` bigint DEFAULT NULL COMMENT '负责销售ID',
  `tags` json DEFAULT NULL COMMENT '客户标签',
  `last_purchase_at` timestamp NULL DEFAULT NULL COMMENT '最后购买时间',
  `total_purchase_amount` decimal(12,2) DEFAULT '0.00' COMMENT '累计消费金额',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `customer_no` (`customer_no`),
  KEY `idx_owner` (`owner_id`),
  KEY `idx_level` (`level`),
  CONSTRAINT `customer_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='客户扩展信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_profiles`
--

LOCK TABLES `customer_profiles` WRITE;
/*!40000 ALTER TABLE `customer_profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '客户姓名',
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '联系电话',
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '邮箱地址',
  `wechat` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '微信号',
  `gender` enum('male','female','unknown') COLLATE utf8mb4_general_ci DEFAULT 'unknown' COMMENT '性别',
  `age` int DEFAULT NULL COMMENT '年龄',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `source` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '客户来源',
  `level` enum('normal','vip','diamond') COLLATE utf8mb4_general_ci DEFAULT 'normal' COMMENT '客户等级',
  `status` enum('active','inactive','potential','lost') COLLATE utf8mb4_general_ci DEFAULT 'potential' COMMENT '客户状态',
  `tags` json DEFAULT NULL COMMENT '客户标签',
  `address` text COLLATE utf8mb4_general_ci COMMENT '联系地址',
  `company` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '公司名称',
  `position` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '职位',
  `annual_income` decimal(12,2) DEFAULT NULL COMMENT '年收入',
  `preferences` json DEFAULT NULL COMMENT '偏好设置',
  `notes` text COLLATE utf8mb4_general_ci COMMENT '备注信息',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `assigned_to` bigint DEFAULT NULL COMMENT '分配给',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_phone` (`phone`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_level` (`level`),
  KEY `idx_source` (`source`),
  KEY `idx_assigned` (`assigned_to`),
  KEY `idx_created_by` (`created_by`),
  FULLTEXT KEY `ft_search` (`name`,`phone`,`company`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users_backup_20251220` (`id`) ON DELETE SET NULL,
  CONSTRAINT `customers_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users_backup_20251220` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='客户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'李先生','13900000001','li@example.com','wechat_li','male',35,NULL,'官网咨询','vip','active','[\"高价值客户\", \"决策者\", \"技术导向\"]',NULL,'上海科技有限公司','CEO',1000000.00,NULL,'对高端产品有强烈需求',3,3,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(2,'王女士','13900000002','wang@example.com','wechat_wang','female',28,NULL,'朋友推荐','normal','potential','[\"价格敏感\", \"质量要求高\"]',NULL,'广州贸易公司','采购经理',300000.00,NULL,'需要详细的产品对比资料',3,4,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(3,'张总','13900000003','zhang@example.com','wechat_zhang','male',42,NULL,'展会','diamond','active','[\"大客户\", \"决策快\", \"品质要求高\"]',NULL,'北京集团公司','副总经理',2000000.00,NULL,'公司规模大，有批量采购需求',4,3,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(4,'刘经理','13900000004','liu@example.com','wechat_liu','male',39,NULL,'电话咨询','vip','potential','[\"成本控制\", \"效率优先\"]',NULL,'深圳制造企业','运营经理',500000.00,NULL,'关注产品的性价比和服务质量',4,5,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(5,'陈小姐','13900000005','chen@example.com','wechat_chen','female',31,NULL,'网络广告','normal','inactive','[\"创意导向\", \"个性化需求\"]',NULL,'成都设计工作室','设计总监',200000.00,NULL,'对产品外观和用户体验要求较高',5,4,'2025-10-24 07:20:00','2025-10-24 07:20:00',0);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_permissions`
--

DROP TABLE IF EXISTS `data_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL COMMENT '用户ID',
  `role_id` bigint DEFAULT NULL COMMENT '角色ID',
  `resource_type` varchar(50) NOT NULL COMMENT '资源类型',
  `resource_id` bigint DEFAULT NULL COMMENT '资源ID',
  `permission_scope` enum('read','write','delete','all') DEFAULT 'read' COMMENT '权限范围',
  `conditions` json DEFAULT NULL COMMENT '条件表达式',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dp_user` (`user_id`),
  KEY `idx_dp_role` (`role_id`),
  KEY `idx_dp_resource` (`resource_type`,`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='数据权限表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_permissions`
--

LOCK TABLES `data_permissions` WRITE;
/*!40000 ALTER TABLE `data_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '部门名称',
  `parent_id` bigint DEFAULT '0' COMMENT '父部门ID',
  `manager_id` bigint DEFAULT NULL COMMENT '部门经理ID',
  `description` text COLLATE utf8mb4_general_ci COMMENT '部门描述',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` tinyint DEFAULT '1' COMMENT '状态：1-正常，0-禁用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `manager_id` (`manager_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `users_backup_20251220` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='部门表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'总经理办',0,NULL,'公司最高管理层',1,1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(2,'销售部',1,2,'负责产品销售和客户关系管理',2,1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(3,'市场部',1,NULL,'负责市场推广和品牌建设',3,1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(4,'技术部',1,NULL,'负责产品研发和技术支持',4,1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(5,'客服部',1,NULL,'负责客户服务和售后支持',5,1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(6,'销售一组',2,3,'主要负责华东地区销售',6,1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(7,'销售二组',2,4,'主要负责华北地区销售',7,1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(8,'销售三组',2,5,'主要负责华南地区销售',8,1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0);
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_profiles`
--

DROP TABLE IF EXISTS `employee_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `employee_no` varchar(50) DEFAULT NULL COMMENT '工号',
  `department_id` bigint DEFAULT NULL COMMENT '部门ID',
  `position` varchar(100) DEFAULT NULL COMMENT '职位',
  `entry_date` date DEFAULT NULL COMMENT '入职日期',
  `direct_manager_id` bigint DEFAULT NULL COMMENT '直属上级ID',
  `work_location` varchar(200) DEFAULT NULL COMMENT '工作地点',
  `employment_type` enum('full_time','part_time','contract','intern') DEFAULT 'full_time' COMMENT '雇佣类型',
  `sales_targets` json DEFAULT NULL COMMENT '销售目标(周/月/季)',
  `kpi_config` json DEFAULT NULL COMMENT 'KPI配置',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `employee_no` (`employee_no`),
  KEY `idx_department` (`department_id`),
  KEY `idx_manager` (`direct_manager_id`),
  CONSTRAINT `employee_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='员工扩展信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_profiles`
--

LOCK TABLES `employee_profiles` WRITE;
/*!40000 ALTER TABLE `employee_profiles` DISABLE KEYS */;
INSERT INTO `employee_profiles` VALUES (1,1,NULL,1,NULL,NULL,NULL,NULL,'full_time',NULL,NULL,'2025-12-20 07:25:22','2025-12-20 07:25:22'),(2,2,NULL,2,NULL,NULL,NULL,NULL,'full_time',NULL,NULL,'2025-12-20 07:25:22','2025-12-20 07:25:22'),(3,3,NULL,6,NULL,NULL,NULL,NULL,'full_time',NULL,NULL,'2025-12-20 07:25:22','2025-12-20 07:25:22'),(4,4,NULL,7,NULL,NULL,NULL,NULL,'full_time',NULL,NULL,'2025-12-20 07:25:22','2025-12-20 07:25:22'),(5,5,NULL,8,NULL,NULL,NULL,NULL,'full_time',NULL,NULL,'2025-12-20 07:25:22','2025-12-20 07:25:22'),(6,8,NULL,6,NULL,NULL,NULL,NULL,'full_time',NULL,NULL,'2025-12-22 05:50:11','2025-12-22 05:50:11'),(7,9,NULL,2,NULL,NULL,NULL,NULL,'full_time',NULL,NULL,'2025-12-22 05:50:11','2025-12-22 05:50:11');
/*!40000 ALTER TABLE `employee_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enterprise`
--

DROP TABLE IF EXISTS `enterprise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enterprise` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '企业名称',
  `short_name` varchar(50) DEFAULT NULL COMMENT '企业简称',
  `social_code` varchar(50) DEFAULT NULL COMMENT '统一社会信用代码',
  `legal_person` varchar(50) DEFAULT NULL COMMENT '法人',
  `business_license_url` varchar(255) DEFAULT NULL COMMENT '营业执照',
  `id_card_front_url` varchar(255) DEFAULT NULL COMMENT '身份证正面',
  `id_card_back_url` varchar(255) DEFAULT NULL COMMENT '身份证背面',
  `contact_name` varchar(50) DEFAULT NULL COMMENT '联系人',
  `contact_phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `address` varchar(255) DEFAULT NULL COMMENT '地址',
  `status` tinyint DEFAULT '0' COMMENT '0待审核 1已认证 2驳回',
  `reject_reason` varchar(255) DEFAULT NULL COMMENT '驳回原因',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='企业信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enterprise`
--

LOCK TABLES `enterprise` WRITE;
/*!40000 ALTER TABLE `enterprise` DISABLE KEYS */;
/*!40000 ALTER TABLE `enterprise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enterprises`
--

DROP TABLE IF EXISTS `enterprises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enterprises` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL COMMENT '企业名称',
  `code` varchar(50) DEFAULT NULL COMMENT '企业代码',
  `legal_name` varchar(200) DEFAULT NULL COMMENT '企业法定名称',
  `contact_person` varchar(100) DEFAULT NULL COMMENT '联系人',
  `contact_phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `contact_email` varchar(100) DEFAULT NULL COMMENT '联系邮箱',
  `address` varchar(500) DEFAULT NULL COMMENT '企业地址',
  `logo_url` varchar(255) DEFAULT NULL COMMENT 'Logo URL',
  `status` tinyint DEFAULT '1' COMMENT '状态: 1-正常, 0-禁用',
  `subscription_plan_id` bigint DEFAULT NULL COMMENT '订阅套餐ID',
  `subscription_expire_at` timestamp NULL DEFAULT NULL COMMENT '订阅过期时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='企业表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enterprises`
--

LOCK TABLES `enterprises` WRITE;
/*!40000 ALTER TABLE `enterprises` DISABLE KEYS */;
INSERT INTO `enterprises` VALUES (1,'ShopPro 平台','platform','ShopPro 智能营销系统',NULL,NULL,NULL,NULL,NULL,1,3,NULL,'2025-12-20 13:02:50','2025-12-20 13:02:50');
/*!40000 ALTER TABLE `enterprises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file_uploads`
--

DROP TABLE IF EXISTS `file_uploads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `file_uploads` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `original_file_name` varchar(255) DEFAULT NULL COMMENT '原始文件名',
  `saved_file_name` varchar(255) DEFAULT NULL COMMENT '保存文件名',
  `file_url` varchar(500) DEFAULT NULL COMMENT '访问URL',
  `file_size` bigint DEFAULT NULL COMMENT '文件大小',
  `mime_type` varchar(100) DEFAULT NULL COMMENT '文件类型',
  `file_extension` varchar(20) DEFAULT NULL COMMENT '扩展名',
  `related_entity_type` varchar(50) DEFAULT NULL COMMENT '关联实体类型',
  `related_entity_id` bigint DEFAULT NULL COMMENT '关联实体ID',
  `uploaded_by` bigint DEFAULT NULL COMMENT '上传人ID',
  `uploaded_by_name` varchar(100) DEFAULT NULL COMMENT '上传人',
  `status` tinyint DEFAULT '1' COMMENT '1有效 0删除',
  `md5_hash` varchar(64) DEFAULT NULL COMMENT 'MD5',
  `download_count` int DEFAULT '0',
  `remarks` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_file_md5` (`md5_hash`),
  KEY `idx_file_related` (`related_entity_type`,`related_entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='文件上传记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file_uploads`
--

LOCK TABLES `file_uploads` WRITE;
/*!40000 ALTER TABLE `file_uploads` DISABLE KEYS */;
/*!40000 ALTER TABLE `file_uploads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follow_up_records`
--

DROP TABLE IF EXISTS `follow_up_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follow_up_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lead_id` bigint DEFAULT NULL COMMENT '线索ID',
  `customer_id` bigint DEFAULT NULL COMMENT '客户ID',
  `user_id` bigint NOT NULL COMMENT '跟进人ID',
  `type` enum('call','email','wechat','visit','sms','douyin','other') COLLATE utf8mb4_general_ci NOT NULL COMMENT '跟进方式',
  `title` varchar(200) COLLATE utf8mb4_general_ci NOT NULL COMMENT '跟进标题',
  `content` text COLLATE utf8mb4_general_ci COMMENT '跟进内容',
  `result` enum('positive','neutral','negative') COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '跟进结果',
  `next_follow_up_date` datetime DEFAULT NULL COMMENT '下次跟进时间',
  `attachments` json DEFAULT NULL COMMENT '附件信息',
  `duration` int DEFAULT NULL COMMENT '跟进时长（分钟）',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_lead` (`lead_id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `follow_up_records_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `follow_up_records_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `follow_up_records_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users_backup_20251220` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='跟进记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follow_up_records`
--

LOCK TABLES `follow_up_records` WRITE;
/*!40000 ALTER TABLE `follow_up_records` DISABLE KEYS */;
INSERT INTO `follow_up_records` VALUES (1,1,1,3,'call','电话沟通ERP需求','详细了解了客户的业务流程和系统需求，客户对我们的解决方案很感兴趣','positive','2024-10-20 14:00:00',NULL,NULL,'2025-10-24 07:20:00',0),(2,1,1,3,'visit','现场演示ERP系统','在客户公司进行了2小时的系统演示，客户高度认可产品功能','positive','2024-10-22 10:00:00',NULL,NULL,'2025-10-24 07:20:00',0),(3,2,2,4,'wechat','微信发送产品资料','通过微信发送了库存管理系统的详细资料和案例','neutral','2024-10-22 16:00:00',NULL,NULL,'2025-10-24 07:20:00',0),(4,3,3,3,'email','发送整体解决方案','邮件发送了完整的数字化转型解决方案，包含详细的实施计划','positive','2024-10-19 09:00:00',NULL,NULL,'2025-10-24 07:20:00',0),(5,4,4,5,'call','了解生产管理需求','电话沟通了客户的生产管理现状和改进需求','neutral','2024-10-21 15:00:00',NULL,NULL,'2025-10-24 07:20:00',0);
/*!40000 ALTER TABLE `follow_up_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge`
--

DROP TABLE IF EXISTS `knowledge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knowledge` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint DEFAULT NULL COMMENT '分类ID',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` longtext COMMENT '内容',
  `tags` varchar(200) DEFAULT NULL COMMENT '标签',
  `view_count` int DEFAULT '0',
  `like_count` int DEFAULT '0',
  `status` tinyint DEFAULT '0' COMMENT '0草稿 1发布',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_kb_category` (`category_id`),
  KEY `idx_kb_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='知识库文章表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge`
--

LOCK TABLES `knowledge` WRITE;
/*!40000 ALTER TABLE `knowledge` DISABLE KEYS */;
/*!40000 ALTER TABLE `knowledge` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_base`
--

DROP TABLE IF EXISTS `knowledge_base`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knowledge_base` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_general_ci NOT NULL COMMENT '标题',
  `content` longtext COLLATE utf8mb4_general_ci COMMENT '内容（富文本）',
  `summary` text COLLATE utf8mb4_general_ci COMMENT '摘要',
  `category_id` bigint DEFAULT NULL COMMENT '分类ID',
  `tags` json DEFAULT NULL COMMENT '标签',
  `file_urls` json DEFAULT NULL COMMENT '附件文件URLs',
  `cover_image` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '封面图片',
  `view_count` int DEFAULT '0' COMMENT '查看次数',
  `like_count` int DEFAULT '0' COMMENT '点赞数',
  `is_public` tinyint DEFAULT '1' COMMENT '是否公开：1-公开，0-私有',
  `is_featured` tinyint DEFAULT '0' COMMENT '是否推荐',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_public` (`is_public`),
  KEY `idx_featured` (`is_featured`),
  KEY `idx_created_by` (`created_by`),
  FULLTEXT KEY `ft_content` (`title`,`content`,`summary`),
  CONSTRAINT `knowledge_base_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `knowledge_base_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users_backup_20251220` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='知识库内容表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_base`
--

LOCK TABLES `knowledge_base` WRITE;
/*!40000 ALTER TABLE `knowledge_base` DISABLE KEYS */;
INSERT INTO `knowledge_base` VALUES (1,'ERP系统产品手册','<h1>企业ERP系统完整介绍</h1><p>我们的ERP系统是一款专为中大型企业设计的综合管理系统...</p>','详细介绍ERP系统的功能特性和技术优势',5,'[\"ERP\", \"企业管理\", \"系统集成\"]',NULL,NULL,156,0,1,0,1,NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(2,'客户异议处理技巧','<h1>常见客户异议及应对策略</h1><p>在销售过程中，客户经常会提出各种异议...</p>','总结客户常见异议类型和有效的应对方法',2,'[\"销售技巧\", \"客户沟通\", \"异议处理\"]',NULL,NULL,89,0,1,0,2,NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(3,'CRM系统技术规格书','<h1>CRM系统技术参数</h1><p>系统采用微服务架构，支持高并发...</p>','CRM系统的详细技术参数和部署要求',6,'[\"CRM\", \"技术规格\", \"系统架构\"]',NULL,NULL,67,0,1,0,1,NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(4,'数据分析平台使用指南','<h1>数据分析平台操作指南</h1><p>本指南将帮助用户快速掌握数据分析平台的使用方法...</p>','数据分析平台的详细使用教程和最佳实践',7,'[\"数据分析\", \"使用指南\", \"操作手册\"]',NULL,NULL,134,0,1,0,1,NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0);
/*!40000 ALTER TABLE `knowledge_base` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_categories`
--

DROP TABLE IF EXISTS `knowledge_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knowledge_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `parent_id` bigint DEFAULT '0' COMMENT '父分类ID',
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '分类名称',
  `description` text COLLATE utf8mb4_general_ci COMMENT '分类描述',
  `icon` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '分类图标',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` tinyint DEFAULT '1' COMMENT '状态：1-正常，0-禁用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='知识库分类表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_categories`
--

LOCK TABLES `knowledge_categories` WRITE;
/*!40000 ALTER TABLE `knowledge_categories` DISABLE KEYS */;
INSERT INTO `knowledge_categories` VALUES (1,0,'产品资料','产品相关的文档和资料','📚',1,1,'2025-10-24 07:20:00','2025-10-24 07:20:00'),(2,0,'销售技巧','销售方法和技巧分享','💼',2,1,'2025-10-24 07:20:00','2025-10-24 07:20:00'),(3,0,'常见问题','客户常见问题解答','❓',3,1,'2025-10-24 07:20:00','2025-10-24 07:20:00'),(4,0,'政策法规','相关政策法规文件','📋',4,1,'2025-10-24 07:20:00','2025-10-24 07:20:00'),(5,1,'ERP产品','ERP系统相关资料','🏢',5,1,'2025-10-24 07:20:00','2025-10-24 07:20:00'),(6,1,'CRM产品','CRM系统相关资料','👥',6,1,'2025-10-24 07:20:00','2025-10-24 07:20:00'),(7,1,'数据分析产品','数据分析工具资料','📊',7,1,'2025-10-24 07:20:00','2025-10-24 07:20:00');
/*!40000 ALTER TABLE `knowledge_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint DEFAULT NULL COMMENT '客户ID',
  `title` varchar(200) COLLATE utf8mb4_general_ci NOT NULL COMMENT '线索标题',
  `description` text COLLATE utf8mb4_general_ci COMMENT '线索描述',
  `source` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '线索来源',
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_general_ci DEFAULT 'medium' COMMENT '优先级',
  `status` enum('new','contacted','qualified','proposal','negotiation','won','lost') COLLATE utf8mb4_general_ci DEFAULT 'new' COMMENT '线索状态',
  `stage` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '销售阶段',
  `estimated_value` decimal(12,2) DEFAULT NULL COMMENT '预估价值',
  `success_probability` int DEFAULT '0' COMMENT 'AI预测成交概率',
  `interested_products` json DEFAULT NULL COMMENT '感兴趣的产品',
  `budget_range` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '预算范围',
  `decision_timeline` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '决策时间线',
  `competitor_info` text COLLATE utf8mb4_general_ci COMMENT '竞争对手信息',
  `assigned_to` bigint DEFAULT NULL COMMENT '分配给',
  `created_by` bigint DEFAULT NULL COMMENT '创建人',
  `follow_up_date` date DEFAULT NULL COMMENT '下次跟进日期',
  `closed_at` timestamp NULL DEFAULT NULL COMMENT '关闭时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_assigned` (`assigned_to`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_follow_up` (`follow_up_date`),
  CONSTRAINT `leads_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leads_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users_backup_20251220` (`id`) ON DELETE SET NULL,
  CONSTRAINT `leads_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users_backup_20251220` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='线索表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
INSERT INTO `leads` VALUES (1,1,'上海科技公司ERP系统采购','李先生咨询企业级ERP系统，预算充足，决策周期短','官网咨询','high','qualified',NULL,800000.00,85,'[\"企业ERP\", \"数据分析模块\"]','80-100万',NULL,NULL,3,3,'2024-10-20',NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(2,2,'广州贸易公司库存管理系统','王女士需要库存管理解决方案，正在对比多家供应商','朋友推荐','medium','proposal',NULL,150000.00,60,'[\"库存管理系统\"]','10-20万',NULL,NULL,4,3,'2024-10-22',NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(3,3,'北京集团数字化转型项目','张总负责集团数字化转型，预算很大，需要整体解决方案','展会','urgent','negotiation',NULL,2000000.00,90,'[\"企业ERP\", \"CRM系统\", \"数据分析\"]','200-300万',NULL,NULL,3,4,'2024-10-19',NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(4,4,'深圳制造企业生产管理系统','刘经理关注生产效率提升，需要定制化解决方案','电话咨询','high','contacted',NULL,300000.00,70,'[\"生产管理系统\"]','20-40万',NULL,NULL,5,4,'2024-10-21',NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(5,5,'设计工作室项目管理工具','陈小姐需要轻量级的项目管理工具，预算有限','网络广告','low','new',NULL,50000.00,30,'[\"项目管理工具\"]','3-8万',NULL,NULL,4,5,'2024-10-25',NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0);
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marketing_tasks`
--

DROP TABLE IF EXISTS `marketing_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marketing_tasks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '任务名称',
  `type` varchar(20) DEFAULT NULL COMMENT '任务类型',
  `content` text COMMENT '内容',
  `cron_expression` varchar(50) DEFAULT NULL COMMENT 'Cron表达式',
  `status` tinyint DEFAULT '0' COMMENT '状态',
  `total_sent` int DEFAULT '0' COMMENT '发送总数',
  `success_count` int DEFAULT '0' COMMENT '成功数',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='营销任务表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marketing_tasks`
--

LOCK TABLES `marketing_tasks` WRITE;
/*!40000 ALTER TABLE `marketing_tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `marketing_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operate_logs`
--

DROP TABLE IF EXISTS `operate_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operate_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(50) DEFAULT NULL COMMENT '模块标题',
  `business_type` varchar(20) DEFAULT NULL COMMENT '业务类型',
  `method` varchar(100) DEFAULT NULL COMMENT '方法名称',
  `request_method` varchar(10) DEFAULT NULL COMMENT '请求方式',
  `user_id` bigint DEFAULT NULL COMMENT '操作人员ID',
  `user_name` varchar(50) DEFAULT NULL COMMENT '操作人员名称',
  `url` varchar(255) DEFAULT NULL COMMENT '请求URL',
  `ip` varchar(128) DEFAULT NULL COMMENT '主机IP',
  `request_param` text COMMENT '请求参数',
  `json_result` text COMMENT '返回参数',
  `status` int DEFAULT '0' COMMENT '操作状态 0正常 1异常',
  `error_msg` text COMMENT '错误消息',
  `time_used` bigint DEFAULT NULL COMMENT '消耗时间(ms)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='操作日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operate_logs`
--

LOCK TABLES `operate_logs` WRITE;
/*!40000 ALTER TABLE `operate_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `operate_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operation_logs`
--

DROP TABLE IF EXISTS `operation_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operation_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL COMMENT '操作用户ID',
  `module` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '模块名称',
  `action` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '操作动作',
  `entity_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '操作对象类型',
  `entity_id` bigint DEFAULT NULL COMMENT '操作对象ID',
  `old_data` json DEFAULT NULL COMMENT '变更前数据',
  `new_data` json DEFAULT NULL COMMENT '变更后数据',
  `ip_address` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'IP地址',
  `user_agent` text COLLATE utf8mb4_general_ci COMMENT '用户代理',
  `request_id` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '请求ID',
  `execution_time` int DEFAULT NULL COMMENT '执行时间（毫秒）',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_module` (`module`),
  KEY `idx_action` (`action`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `operation_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users_backup_20251220` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='操作日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operation_logs`
--

LOCK TABLES `operation_logs` WRITE;
/*!40000 ALTER TABLE `operation_logs` DISABLE KEYS */;
INSERT INTO `operation_logs` VALUES (1,3,'customer','create','customer',1,NULL,'{\"name\": \"李先生\", \"phone\": \"13900000001\", \"company\": \"上海科技有限公司\"}','192.168.1.100','Mozilla/5.0 Chrome/91.0',NULL,125,'2025-10-24 07:20:00'),(2,3,'lead','create','lead',1,NULL,'{\"title\": \"上海科技公司ERP系统采购\", \"customer_id\": 1, \"estimated_value\": 800000}','192.168.1.100','Mozilla/5.0 Chrome/91.0',NULL,89,'2025-10-24 07:20:00'),(3,4,'follow_up','create','follow_up_record',3,NULL,'{\"type\": \"wechat\", \"title\": \"微信发送产品资料\", \"lead_id\": 2}','192.168.1.101','Mozilla/5.0 Chrome/91.0',NULL,56,'2025-10-24 07:20:00');
/*!40000 ALTER TABLE `operation_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL COMMENT '订单ID',
  `product_id` bigint NOT NULL COMMENT '产品ID',
  `product_name` varchar(200) DEFAULT NULL COMMENT '产品名称',
  `price` decimal(12,2) NOT NULL COMMENT '购买单价',
  `quantity` int NOT NULL DEFAULT '1' COMMENT '数量',
  `total_amount` decimal(12,2) NOT NULL COMMENT '小计金额',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='订单明细表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_no` varchar(64) NOT NULL COMMENT '订单编号',
  `customer_id` bigint NOT NULL COMMENT '客户ID',
  `user_id` bigint DEFAULT NULL COMMENT '销售人员ID',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '订单总额',
  `pay_amount` decimal(12,2) DEFAULT '0.00' COMMENT '实付金额',
  `payment_method` varchar(20) DEFAULT NULL COMMENT '支付方式',
  `status` tinyint DEFAULT '0' COMMENT '0待支付 1已支付 2已发货 3已完成 4已取消',
  `pay_time` timestamp NULL DEFAULT NULL COMMENT '支付时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `idx_orders_customer` (`customer_id`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_orderno` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='订单表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission_logs`
--

DROP TABLE IF EXISTS `permission_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL COMMENT '用户ID',
  `permission_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '权限名称',
  `resource` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '资源',
  `action` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '操作',
  `result` enum('success','denied','error') COLLATE utf8mb4_general_ci DEFAULT 'success' COMMENT '结果',
  `error_message` text COLLATE utf8mb4_general_ci COMMENT '错误信息',
  `ip_address` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'IP地址',
  `user_agent` text COLLATE utf8mb4_general_ci COMMENT '用户代理',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_permission` (`permission_name`),
  KEY `idx_resource` (`resource`),
  KEY `idx_result` (`result`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `permission_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users_backup_20251220` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='权限访问日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission_logs`
--

LOCK TABLES `permission_logs` WRITE;
/*!40000 ALTER TABLE `permission_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `permission_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '权限名称',
  `code` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '权限中文名称',
  `description` text COLLATE utf8mb4_general_ci COMMENT '权限描述',
  `resource` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '资源标识(URL路径)',
  `action` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '操作类型(CREATE,READ,UPDATE,DELETE,EXECUTE)',
  `category` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '权限分类',
  `is_system` tinyint DEFAULT '0' COMMENT '是否系统权限：1-是，0-否',
  `sort_order` int DEFAULT '0' COMMENT '排序序号',
  `status` tinyint DEFAULT '1' COMMENT '状态：1-正常，0-禁用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `permission_type` enum('menu','button','api','data') COLLATE utf8mb4_general_ci DEFAULT 'menu' COMMENT '权限类型',
  `parent_id` bigint DEFAULT '0' COMMENT '父权限ID',
  `path` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '菜单路径/API路径',
  `method` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'HTTP方法',
  `icon` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '图标',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_name` (`name`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_system` (`is_system`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='权限表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'system:user:list','system:user:list','查看用户列表','查看系统用户列表','/api/users','READ','user',1,1,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(2,'system:user:add','system:user:add','添加用户','添加新用户','/api/users','CREATE','user',1,2,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(3,'system:user:edit','system:user:edit','编辑用户','编辑用户信息','/api/users/*','UPDATE','user',1,3,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(4,'system:user:delete','system:user:delete','删除用户','删除用户','/api/users/*','DELETE','user',1,4,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(5,'system:user:export','system:user:export','导出用户','导出用户数据','/api/users/export','READ','user',1,5,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(6,'system:role:list','system:role:list','查看角色列表','查看系统角色','/api/roles','READ','role',1,6,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(7,'system:role:add','system:role:add','添加角色','添加新角色','/api/roles','CREATE','role',1,7,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(8,'system:role:edit','system:role:edit','编辑角色','编辑角色信息','/api/roles/*','UPDATE','role',1,8,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(9,'system:role:delete','system:role:delete','删除角色','删除角色','/api/roles/*','DELETE','role',1,9,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(10,'system:role:permission','system:role:permission','配置角色权限','为角色分配权限','/api/roles/*/permissions','UPDATE','role',1,10,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(11,'system:permission:list','system:permission:list','查看权限列表','查看系统权限','/api/permissions','READ','permission',1,11,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(12,'system:permission:add','system:permission:add','添加权限','添加新权限','/api/permissions','CREATE','permission',1,12,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(13,'system:permission:edit','system:permission:edit','编辑权限','编辑权限信息','/api/permissions/*','UPDATE','permission',1,13,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(14,'system:permission:delete','system:permission:delete','删除权限','删除权限','/api/permissions/*','DELETE','permission',1,14,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(15,'system:department:list','system:department:list','查看部门','查看部门列表','/api/departments','READ','department',1,15,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(16,'system:department:add','system:department:add','添加部门','添加新部门','/api/departments','CREATE','department',1,16,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(17,'system:department:edit','system:department:edit','编辑部门','编辑部门信息','/api/departments/*','UPDATE','department',1,17,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(18,'system:department:delete','system:department:delete','删除部门','删除部门','/api/departments/*','DELETE','department',1,18,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(19,'customer:list','customer:list','查看客户','查看客户列表','/api/customers','READ','customer',0,19,1,'2025-10-24 07:20:00','2025-12-20 11:57:55','menu',0,'/customers/list',NULL,NULL),(20,'customer:add','customer:add','添加客户','添加新客户','/api/customers','CREATE','customer',0,20,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(21,'customer:edit','customer:edit','编辑客户','编辑客户信息','/api/customers/*','UPDATE','customer',0,21,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(22,'customer:delete','customer:delete','删除客户','删除客户','/api/customers/*','DELETE','customer',0,22,1,'2025-10-24 07:20:00','2025-12-20 11:57:55','button',0,'/api/customers/:id',NULL,NULL),(23,'customer:assign','customer:assign','分配客户','将客户分配给销售人员','/api/customers/*/assign','UPDATE','customer',0,23,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(24,'customer:view360','customer:view360','360视图','查看客户360度视图','/api/customers/*/profile','READ','customer',0,24,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(25,'lead:list','lead:list','查看线索','查看销售线索列表','/api/leads','READ','lead',0,25,1,'2025-10-24 07:20:00','2025-12-20 11:57:55','menu',0,'/leads/list',NULL,NULL),(26,'lead:add','lead:add','添加线索','添加新线索','/api/leads','CREATE','lead',0,26,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(27,'lead:edit','lead:edit','编辑线索','编辑线索信息','/api/leads/*','UPDATE','lead',0,27,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(28,'lead:delete','lead:delete','删除线索','删除线索','/api/leads/*','DELETE','lead',0,28,1,'2025-10-24 07:20:00','2025-12-20 11:57:55','button',0,'/api/leads/:id',NULL,NULL),(29,'lead:assign','lead:assign','分配线索','将线索分配给销售人员','/api/leads/*/assign','UPDATE','lead',0,29,1,'2025-10-24 07:20:00','2025-12-20 11:57:55','button',0,'/api/leads/:id/assign',NULL,NULL),(30,'lead:convert','lead:convert','转化客户','将线索转化为客户','/api/leads/*/convert','UPDATE','lead',0,30,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(31,'product:list','product:list','查看产品','查看产品列表','/api/products','READ','product',0,31,1,'2025-10-24 07:20:00','2025-12-20 11:57:55','menu',0,'/products/list',NULL,NULL),(32,'product:add','product:add','添加产品','添加新产品','/api/products','CREATE','product',0,32,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(33,'product:edit','product:edit','编辑产品','编辑产品信息','/api/products/*','UPDATE','product',0,33,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(34,'product:delete','product:delete','删除产品','删除产品','/api/products/*','DELETE','product',0,34,1,'2025-10-24 07:20:00','2025-12-20 11:57:55','button',0,'/api/products/:id',NULL,NULL),(35,'analytics:view','analytics:view','查看分析','查看数据分析页面','/api/analytics/*','READ','analytics',0,35,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(36,'analytics:export','analytics:export','导出报表','导出分析报表','/api/analytics/report/*','READ','analytics',0,36,1,'2025-10-24 07:20:00','2025-12-20 11:57:50','menu',0,NULL,NULL,NULL),(37,'仪表盘','dashboard','Dashboard',NULL,'dashboard','view','system',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/dashboard',NULL,NULL),(38,'数据概览','dashboard:overview','Overview',NULL,'dashboard','view','dashboard',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/dashboard/overview',NULL,NULL),(39,'客户管理','customer','Customer Management',NULL,'customer','view','business',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/customers',NULL,NULL),(40,'客户详情','customer:detail','Customer Detail',NULL,'customer','view','customer',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/customers/:id',NULL,NULL),(41,'新增客户','customer:create','Create Customer',NULL,'customer','create','customer',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','button',0,'/api/customers',NULL,NULL),(42,'编辑客户','customer:update','Update Customer',NULL,'customer','update','customer',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','button',0,'/api/customers/:id',NULL,NULL),(43,'导出客户','customer:export','Export Customer',NULL,'customer','export','customer',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','button',0,'/api/customers/export',NULL,NULL),(44,'线索管理','lead','Lead Management',NULL,'lead','view','business',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/leads',NULL,NULL),(45,'新增线索','lead:create','Create Lead',NULL,'lead','create','lead',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','button',0,'/api/leads',NULL,NULL),(46,'编辑线索','lead:update','Update Lead',NULL,'lead','update','lead',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','button',0,'/api/leads/:id',NULL,NULL),(47,'订单管理','order','Order Management',NULL,'order','view','business',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/orders',NULL,NULL),(48,'订单列表','order:list','Order List',NULL,'order','view','order',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/orders/list',NULL,NULL),(49,'订单详情','order:detail','Order Detail',NULL,'order','view','order',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/orders/:id',NULL,NULL),(50,'创建订单','order:create','Create Order',NULL,'order','create','order',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','button',0,'/api/orders',NULL,NULL),(51,'取消订单','order:cancel','Cancel Order',NULL,'order','cancel','order',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','button',0,'/api/orders/:id/cancel',NULL,NULL),(52,'产品管理','product','Product Management',NULL,'product','view','business',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/products',NULL,NULL),(53,'新增产品','product:create','Create Product',NULL,'product','create','product',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','button',0,'/api/products',NULL,NULL),(54,'编辑产品','product:update','Update Product',NULL,'product','update','product',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','button',0,'/api/products/:id',NULL,NULL),(55,'系统管理','system','System Management',NULL,'system','view','system',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/system',NULL,NULL),(56,'用户管理','system:user','User Management',NULL,'user','view','system',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/system/users',NULL,NULL),(57,'角色管理','system:role','Role Management',NULL,'role','view','system',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/system/roles',NULL,NULL),(58,'权限管理','system:permission','Permission Management',NULL,'permission','view','system',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/system/permissions',NULL,NULL),(59,'部门管理','system:department','Department Management',NULL,'department','view','system',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/system/departments',NULL,NULL),(60,'操作日志','system:log','Operation Log',NULL,'log','view','system',0,0,1,'2025-12-20 11:57:55','2025-12-20 11:57:55','menu',0,'/system/logs',NULL,NULL);
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `parent_id` bigint DEFAULT '0' COMMENT '父分类ID',
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '分类名称',
  `description` text COLLATE utf8mb4_general_ci COMMENT '分类描述',
  `image_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '分类图片',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` tinyint DEFAULT '1' COMMENT '状态：1-正常，0-禁用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品分类表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,0,'企业软件','面向企业的软件产品',NULL,1,1,'2025-10-24 07:20:00','2025-10-24 07:20:00'),(2,1,'管理系统','各类企业管理系统',NULL,2,1,'2025-10-24 07:20:00','2025-10-24 07:20:00'),(3,1,'分析工具','数据分析和报表工具',NULL,3,1,'2025-10-24 07:20:00','2025-10-24 07:20:00'),(4,2,'ERP系统','企业资源计划系统',NULL,4,1,'2025-10-24 07:20:00','2025-10-24 07:20:00'),(5,2,'CRM系统','客户关系管理系统',NULL,5,1,'2025-10-24 07:20:00','2025-10-24 07:20:00'),(6,2,'项目管理','项目管理工具',NULL,6,1,'2025-10-24 07:20:00','2025-10-24 07:20:00');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL COMMENT '产品名称',
  `sku` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '产品SKU',
  `category_id` bigint DEFAULT NULL COMMENT '分类ID',
  `brand` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '品牌',
  `model` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '型号',
  `price` decimal(12,2) DEFAULT NULL COMMENT '价格',
  `market_price` decimal(12,2) DEFAULT NULL COMMENT '市场价',
  `cost_price` decimal(12,2) DEFAULT NULL COMMENT '成本价',
  `specifications` json DEFAULT NULL COMMENT '产品规格参数',
  `features` json DEFAULT NULL COMMENT '产品特性',
  `images` json DEFAULT NULL COMMENT '产品图片URLs',
  `description` text COLLATE utf8mb4_general_ci COMMENT '产品描述',
  `stock_quantity` int DEFAULT '0' COMMENT '库存数量',
  `min_stock` int DEFAULT '0' COMMENT '最低库存警戒线',
  `sales_count` int DEFAULT '0' COMMENT '销售数量',
  `status` enum('active','inactive','discontinued') COLLATE utf8mb4_general_ci DEFAULT 'active' COMMENT '产品状态',
  `is_featured` tinyint DEFAULT '0' COMMENT '是否推荐',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_sku` (`sku`),
  KEY `idx_category` (`category_id`),
  KEY `idx_brand` (`brand`),
  KEY `idx_status` (`status`),
  KEY `idx_featured` (`is_featured`),
  FULLTEXT KEY `ft_search` (`name`,`brand`,`model`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'智慧ERP企业版','ERP-ENT-2024',4,'ShopPro','ERP-V3.0',800000.00,1000000.00,400000.00,'{\"users\": \"500\", \"modules\": \"15\", \"storage\": \"1TB\", \"support\": \"7x24\"}','[\"多模块集成\", \"云端部署\", \"移动端支持\", \"实时数据同步\"]',NULL,'专为大中型企业设计的全功能ERP系统，支持财务、人事、采购、销售等全业务流程管理',10,0,5,'active',1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(2,'智能CRM专业版','CRM-PRO-2024',5,'ShopPro','CRM-V2.5',300000.00,400000.00,150000.00,'{\"api\": \"unlimited\", \"users\": \"200\", \"storage\": \"500GB\", \"contacts\": \"50000\"}','[\"AI客户分析\", \"销售预测\", \"自动化营销\", \"移动应用\"]',NULL,'基于AI技术的智能客户关系管理系统，帮助企业提升销售效率和客户满意度',20,0,12,'active',1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(3,'数据分析平台','DA-PLATFORM-2024',3,'ShopPro','DA-V1.8',200000.00,280000.00,100000.00,'{\"users\": \"100\", \"reports\": \"unlimited\", \"storage\": \"2TB\", \"realtime\": \"yes\"}','[\"实时数据处理\", \"可视化报表\", \"机器学习\", \"预测分析\"]',NULL,'强大的企业数据分析平台，支持多数据源接入和智能分析',15,0,8,'active',1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(4,'轻量级项目管理工具','PM-LITE-2024',6,'ShopPro','PM-V1.0',50000.00,80000.00,25000.00,'{\"users\": \"50\", \"mobile\": \"yes\", \"storage\": \"100GB\", \"projects\": \"100\"}','[\"任务管理\", \"团队协作\", \"进度跟踪\", \"文件共享\"]',NULL,'适合中小企业和团队的轻量级项目管理解决方案',50,0,25,'active',0,'2025-10-24 07:20:00','2025-10-24 07:20:00',0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_inheritance`
--

DROP TABLE IF EXISTS `role_inheritance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_inheritance` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `parent_role_id` bigint NOT NULL COMMENT '父角色ID',
  `child_role_id` bigint NOT NULL COMMENT '子角色ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_inherit` (`parent_role_id`,`child_role_id`),
  KEY `child_role_id` (`child_role_id`),
  CONSTRAINT `role_inheritance_ibfk_1` FOREIGN KEY (`parent_role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_inheritance_ibfk_2` FOREIGN KEY (`child_role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色继承表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_inheritance`
--

LOCK TABLES `role_inheritance` WRITE;
/*!40000 ALTER TABLE `role_inheritance` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_inheritance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `permission_id` bigint NOT NULL COMMENT '权限ID',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  `assigned_by` bigint DEFAULT NULL COMMENT '分配人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role_id`,`permission_id`),
  KEY `idx_role` (`role_id`),
  KEY `idx_permission` (`permission_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users_backup_20251220` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=206 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='角色权限关系表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1,1,'2025-10-24 07:20:00',NULL),(2,1,2,'2025-10-24 07:20:00',NULL),(3,1,3,'2025-10-24 07:20:00',NULL),(4,1,4,'2025-10-24 07:20:00',NULL),(5,1,5,'2025-10-24 07:20:00',NULL),(6,1,6,'2025-10-24 07:20:00',NULL),(7,1,7,'2025-10-24 07:20:00',NULL),(8,1,8,'2025-10-24 07:20:00',NULL),(9,1,9,'2025-10-24 07:20:00',NULL),(10,1,10,'2025-10-24 07:20:00',NULL),(11,1,11,'2025-10-24 07:20:00',NULL),(12,1,12,'2025-10-24 07:20:00',NULL),(13,1,13,'2025-10-24 07:20:00',NULL),(14,1,14,'2025-10-24 07:20:00',NULL),(15,1,15,'2025-10-24 07:20:00',NULL),(16,1,16,'2025-10-24 07:20:00',NULL),(17,1,17,'2025-10-24 07:20:00',NULL),(18,1,18,'2025-10-24 07:20:00',NULL),(19,1,19,'2025-10-24 07:20:00',NULL),(20,1,20,'2025-10-24 07:20:00',NULL),(21,1,21,'2025-10-24 07:20:00',NULL),(22,1,22,'2025-10-24 07:20:00',NULL),(23,1,23,'2025-10-24 07:20:00',NULL),(24,1,24,'2025-10-24 07:20:00',NULL),(25,1,25,'2025-10-24 07:20:00',NULL),(26,1,26,'2025-10-24 07:20:00',NULL),(27,1,27,'2025-10-24 07:20:00',NULL),(28,1,28,'2025-10-24 07:20:00',NULL),(29,1,29,'2025-10-24 07:20:00',NULL),(30,1,30,'2025-10-24 07:20:00',NULL),(31,1,31,'2025-10-24 07:20:00',NULL),(32,1,32,'2025-10-24 07:20:00',NULL),(33,1,33,'2025-10-24 07:20:00',NULL),(34,1,34,'2025-10-24 07:20:00',NULL),(35,1,35,'2025-10-24 07:20:00',NULL),(36,1,36,'2025-10-24 07:20:00',NULL),(64,2,1,'2025-10-24 07:20:00',NULL),(65,2,15,'2025-10-24 07:20:00',NULL),(66,2,19,'2025-10-24 07:20:00',NULL),(67,2,20,'2025-10-24 07:20:00',NULL),(68,2,21,'2025-10-24 07:20:00',NULL),(69,2,22,'2025-10-24 07:20:00',NULL),(70,2,23,'2025-10-24 07:20:00',NULL),(71,2,24,'2025-10-24 07:20:00',NULL),(72,2,25,'2025-10-24 07:20:00',NULL),(73,2,26,'2025-10-24 07:20:00',NULL),(74,2,27,'2025-10-24 07:20:00',NULL),(75,2,28,'2025-10-24 07:20:00',NULL),(76,2,29,'2025-10-24 07:20:00',NULL),(77,2,30,'2025-10-24 07:20:00',NULL),(78,2,31,'2025-10-24 07:20:00',NULL),(79,2,32,'2025-10-24 07:20:00',NULL),(80,2,33,'2025-10-24 07:20:00',NULL),(81,2,34,'2025-10-24 07:20:00',NULL),(82,2,35,'2025-10-24 07:20:00',NULL),(83,2,36,'2025-10-24 07:20:00',NULL),(95,3,35,'2025-10-24 07:20:00',NULL),(96,3,20,'2025-10-24 07:20:00',NULL),(97,3,21,'2025-10-24 07:20:00',NULL),(98,3,19,'2025-10-24 07:20:00',NULL),(99,3,24,'2025-10-24 07:20:00',NULL),(100,3,26,'2025-10-24 07:20:00',NULL),(101,3,29,'2025-10-24 07:20:00',NULL),(102,3,30,'2025-10-24 07:20:00',NULL),(103,3,27,'2025-10-24 07:20:00',NULL),(104,3,25,'2025-10-24 07:20:00',NULL),(105,3,31,'2025-10-24 07:20:00',NULL),(110,4,35,'2025-10-24 07:20:00',NULL),(111,4,19,'2025-10-24 07:20:00',NULL),(112,4,25,'2025-10-24 07:20:00',NULL),(113,4,31,'2025-10-24 07:20:00',NULL),(117,5,19,'2025-10-24 07:20:00',NULL),(118,5,31,'2025-10-24 07:20:00',NULL),(119,6,1,'2025-12-20 07:45:45',1),(120,6,2,'2025-12-20 07:45:45',1),(121,6,3,'2025-12-20 07:45:45',1),(122,6,4,'2025-12-20 07:45:45',1),(123,6,5,'2025-12-20 07:45:45',1),(124,6,6,'2025-12-20 07:45:45',1),(125,6,7,'2025-12-20 07:45:45',1),(126,6,8,'2025-12-20 07:45:45',1),(127,6,9,'2025-12-20 07:45:45',1),(128,6,10,'2025-12-20 07:45:45',1),(129,6,11,'2025-12-20 07:45:45',1),(130,6,12,'2025-12-20 07:45:45',1),(131,6,13,'2025-12-20 07:45:45',1),(132,6,14,'2025-12-20 07:45:45',1),(133,6,15,'2025-12-20 07:45:45',1),(134,6,16,'2025-12-20 07:45:45',1),(135,6,17,'2025-12-20 07:45:45',1),(136,6,18,'2025-12-20 07:45:45',1),(137,6,19,'2025-12-20 07:45:45',1),(138,6,20,'2025-12-20 07:45:45',1),(139,6,21,'2025-12-20 07:45:45',1),(140,6,22,'2025-12-20 07:45:45',1),(141,6,23,'2025-12-20 07:45:45',1),(142,6,24,'2025-12-20 07:45:45',1),(143,6,25,'2025-12-20 07:45:45',1),(144,6,26,'2025-12-20 07:45:45',1),(145,6,27,'2025-12-20 07:45:45',1),(146,6,28,'2025-12-20 07:45:45',1),(147,6,29,'2025-12-20 07:45:45',1),(148,6,30,'2025-12-20 07:45:45',1),(149,6,31,'2025-12-20 07:45:45',1),(150,6,32,'2025-12-20 07:45:45',1),(151,6,33,'2025-12-20 07:45:45',1),(152,6,34,'2025-12-20 07:45:45',1),(153,6,35,'2025-12-20 07:45:45',1),(154,6,36,'2025-12-20 07:45:45',1),(182,6,37,'2025-12-20 11:57:55',NULL),(183,6,38,'2025-12-20 11:57:55',NULL),(184,6,39,'2025-12-20 11:57:55',NULL),(185,6,40,'2025-12-20 11:57:55',NULL),(186,6,41,'2025-12-20 11:57:55',NULL),(187,6,42,'2025-12-20 11:57:55',NULL),(188,6,43,'2025-12-20 11:57:55',NULL),(189,6,44,'2025-12-20 11:57:55',NULL),(190,6,45,'2025-12-20 11:57:55',NULL),(191,6,46,'2025-12-20 11:57:55',NULL),(192,6,47,'2025-12-20 11:57:55',NULL),(193,6,48,'2025-12-20 11:57:55',NULL),(194,6,49,'2025-12-20 11:57:55',NULL),(195,6,50,'2025-12-20 11:57:55',NULL),(196,6,51,'2025-12-20 11:57:55',NULL),(197,6,52,'2025-12-20 11:57:55',NULL),(198,6,53,'2025-12-20 11:57:55',NULL),(199,6,54,'2025-12-20 11:57:55',NULL),(200,6,55,'2025-12-20 11:57:55',NULL),(201,6,56,'2025-12-20 11:57:55',NULL),(202,6,57,'2025-12-20 11:57:55',NULL),(203,6,58,'2025-12-20 11:57:55',NULL),(204,6,59,'2025-12-20 11:57:55',NULL),(205,6,60,'2025-12-20 11:57:55',NULL);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '角色名称',
  `code` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '角色编码',
  `level` int DEFAULT '1' COMMENT '职级',
  `display_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '角色中文名称',
  `description` text COLLATE utf8mb4_general_ci COMMENT '角色描述',
  `parent_id` bigint DEFAULT '0' COMMENT '父角色ID',
  `sort_order` int DEFAULT '0' COMMENT '排序序号',
  `status` tinyint DEFAULT '1' COMMENT '状态：1-正常，0-禁用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `role_type` enum('system','platform','enterprise','custom') COLLATE utf8mb4_general_ci DEFAULT 'custom',
  `data_scope` enum('all','department','department_and_sub','self','custom') COLLATE utf8mb4_general_ci DEFAULT 'self' COMMENT '数据权限范围',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_name` (`name`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='角色表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin',NULL,1,'管理员','系统管理员，拥有所有权限',0,1,1,'2025-10-24 07:20:00','2025-10-24 07:20:00','custom','self'),(2,'manager',NULL,1,'经理','部门经理，管理团队成员',0,2,1,'2025-10-24 07:20:00','2025-10-24 07:20:00','custom','self'),(3,'sales',NULL,1,'销售','销售人员，客户管理和销售操作',0,3,1,'2025-10-24 07:20:00','2025-10-24 07:20:00','custom','self'),(4,'user',NULL,1,'普通用户','普通系统用户',0,4,1,'2025-10-24 07:20:00','2025-10-24 07:20:00','custom','self'),(5,'guest',NULL,1,'访客','访客角色，仅查看权限',0,5,1,'2025-10-24 07:20:00','2025-10-24 07:20:00','custom','self'),(6,'超级管理员','super_admin',100,'Super Admin','系统超级管理员，拥有所有权限',0,0,1,'2025-12-20 07:45:45','2025-12-20 13:07:24','system','all'),(7,'系统管理员','admin',1,'Administrator','系统管理员',0,0,1,'2025-12-20 11:54:51','2025-12-20 11:54:51','system','all'),(8,'部门经理','manager',1,'Manager','部门经理',0,0,1,'2025-12-20 11:54:51','2025-12-20 11:54:51','system','department_and_sub'),(9,'销售人员','sales',1,'Sales','销售人员',0,0,1,'2025-12-20 11:54:51','2025-12-20 11:54:51','system','self'),(10,'客服人员','customer_service',1,'Customer Service','客服人员',0,0,1,'2025-12-20 11:54:51','2025-12-20 11:54:51','system','department'),(19,'平台管理员','platform_admin',90,'Platform Admin','平台管理员，负责平台运营管理',0,2,1,'2025-12-20 13:04:28','2025-12-20 13:07:24','platform','all'),(20,'企业管理员','enterprise_admin',80,'Enterprise Admin','企业管理员，负责企业内部管理',0,3,1,'2025-12-20 13:04:28','2025-12-20 13:07:24','enterprise','department');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_performance`
--

DROP TABLE IF EXISTS `sales_performance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_performance` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '员工ID',
  `department_id` bigint DEFAULT NULL COMMENT '部门ID',
  `period_type` varchar(20) NOT NULL COMMENT '周期类型: WEEKLY, MONTHLY',
  `period_date` date NOT NULL COMMENT '周期标识日期 (例如每月1号)',
  `sales_amount` decimal(12,2) DEFAULT '0.00' COMMENT '销售金额',
  `order_count` int DEFAULT '0' COMMENT '订单数量',
  `leads_count` int DEFAULT '0' COMMENT '线索数量',
  `conversion_rate` decimal(5,2) DEFAULT '0.00' COMMENT '转化率(%)',
  `score` int DEFAULT '0' COMMENT '绩效评分',
  `ranking` int DEFAULT '0' COMMENT '排名',
  `summary` text COMMENT '业绩总结',
  `manager_comment` text COMMENT '主管点评',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_perf_user` (`user_id`),
  KEY `idx_perf_dept` (`department_id`),
  KEY `idx_perf_period` (`period_type`,`period_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='销售业绩记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_performance`
--

LOCK TABLES `sales_performance` WRITE;
/*!40000 ALTER TABLE `sales_performance` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales_performance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_scripts`
--

DROP TABLE IF EXISTS `sales_scripts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_scripts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '话术标题',
  `category` varchar(50) DEFAULT NULL COMMENT '分类',
  `content` text COMMENT '话术内容',
  `tags` varchar(200) DEFAULT NULL COMMENT '标签',
  `usage_count` int DEFAULT '0' COMMENT '使用次数',
  `success_rate` decimal(5,2) DEFAULT '0.00' COMMENT '成功率',
  `last_used_at` timestamp NULL DEFAULT NULL COMMENT '最后使用时间',
  `is_recommended` tinyint DEFAULT '0' COMMENT '是否推荐',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_script_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='销售话术表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_scripts`
--

LOCK TABLES `sales_scripts` WRITE;
/*!40000 ALTER TABLE `sales_scripts` DISABLE KEYS */;
INSERT INTO `sales_scripts` VALUES (1,'温暖问候式开场','greeting','您好！我是特斯拉的销售顾问小李。看到您对我们的车型很感兴趣，我想了解一下您目前的用车需求，这样我能为您推荐最合适的方案。请问您平时主要用车场景是什么呢？','开场白,高转化',156,78.00,'2025-12-19 03:53:35',1,'2025-12-20 03:53:35','2025-12-20 03:53:35'),(2,'Model Y 核心卖点介绍','introduction','Model Y是一款完美平衡性能与实用性的SUV。它拥有540公里的超长续航，0-100km/h加速仅需5.1秒，同时还有超大的储物空间。最重要的是，它的自动驾驶功能能让您的每次出行都更安全、更轻松。','产品介绍,AI推荐',89,85.00,'2025-12-19 03:53:35',1,'2025-12-20 03:53:35','2025-12-20 03:53:35'),(3,'价格异议处理','objection','我理解您对价格的考虑。让我们算一笔账：传统燃油车每年油费约2万元，保养费8000元，而电动车几乎零保养，电费仅需3000元。5年下来，您实际上能节省超过10万元。这样看来，特斯拉其实是更经济的选择。','异议处理,价格敏感',234,72.00,'2025-12-19 03:53:35',0,'2025-12-20 03:53:35','2025-12-20 03:53:35'),(4,'紧迫感成交法','closing','张先生，我看得出您对Model Y很满意。现在正好有个好消息，本月底前下订的客户可以享受免费升级FSD功能，价值6.4万元。这个优惠机会不多，我建议您今天就确定下来，这样既能锁定优惠，也能更早提车。','成交话术,限时优惠',67,91.00,'2025-12-19 03:53:35',0,'2025-12-20 03:53:35','2025-12-20 03:53:35');
/*!40000 ALTER TABLE `sales_scripts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_targets`
--

DROP TABLE IF EXISTS `sales_targets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_targets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `target_type` varchar(20) NOT NULL COMMENT '目标类型: PERSONAL, DEPARTMENT, COMPANY',
  `target_id` bigint NOT NULL COMMENT '目标主体ID (User ID or Dept ID or 0 for Company)',
  `period_type` varchar(20) NOT NULL COMMENT '周期类型: WEEKLY, MONTHLY, QUARTERLY, YEARLY',
  `period_start` date NOT NULL COMMENT '周期开始日期',
  `period_end` date NOT NULL COMMENT '周期结束日期',
  `target_amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '目标金额',
  `currency` varchar(10) DEFAULT 'CNY' COMMENT '货币单位',
  `status` tinyint DEFAULT '1' COMMENT '状态: 1-生效, 0-失效',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_target_type_id` (`target_type`,`target_id`),
  KEY `idx_target_period` (`period_start`,`period_end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='销售目标表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_targets`
--

LOCK TABLES `sales_targets` WRITE;
/*!40000 ALTER TABLE `sales_targets` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales_targets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '套餐名称',
  `code` varchar(50) NOT NULL COMMENT '套餐代码',
  `description` text COMMENT '套餐描述',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '价格',
  `duration_days` int NOT NULL DEFAULT '365' COMMENT '有效天数',
  `features` json DEFAULT NULL COMMENT '功能特性列表',
  `max_users` int DEFAULT '10' COMMENT '最大用户数',
  `max_storage_gb` int DEFAULT '10' COMMENT '最大存储空间(GB)',
  `status` tinyint DEFAULT '1' COMMENT '状态: 1-有效, 0-无效',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='订阅套餐表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES (1,'基础版','basic','适合小型团队的基础功能套餐',0.00,365,'[\"用户管理\", \"客户管理\", \"基础报表\"]',10,5,1,1,'2025-12-20 13:02:50','2025-12-20 13:02:50'),(2,'专业版','professional','适合中型企业的专业功能套餐',9999.00,365,'[\"用户管理\", \"客户管理\", \"高级报表\", \"AI助手\", \"数据分析\"]',50,50,1,2,'2025-12-20 13:02:50','2025-12-20 13:02:50'),(3,'企业版','enterprise','适合大型企业的完整功能套餐',29999.00,365,'[\"用户管理\", \"客户管理\", \"高级报表\", \"AI助手\", \"数据分析\", \"定制开发\", \"专属服务\"]',200,200,1,3,'2025-12-20 13:02:50','2025-12-20 13:02:50');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_configs`
--

DROP TABLE IF EXISTS `system_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_configs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '配置键',
  `config_value` json DEFAULT NULL COMMENT '配置值',
  `description` text COLLATE utf8mb4_general_ci COMMENT '配置说明',
  `is_system` tinyint DEFAULT '0' COMMENT '是否系统配置：1-是，0-否',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_key` (`config_key`),
  KEY `idx_key` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='系统配置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_configs`
--

LOCK TABLES `system_configs` WRITE;
/*!40000 ALTER TABLE `system_configs` DISABLE KEYS */;
INSERT INTO `system_configs` VALUES (1,'system.name','\"ShopPro AI智能SCRM系统\"','系统名称',1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(2,'system.version','\"1.0.0\"','系统版本号',1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(3,'ai.prediction.enabled','true','是否启用AI预测功能',1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(4,'ai.model.version','\"v2.1\"','AI模型版本',1,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(5,'notification.email.enabled','true','是否启用邮件通知',0,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(6,'notification.sms.enabled','true','是否启用短信通知',0,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(7,'file.upload.max_size','10485760','文件上传最大大小(字节)',0,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(8,'session.timeout','7200','会话超时时间(秒)',0,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(9,'sms.enabled','true','SMS Enabled',1,'2025-12-20 15:27:33','2025-12-20 15:27:33',0),(10,'email.enabled','true','Email Enabled',1,'2025-12-20 15:27:33','2025-12-20 15:27:33',0),(11,'SMS_ENABLED','\"true\"','SMS Enabled',1,'2025-12-20 15:29:43','2025-12-20 15:29:43',0),(12,'SMS_CONFIG','{\"endpoint\": \"https://api.sms.com\", \"accessKey\": \"test\", \"secretKey\": \"test\"}','SMS Config',1,'2025-12-20 15:29:43','2025-12-20 15:29:43',0),(13,'EMAIL_ENABLED','\"true\"','Email Enabled',1,'2025-12-20 15:29:43','2025-12-20 15:29:43',0),(14,'EMAIL_CONFIG','{\"endpoint\": \"smtp.email.com\", \"accessKey\": \"test\", \"secretKey\": \"test\"}','Email Config',1,'2025-12-20 15:29:43','2025-12-20 15:29:43',0);
/*!40000 ALTER TABLE `system_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `permission_id` bigint NOT NULL COMMENT '权限ID',
  `permission_type` enum('grant','deny') DEFAULT 'grant' COMMENT '权限类型：授予/拒绝',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  `assigned_by` bigint DEFAULT NULL COMMENT '分配人ID',
  `expires_at` timestamp NULL DEFAULT NULL COMMENT '过期时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_perm` (`user_id`,`permission_id`),
  KEY `idx_up_user` (`user_id`),
  KEY `idx_up_perm` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户权限表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_permissions`
--

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `real_name` varchar(100) DEFAULT NULL COMMENT '真实姓名',
  `avatar_url` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `user_type` enum('admin','employee','customer') DEFAULT 'employee' COMMENT '用户类型',
  `status` tinyint DEFAULT '1' COMMENT '1:正常, 0:禁用',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint DEFAULT '0',
  `enterprise_id` bigint DEFAULT NULL COMMENT '关联企业ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_type` (`user_type`),
  KEY `idx_status` (`status`),
  KEY `idx_username` (`username`),
  KEY `idx_enterprise_id` (`enterprise_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户基础信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (1,'admin','13800000001','admin@shoppro.com','$2a$10$G56./1ySaLjaOM/DSRPm7OvQTfOY42ZGJ/JRt82FpFFI7k52kWWCC','系统管理员',NULL,'admin',1,'2025-12-20 06:28:13','2025-10-24 07:20:00','2025-12-22 05:47:36',0,NULL),(2,'manager001','13800000002','manager1@shoppro.com','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','张经理',NULL,'employee',1,NULL,'2025-10-24 07:20:00','2025-12-20 12:28:40',0,NULL),(3,'sales001','13800000003','sales1@shoppro.com','$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG','李销售',NULL,'employee',1,NULL,'2025-10-24 07:20:00','2025-12-20 12:28:40',0,NULL),(4,'sales002','13800000004','sales2@shoppro.com','$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLZfqFFzI5R6','王销售',NULL,'employee',1,NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0,NULL),(5,'sales003','13800000005','sales3@shoppro.com','$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLZfqFFzI5R6','赵销售',NULL,'employee',1,NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0,NULL),(6,'testuser001','13900139001','test@example.com','$2a$10$kqN/9pkErHlGAH1bLDYAAuXSir0RhItoNwzVq2XXDvVX3TKfLz5HO','测试用户',NULL,'customer',1,NULL,'2025-12-20 12:52:07','2025-12-20 12:52:07',0,NULL),(7,'tester_sales','13988887777','tester_sales@example.com','$2a$10$qOvGgUFpQvbVBLqFf.49SeuIcSchGG3rbxCkZa0XvfiX8zYjsGtrO','测试销售员',NULL,'customer',1,NULL,'2025-12-20 17:10:30','2025-12-20 17:10:30',0,NULL),(8,'zhangsan','13900000010','zhangsan@example.com','$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLZfqFFzI5R6','张三',NULL,'employee',1,NULL,'2025-12-22 05:45:50','2025-12-22 05:47:17',0,NULL),(9,'wangwu','13900000011','wangwu@example.com','$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLZfqFFzI5R6','王五',NULL,'employee',1,NULL,'2025-12-22 05:45:50','2025-12-22 05:47:17',0,NULL),(12,'agent_test_999','999',NULL,'xxx',NULL,NULL,'employee',1,NULL,'2025-12-22 05:50:32','2025-12-22 05:50:32',0,NULL);
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  `assigned_by` bigint DEFAULT NULL COMMENT '分配人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_role` (`role_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users_backup_20251220` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户角色关系表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (2,1,6,'2025-12-20 13:07:24',NULL),(3,2,8,'2025-12-20 14:26:11',NULL),(4,3,9,'2025-12-20 14:26:11',NULL),(5,4,9,'2025-12-20 14:26:11',NULL),(6,5,9,'2025-12-20 14:26:11',NULL),(8,8,9,'2025-12-22 05:46:09',NULL),(9,9,8,'2025-12-22 05:46:09',NULL);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `users`
--

DROP TABLE IF EXISTS `users`;
/*!50001 DROP VIEW IF EXISTS `users`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `users` AS SELECT 
 1 AS `id`,
 1 AS `username`,
 1 AS `phone`,
 1 AS `email`,
 1 AS `password`,
 1 AS `real_name`,
 1 AS `avatar_url`,
 1 AS `role`,
 1 AS `department_id`,
 1 AS `enterprise_id`,
 1 AS `sales_targets`,
 1 AS `status`,
 1 AS `last_login_at`,
 1 AS `created_at`,
 1 AS `updated_at`,
 1 AS `deleted`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `users_backup_20251220`
--

DROP TABLE IF EXISTS `users_backup_20251220`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_backup_20251220` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户名',
  `phone` varchar(20) COLLATE utf8mb4_general_ci NOT NULL COMMENT '手机号',
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '邮箱',
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码（加密）',
  `real_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '真实姓名',
  `avatar_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '头像URL',
  `role` enum('admin','manager','sales','user') COLLATE utf8mb4_general_ci DEFAULT 'user' COMMENT '用户角色',
  `department_id` bigint DEFAULT NULL COMMENT '部门ID',
  `status` tinyint DEFAULT '1' COMMENT '状态：1-正常，0-禁用',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint DEFAULT '0' COMMENT '逻辑删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_phone` (`phone`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `users_backup_20251220_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_backup_20251220`
--

LOCK TABLES `users_backup_20251220` WRITE;
/*!40000 ALTER TABLE `users_backup_20251220` DISABLE KEYS */;
INSERT INTO `users_backup_20251220` VALUES (1,'admin','13800000001','admin@shoppro.com','$2a$12$Hz6IEgaOTdakrbFzN3cmtuX67tN671U0xxSpVvMiQCGhaTwDftA7K','系统管理员',NULL,'admin',1,1,'2025-12-20 06:28:13','2025-10-24 07:20:00','2025-12-20 06:28:13',0),(2,'manager001','13800000002','manager1@shoppro.com','$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLZfqFFzI5R6','张经理',NULL,'manager',2,1,NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(3,'sales001','13800000003','sales1@shoppro.com','$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLZfqFFzI5R6','李销售',NULL,'sales',6,1,NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(4,'sales002','13800000004','sales2@shoppro.com','$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLZfqFFzI5R6','王销售',NULL,'sales',7,1,NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0),(5,'sales003','13800000005','sales3@shoppro.com','$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBaLZfqFFzI5R6','赵销售',NULL,'sales',8,1,NULL,'2025-10-24 07:20:00','2025-10-24 07:20:00',0);
/*!40000 ALTER TABLE `users_backup_20251220` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `shoppro_db`
--

USE `shoppro_db`;

--
-- Final view structure for view `users`
--

/*!50001 DROP VIEW IF EXISTS `users`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `users` AS select `up`.`id` AS `id`,`up`.`username` AS `username`,`up`.`phone` AS `phone`,`up`.`email` AS `email`,`up`.`password` AS `password`,`up`.`real_name` AS `real_name`,`up`.`avatar_url` AS `avatar_url`,(case when (`up`.`user_type` = 'admin') then 'admin' else coalesce((select `r`.`code` from (`user_roles` `ur` join `roles` `r` on((`ur`.`role_id` = `r`.`id`))) where (`ur`.`user_id` = `up`.`id`) order by `r`.`level` desc limit 1),'user') end) AS `role`,`ep`.`department_id` AS `department_id`,`up`.`enterprise_id` AS `enterprise_id`,`ep`.`sales_targets` AS `sales_targets`,`up`.`status` AS `status`,`up`.`last_login_at` AS `last_login_at`,`up`.`created_at` AS `created_at`,`up`.`updated_at` AS `updated_at`,`up`.`deleted` AS `deleted` from (`user_profiles` `up` left join `employee_profiles` `ep` on((`up`.`id` = `ep`.`user_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-22 14:19:54
