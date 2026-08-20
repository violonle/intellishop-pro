package com.shoppro.service;

import com.shoppro.entity.ChannelCode;
import com.shoppro.entity.FissionTask;
import com.shoppro.entity.WelcomeMessage;
import java.util.List;

/**
 * <p>
 * Acquisition Service Interface
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
public interface AcquisitionService {

    // Channel Codes
    List<ChannelCode> listChannelCodes(Long userId);

    ChannelCode createChannelCode(ChannelCode channelCode);

    ChannelCode updateChannelCode(Long id, ChannelCode channelCode);

    ChannelCode getChannelCodeByType(Long userId, String channelType);

    void deleteChannelCode(Long id);

    String generateQrCode(String content); // Helper to generate QR image

    // Statistics
    List<com.shoppro.entity.ChannelCodeStat> getChannelStats(Long channelCodeId, java.time.LocalDate startDate,
            java.time.LocalDate endDate);

    java.util.Map<String, Object> getGlobalAcquisitionStats(Long tenantId);

    java.util.List<java.util.Map<String, Object>> getChannelDistribution(Long tenantId);

    java.util.List<java.util.Map<String, Object>> getSalesRanking(Long tenantId);

    void recordScan(Long channelCodeId);

    // Welcome Messages
    List<WelcomeMessage> listWelcomeMessages(Long tenantId);

    WelcomeMessage getWelcomeMessage(Long channelCodeId);

    WelcomeMessage saveWelcomeMessage(WelcomeMessage welcomeMessage);

    void deleteWelcomeMessage(Long id);

    // Fission Tasks
    List<FissionTask> listFissionTasks();

    FissionTask createFissionTask(FissionTask task);

    void toggleFissionTaskStatus(Long id);

    String exportChannelStats();
}
