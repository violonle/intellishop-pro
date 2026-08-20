package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shoppro.entity.AiRevenueConfig;
import com.shoppro.entity.Lead;
import com.shoppro.repository.AiRevenueConfigRepository;
import com.shoppro.repository.LeadRepository;
import com.shoppro.service.DataScopeService;
import com.shoppro.service.RevenueIntelligenceService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RevenueIntelligenceServiceImpl implements RevenueIntelligenceService {

    private final AiRevenueConfigRepository revenueConfigRepo;
    private final LeadRepository leadRepository;
    private final DataScopeService dataScopeService;

    public RevenueIntelligenceServiceImpl(AiRevenueConfigRepository revenueConfigRepo,
                                          LeadRepository leadRepository,
                                          DataScopeService dataScopeService) {
        this.revenueConfigRepo = revenueConfigRepo;
        this.leadRepository = leadRepository;
        this.dataScopeService = dataScopeService;
    }

    @Override
    public Map<String, Object> getRevenueDashboard() {
        List<Lead> leads = scopedLeads();
        BigDecimal pipeline = sum(leads, lead -> !isClosed(lead));
        BigDecimal won = sum(leads, lead -> "won".equalsIgnoreCase(lead.getStatus()));
        BigDecimal forecast = leads.stream()
                .filter(lead -> !isClosed(lead))
                .map(lead -> value(lead).multiply(BigDecimal.valueOf(Optional.ofNullable(lead.getSuccessProbability()).orElse(0))).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long closed = leads.stream().filter(lead -> "won".equalsIgnoreCase(lead.getStatus()) || "lost".equalsIgnoreCase(lead.getStatus())).count();
        long wonCount = leads.stream().filter(lead -> "won".equalsIgnoreCase(lead.getStatus())).count();
        double winRate = closed == 0 ? 0 : (double) wonCount / closed;

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("predictedQuarterRevenue", forecast);
        data.put("currentWonRevenue", won);
        data.put("targetRevenue", BigDecimal.ZERO);
        data.put("revenueCompletionRate", 0D);
        data.put("pipelineHealthStatus", pipeline.signum() == 0 ? "EMPTY" : "AVAILABLE");
        data.put("winRate", winRate);
        data.put("winRateTrend", null);
        data.put("atRiskDealsCount", getAtRiskDeals().size());
        data.put("confidenceScore", null);
        data.put("pipelineValue", pipeline);
        return data;
    }

    @Override
    public Map<String, Object> getPipelineHealth() {
        List<Lead> leads = scopedLeads();
        Map<String, Long> counts = leads.stream().collect(Collectors.groupingBy(this::stageName, LinkedHashMap::new, Collectors.counting()));
        Map<String, BigDecimal> amounts = leads.stream().collect(Collectors.groupingBy(this::stageName, LinkedHashMap::new, Collectors.reducing(BigDecimal.ZERO, this::value, BigDecimal::add)));
        Map<String, AiRevenueConfig> configs = revenueConfigRepo.selectList(new QueryWrapper<AiRevenueConfig>()).stream()
                .collect(Collectors.toMap(AiRevenueConfig::getStageName, item -> item, (left, right) -> left));
        List<Map<String, Object>> stages = new ArrayList<>();
        for (Map.Entry<String, Long> entry : counts.entrySet()) {
            String stage = entry.getKey();
            List<Lead> stageLeads = leads.stream().filter(lead -> stage.equals(stageName(lead))).toList();
            double conversion = leads.isEmpty() ? 0 : (double) entry.getValue() / leads.size();
            double averageStay = stageLeads.stream().mapToLong(this::stayDays).average().orElse(0);
            Integer benchmark = configs.get(stage) == null ? null : configs.get(stage).getMaxStayDays();
            boolean stuck = benchmark != null && benchmark > 0 && averageStay > benchmark;
            stages.add(Map.of(
                    "stage", stage,
                    "count", entry.getValue(),
                    "amount", amounts.getOrDefault(stage, BigDecimal.ZERO),
                    "conversionRate", conversion,
                    "avgStayDays", averageStay,
                    "benchmarkStayDays", benchmark == null ? 0 : benchmark,
                    "isStuck", stuck));
        }
        String bottleneck = stages.stream().filter(item -> Boolean.TRUE.equals(item.get("isStuck"))).map(item -> String.valueOf(item.get("stage"))).findFirst().orElse(null);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("stages", stages);
        data.put("bottleneckStage", bottleneck);
        data.put("bottleneckReason", bottleneck == null ? null : "该阶段平均停留时间超过已配置基准");
        return data;
    }

    @Override
    public Map<String, Object> getWinRateTrends() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("months", List.of());
        data.put("winRates", List.of());
        data.put("factors", List.of());
        return data;
    }

    @Override
    public List<Map<String, Object>> getAtRiskDeals() {
        return scopedLeads().stream()
                .filter(this::isAtRisk)
                .map(this::toDealMap)
                .toList();
    }

    @Override
    public Map<String, Object> inspectDeal(Long dealId) {
        Lead lead = scopedLeads().stream().filter(item -> Objects.equals(item.getId(), dealId)).findFirst().orElse(null);
        if (lead == null) return null;
        Map<String, Object> result = toDealMap(lead);
        result.put("winRateHistory", List.of());
        result.put("strengths", List.of());
        result.put("weaknesses", List.of());
        result.put("nextBestActions", List.of());
        return result;
    }

    @Override
    public List<AiRevenueConfig> getAllRevenueConfigs() {
        return revenueConfigRepo.selectList(new QueryWrapper<AiRevenueConfig>().orderByAsc("sort_order"));
    }

    @Override
    public AiRevenueConfig updateRevenueConfig(Long id, AiRevenueConfig config) {
        AiRevenueConfig existing = revenueConfigRepo.selectById(id);
        if (existing == null) return null;
        if (config.getBenchmarkConversionRate() != null) existing.setBenchmarkConversionRate(config.getBenchmarkConversionRate());
        if (config.getMaxStayDays() != null) existing.setMaxStayDays(config.getMaxStayDays());
        existing.setUpdatedAt(LocalDateTime.now());
        revenueConfigRepo.updateById(existing);
        return existing;
    }

    private List<Lead> scopedLeads() {
        QueryWrapper<Lead> query = new QueryWrapper<>();
        dataScopeService.applyLeadScope(query);
        return leadRepository.selectList(query);
    }

    private Map<String, Object> toDealMap(Lead lead) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", lead.getId());
        result.put("dealId", lead.getId());
        result.put("dealName", lead.getTitle());
        result.put("amount", value(lead));
        result.put("stage", stageName(lead));
        result.put("stayDays", stayDays(lead));
        result.put("riskLevel", riskLevel(lead));
        result.put("riskReason", lead.getFollowUpDate() == null ? null : "下次跟进日期已到期");
        result.put("suggestedAction", null);
        return result;
    }

    private boolean isAtRisk(Lead lead) {
        return !isClosed(lead) && lead.getFollowUpDate() != null && lead.getFollowUpDate().isBefore(LocalDate.now());
    }

    private boolean isClosed(Lead lead) {
        return "won".equalsIgnoreCase(lead.getStatus()) || "lost".equalsIgnoreCase(lead.getStatus());
    }

    private String stageName(Lead lead) {
        return Optional.ofNullable(lead.getStage()).filter(item -> !item.isBlank()).orElseGet(() -> Optional.ofNullable(lead.getStatus()).orElse("未设置"));
    }

    private String riskLevel(Lead lead) {
        return "urgent".equalsIgnoreCase(lead.getPriority()) ? "HIGH" : "MEDIUM";
    }

    private BigDecimal value(Lead lead) {
        return Optional.ofNullable(lead.getEstimatedValue()).orElse(BigDecimal.ZERO);
    }

    private long stayDays(Lead lead) {
        return lead.getCreatedAt() == null ? 0 : Math.max(0, ChronoUnit.DAYS.between(lead.getCreatedAt().toLocalDate(), LocalDate.now()));
    }

    private BigDecimal sum(List<Lead> leads, java.util.function.Predicate<Lead> predicate) {
        return leads.stream().filter(predicate).map(this::value).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
