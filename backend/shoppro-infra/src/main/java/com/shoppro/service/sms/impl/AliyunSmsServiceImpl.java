package com.shoppro.service.sms.impl;

import com.aliyun.dysmsapi20170525.Client;
import com.aliyun.dysmsapi20170525.models.SendSmsRequest;
import com.aliyun.dysmsapi20170525.models.SendSmsResponse;
import com.aliyun.dysmsapi20170525.models.SendSmsResponseBody;
import com.aliyun.teaopenapi.models.Config;
import com.shoppro.service.sms.SmsService;
import com.alibaba.fastjson.JSON;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "sms.provider", havingValue = "aliyun")
public class AliyunSmsServiceImpl implements SmsService {

    private static final Logger log = LoggerFactory.getLogger(AliyunSmsServiceImpl.class);

    @Value("${sms.aliyun.access-key-id:}")
    private String accessKeyId;

    @Value("${sms.aliyun.access-key-secret:}")
    private String accessKeySecret;

    @Value("${sms.aliyun.sign-name:}")
    private String signName;

    @Value("${sms.aliyun.template-code:}")
    private String templateCode;

    private Client client;

    @PostConstruct
    public void init() throws Exception {
        Config config = new Config();
        config.setAccessKeyId(accessKeyId);
        config.setAccessKeySecret(accessKeySecret);
        config.setEndpoint("dysmsapi.aliyuncs.com");
        config.setRegionId("cn-hangzhou");
        this.client = new Client(config);
        log.info("阿里云短信服务初始化完成");
    }

    @Override
    public boolean sendVerificationCode(String phone, String code) {
        try {
            SendSmsRequest sendSmsRequest = new SendSmsRequest();
            sendSmsRequest.setPhoneNumbers(phone);
            sendSmsRequest.setSignName(signName);
            sendSmsRequest.setTemplateCode(templateCode);
            sendSmsRequest.setTemplateParam("{\"code\":\"" + code + "\"}");

            SendSmsResponse response = client.sendSms(sendSmsRequest);
            SendSmsResponseBody body = response.getBody();

            if ("OK".equals(body.getCode())) {
                log.info("短信验证码发送成功: phone={}, bizId={}", phone, body.getBizId());
                return true;
            } else {
                log.error("短信发送失败: phone={}, code={}, message={}", phone, body.getCode(), body.getMessage());
                return false;
            }
        } catch (Exception e) {
            log.error("短信发送异常: phone={}", phone, e);
            return false;
        }
    }

    @Override
    public boolean sendMarketingSms(String phone, String content) {
        log.info("营销短信发送: phone={}, content={}", phone, content);
        return false;
    }

    @Override
    public boolean sendNotificationSms(String phone, String templateCode, Map<String, String> params) {
        try {
            SendSmsRequest sendSmsRequest = new SendSmsRequest();
            sendSmsRequest.setPhoneNumbers(phone);
            sendSmsRequest.setSignName(signName);
            sendSmsRequest.setTemplateCode(templateCode);
            sendSmsRequest.setTemplateParam(params != null ? JSON.toJSONString(params) : "{}");

            SendSmsResponse response = client.sendSms(sendSmsRequest);
            SendSmsResponseBody body = response.getBody();

            return "OK".equals(body.getCode());
        } catch (Exception e) {
            log.error("通知短信发送异常: phone={}", phone, e);
            return false;
        }
    }

    @Override
    public Map<String, Object> getSmsStatus(String messageId) {
        return Map.of("status", "unknown", "messageId", messageId);
    }

    @Override
    public int getRemainingQuota() {
        return 0;
    }
}
