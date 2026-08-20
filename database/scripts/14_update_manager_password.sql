-- 更新manager001用户的密码为123456
UPDATE users SET password = '$2a$10$PZ5BEfAQeSQ9XBMlekG2GujcmhuFfhT.KcYRyT5WwsID4e8tJOM8q' WHERE username = 'manager001';

-- 验证更新结果
SELECT id, username, password FROM users WHERE username = 'manager001';
