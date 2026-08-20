package com.shoppro.service.sms;

import java.util.Map;

public interface SmsService {

    boolean sendVerificationCode(String phone, String code);

    boolean sendMarketingSms(String phone, String content);

    boolean sendNotificationSms(String phone, String templateCode, Map<String, String> params);

    Map<String, Object> getSmsStatus(String messageId);

    int getRemainingQuota();
}
