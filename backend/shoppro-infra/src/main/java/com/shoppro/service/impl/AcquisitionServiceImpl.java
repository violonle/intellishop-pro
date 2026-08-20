package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.shoppro.entity.ChannelCode;
import com.shoppro.entity.ChannelCodeStat;
import com.shoppro.entity.FissionTask;
import com.shoppro.entity.WelcomeMessage;
import com.shoppro.repository.ChannelCodeRepository;
import com.shoppro.repository.ChannelCodeStatRepository;
import com.shoppro.repository.FissionTaskRepository;
import com.shoppro.repository.WelcomeMessageRepository;
import com.shoppro.service.AcquisitionService;
import com.shoppro.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AcquisitionServiceImpl implements AcquisitionService {

    private final ChannelCodeRepository channelCodeRepository;
    private final WelcomeMessageRepository welcomeMessageRepository;
    private final FissionTaskRepository fissionTaskRepository;
    private final ChannelCodeStatRepository channelCodeStatRepository;

    public AcquisitionServiceImpl(ChannelCodeRepository channelCodeRepository,
            WelcomeMessageRepository welcomeMessageRepository,
            FissionTaskRepository fissionTaskRepository,
            ChannelCodeStatRepository channelCodeStatRepository) {
        this.channelCodeRepository = channelCodeRepository;
        this.welcomeMessageRepository = welcomeMessageRepository;
        this.fissionTaskRepository = fissionTaskRepository;
        this.channelCodeStatRepository = channelCodeStatRepository;
    }

    @Override
    public List<ChannelCode> listChannelCodes(Long userId) {
        LambdaQueryWrapper<ChannelCode> wrapper = new LambdaQueryWrapper<ChannelCode>()
                .eq(ChannelCode::getUserId, userId);
        if (!isPlatformRole()) {
            wrapper.eq(ChannelCode::getEnterpriseId, currentEnterpriseId());
        }
        return channelCodeRepository.selectList(wrapper
                .orderByDesc(ChannelCode::getCreatedAt));
    }

    @Override
    @Transactional
    public ChannelCode createChannelCode(ChannelCode channelCode) {
        channelCode.setEnterpriseId(currentEnterpriseId());
        channelCode.setCreatedAt(LocalDateTime.now());
        channelCode.setScanCount(0);
        channelCode.setFollowCount(0);
        // In real impl, generate QR code image here and set codeUrl
        if (channelCode.getCodeUrl() == null) {
            channelCode.setCodeUrl(
                    "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + channelCode.getChannelName());
        }
        channelCodeRepository.insert(channelCode);
        return channelCode;
    }

    @Override
    @Transactional
    public ChannelCode updateChannelCode(Long id, ChannelCode channelCode) {
        ChannelCode existing = channelCodeRepository.selectById(id);
        if (existing == null) throw new IllegalArgumentException("渠道码不存在");
        assertTenantAccess(existing.getEnterpriseId());
        channelCode.setId(id);
        channelCode.setEnterpriseId(existing.getEnterpriseId());
        channelCode.setUserId(existing.getUserId());
        channelCode.setUpdatedAt(LocalDateTime.now());
        channelCodeRepository.updateById(channelCode);
        return channelCodeRepository.selectById(id);
    }

    @Override
    public void deleteChannelCode(Long id) {
        ChannelCode existing = channelCodeRepository.selectById(id);
        if (existing == null) throw new IllegalArgumentException("渠道码不存在");
        assertTenantAccess(existing.getEnterpriseId());
        channelCodeRepository.deleteById(id);
    }

    @Override
    public ChannelCode getChannelCodeByType(Long userId, String channelType) {
        LambdaQueryWrapper<ChannelCode> wrapper = new LambdaQueryWrapper<ChannelCode>()
                .eq(ChannelCode::getUserId, userId)
                .eq(ChannelCode::getChannelType, channelType);
        if (!isPlatformRole()) {
            wrapper.eq(ChannelCode::getEnterpriseId, currentEnterpriseId());
        }
        return channelCodeRepository.selectOne(wrapper);
    }

    @Override
    public String generateQrCode(String content) {
        return "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + content;
    }

    @Override
    public WelcomeMessage getWelcomeMessage(Long channelCodeId) {
        WelcomeMessage message = welcomeMessageRepository.selectOne(new LambdaQueryWrapper<WelcomeMessage>()
                .eq(WelcomeMessage::getChannelCodeId, channelCodeId));
        if (message != null) assertTenantAccess(message.getTenantId());
        return message;
    }

    @Override
    public List<WelcomeMessage> listWelcomeMessages(Long tenantId) {
        assertTenantAccess(tenantId);
        return welcomeMessageRepository.selectList(new LambdaQueryWrapper<WelcomeMessage>()
                .eq(WelcomeMessage::getTenantId, tenantId)
                .orderByDesc(WelcomeMessage::getPriority)
                .orderByDesc(WelcomeMessage::getCreatedAt));
    }

    @Override
    @Transactional
    public WelcomeMessage saveWelcomeMessage(WelcomeMessage welcomeMessage) {
        if (welcomeMessage.getId() != null) {
            WelcomeMessage existing = welcomeMessageRepository.selectById(welcomeMessage.getId());
            if (existing == null) throw new IllegalArgumentException("欢迎语不存在");
            assertTenantAccess(existing.getTenantId());
            welcomeMessage.setTenantId(existing.getTenantId());
        }
        assertTenantAccess(welcomeMessage.getTenantId());
        welcomeMessage.setUpdatedAt(LocalDateTime.now());
        if (welcomeMessage.getId() != null) {
            welcomeMessageRepository.updateById(welcomeMessage);
        } else {
            welcomeMessage.setCreatedAt(LocalDateTime.now());
            welcomeMessageRepository.insert(welcomeMessage);
        }
        return welcomeMessage;
    }

    @Override
    @Transactional
    public void deleteWelcomeMessage(Long id) {
        WelcomeMessage existing = welcomeMessageRepository.selectById(id);
        if (existing == null) throw new IllegalArgumentException("欢迎语不存在");
        assertTenantAccess(existing.getTenantId());
        welcomeMessageRepository.deleteById(id);
    }

    @Override
    public List<FissionTask> listFissionTasks() {
        LambdaQueryWrapper<FissionTask> wrapper = new LambdaQueryWrapper<>();
        if (!isPlatformRole()) {
            wrapper.eq(FissionTask::getEnterpriseId, currentEnterpriseId());
        }
        return fissionTaskRepository.selectList(wrapper.orderByDesc(FissionTask::getCreatedAt));
    }

    @Override
    @Transactional
    public FissionTask createFissionTask(FissionTask task) {
        task.setEnterpriseId(currentEnterpriseId());
        task.setCreatedAt(LocalDateTime.now());
        task.setStatus(1);
        fissionTaskRepository.insert(task);
        return task;
    }

    @Override
    @Transactional
    public void toggleFissionTaskStatus(Long id) {
        FissionTask task = fissionTaskRepository.selectById(id);
        if (task != null) {
            assertTenantAccess(task.getEnterpriseId());
            task.setStatus(task.getStatus() == 1 ? 0 : 1);
            fissionTaskRepository.updateById(task);
        }
    }

    @Override
    public List<ChannelCodeStat> getChannelStats(Long channelCodeId, LocalDate startDate, LocalDate endDate) {
        ChannelCode code = channelCodeRepository.selectById(channelCodeId);
        if (code == null) throw new IllegalArgumentException("渠道码不存在");
        assertTenantAccess(code.getEnterpriseId());
        return channelCodeStatRepository.selectList(new LambdaQueryWrapper<ChannelCodeStat>()
                .eq(ChannelCodeStat::getChannelCodeId, channelCodeId)
                .ge(ChannelCodeStat::getStatDate, startDate)
                .le(ChannelCodeStat::getStatDate, endDate)
                .orderByAsc(ChannelCodeStat::getStatDate));
    }

    @Override
    public java.util.Map<String, Object> getGlobalAcquisitionStats(Long tenantId) {
        assertTenantAccess(tenantId);
        return channelCodeRepository.getGlobalStats(tenantId);
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> getChannelDistribution(Long tenantId) {
        assertTenantAccess(tenantId);
        return channelCodeRepository.getChannelDistribution(tenantId);
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> getSalesRanking(Long tenantId) {
        assertTenantAccess(tenantId);
        return channelCodeRepository.getSalesRanking(tenantId);
    }

    @Override
    public String exportChannelStats() {
        LambdaQueryWrapper<ChannelCode> wrapper = new LambdaQueryWrapper<>();
        if (!isPlatformRole()) {
            wrapper.eq(ChannelCode::getEnterpriseId, currentEnterpriseId());
        }
        List<ChannelCode> codes = channelCodeRepository.selectList(wrapper);
        StringBuilder csv = new StringBuilder("ID,渠道类型,渠道名称,扫码量,获客量,转化率\n");
        for (ChannelCode code : codes) {
            double rate = (code.getScanCount() != null && code.getScanCount() > 0)
                    ? (double) code.getFollowCount() / code.getScanCount() * 100
                    : 0;
            csv.append(code.getId()).append(",")
                    .append(code.getChannelType()).append(",")
                    .append(code.getChannelName()).append(",")
                    .append(code.getScanCount()).append(",")
                    .append(code.getFollowCount()).append(",")
                    .append(String.format("%.2f%%", rate)).append("\n");
        }
        return csv.toString();
    }

    @Override
    @Transactional
    public void recordScan(Long channelCodeId) {
        // 1. Update total count in channel_codes
        ChannelCode code = channelCodeRepository.selectById(channelCodeId);
        if (code == null) throw new IllegalArgumentException("渠道码不存在");
        assertTenantAccess(code.getEnterpriseId());
        if (code != null) {
            code.setScanCount((code.getScanCount() == null ? 0 : code.getScanCount()) + 1);
            channelCodeRepository.updateById(code);
        }

        // 2. Update daily stats in channel_code_stats
        LocalDate today = LocalDate.now();
        ChannelCodeStat stat = channelCodeStatRepository.selectOne(new LambdaQueryWrapper<ChannelCodeStat>()
                .eq(ChannelCodeStat::getChannelCodeId, channelCodeId)
                .eq(ChannelCodeStat::getStatDate, today));

        if (stat != null) {
            stat.setScanCount(stat.getScanCount() + 1);
            channelCodeStatRepository.updateById(stat);
        } else {
            stat = new ChannelCodeStat();
            stat.setChannelCodeId(channelCodeId);
            stat.setStatDate(today);
            stat.setScanCount(1);
            stat.setFollowCount(0);
            stat.setCreatedAt(LocalDateTime.now());
            channelCodeStatRepository.insert(stat);
        }
    }

    private Long currentEnterpriseId() {
        if (SecurityUtils.getLoginUser() == null || SecurityUtils.getLoginUser().getUser() == null
                || SecurityUtils.getLoginUser().getUser().getEnterpriseId() == null) {
            throw new SecurityException("当前用户未绑定企业");
        }
        return SecurityUtils.getLoginUser().getUser().getEnterpriseId();
    }

    private boolean isPlatformRole() {
        return SecurityUtils.getAuthentication() != null && SecurityUtils.getAuthentication().getAuthorities().stream()
                .anyMatch(a -> java.util.Set.of("ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_PLATFORM_ADMIN").contains(a.getAuthority()));
    }

    private void assertTenantAccess(Long tenantId) {
        if (tenantId == null) throw new SecurityException("企业不能为空");
        if (!isPlatformRole() && !tenantId.equals(currentEnterpriseId())) {
            throw new SecurityException("无权访问其他企业数据");
        }
    }
}
