package com.shoppro.service;

import com.shoppro.entity.SystemSetting;
import java.util.List;
import java.util.Map;

public interface SystemSettingService {
    String getSettingValue(String key);

    void saveSetting(String key, String value, String description);

    Map<String, String> getSettingsByType(String type);

    List<SystemSetting> getAllSettings();
}
