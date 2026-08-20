package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shoppro.entity.SystemSetting;
import com.shoppro.repository.SystemSettingRepository;
import com.shoppro.service.SystemSettingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;

@Service
public class SystemSettingServiceImpl implements SystemSettingService {

    private final SystemSettingRepository repository;

    public SystemSettingServiceImpl(SystemSettingRepository repository) {
        this.repository = repository;
    }

    @Override
    public String getSettingValue(String key) {
        SystemSetting setting = repository.selectOne(new QueryWrapper<SystemSetting>().eq("config_key", key));
        return setting != null ? setting.getConfigValue() : null;
    }

    @Override
    @Transactional
    public void saveSetting(String key, String value, String description) {
        SystemSetting existing = repository.selectOne(new QueryWrapper<SystemSetting>().eq("config_key", key));
        if (existing != null) {
            existing.setConfigValue(value);
            existing.setDescription(description);
            repository.updateById(existing);
        } else {
            SystemSetting setting = new SystemSetting();
            setting.setConfigKey(key);
            setting.setConfigValue(value);
            setting.setDescription(description);
            repository.insert(setting);
        }
    }

    @Override
    public Map<String, String> getSettingsByType(String type) {
        QueryWrapper<SystemSetting> queryWrapper = new QueryWrapper<>();
        // 按配置键前缀归类，保持配置查询规则一致
        queryWrapper.likeRight("config_key", type.toLowerCase());
        List<SystemSetting> list = repository.selectList(queryWrapper);
        return list.stream().collect(Collectors.toMap(SystemSetting::getConfigKey, SystemSetting::getConfigValue));
    }

    @Override
    public List<SystemSetting> getAllSettings() {
        return repository.selectList(null);
    }
}
