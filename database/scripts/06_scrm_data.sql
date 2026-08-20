-- ----------------------------------------------------------------
-- Sample Data for SCRM Module
-- ----------------------------------------------------------------

-- Insert some channel codes
INSERT INTO `channel_codes` (user_id, channel_type, channel_name, code_url, description, scan_count, follow_count) VALUES 
(1, 'wechat', '华东区域微信引流', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=wechat_moments', '朋友圈裂变推广', 150, 45),
(1, 'offline', '上海旗舰店展架', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=offline_store', '门店引流', 80, 20),
(1, 'douyin', '官方带货直播间', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=douyin_live', '直播间获客', 300, 120),
(1, 'xiaohongshu', '小红书种草笔记', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=xhs_notes', '社区引流', 50, 15);

-- Insert welcome messages
INSERT INTO `welcome_messages` (channel_code_id, msg_type, content) VALUES 
(1, 'text', '欢迎关注！我是您的金牌顾问，添加我领取新人礼包。'),
(2, 'text', '欢迎光临本店！扫码立领5元优惠券。');

-- Insert SOP templates
INSERT INTO `sop_templates` (name, description, steps) VALUES 
('新手入群SOP', '引导新客户进入社群并完成首单', '[{"step":1,"title":"首次招呼","content":"发送欢迎语并邀请入群"},{"step":2,"title":"产品介绍","content":"分享主打产品画册"},{"step":3,"title":"限时特惠","content":"推送首单立减优惠"}]'),
('流失预警SOP', '针对30天未下单客户的回访', '[{"step":1,"title":"温情问候","content":"发放回流代金券"},{"step":2,"title":"需求调研","content":"沟通产品体验反馈"}]');

-- Insert some tasks
INSERT INTO `work_tasks` (user_id, customer_id, type, title, description, status, due_time) VALUES 
(1, 101, 'manual', '回访张总', '跟进昨天咨询的定制需求', 'pending', DATE_ADD(NOW(), INTERVAL 1 DAY)),
(1, 102, 'sop', 'SOP: 新手入群 - 第1阶段', '发送欢迎语并邀请入群', 'pending', DATE_ADD(NOW(), INTERVAL 2 HOUR));

-- Insert sample stats
INSERT INTO `channel_code_stats` (channel_code_id, stat_date, scan_count, follow_count) VALUES 
(1, CURDATE(), 10, 3),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 15, 5),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 12, 4);
