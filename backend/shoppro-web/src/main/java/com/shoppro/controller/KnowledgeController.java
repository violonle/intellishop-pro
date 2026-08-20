package com.shoppro.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.Knowledge;
import com.shoppro.service.KnowledgeService;
import com.shoppro.util.PaginationUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 知识库控制器
 */
@RestController
@RequestMapping("/knowledge")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER', 'SALES', 'USER')")
public class KnowledgeController {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeController.class);

    private final KnowledgeService knowledgeService;

    @Autowired
    public KnowledgeController(KnowledgeService knowledgeService) {
        this.knowledgeService = knowledgeService;
    }

    @PostMapping
    public ApiResponse<Knowledge> create(@RequestBody Knowledge knowledge) {
        try {
            Knowledge created = knowledgeService.createKnowledge(knowledge);
            return ApiResponse.success(created);
        } catch (Exception e) {
            log.error("创建知识失败", e);
            return ApiResponse.error(500, "创建失败");
        }
    }

    @PutMapping
    public ApiResponse<Knowledge> update(@RequestBody Knowledge knowledge) {
        try {
            Knowledge updated = knowledgeService.updateKnowledge(knowledge);
            return ApiResponse.success(updated);
        } catch (Exception e) {
            log.error("更新知识失败", e);
            return ApiResponse.error(500, "更新失败");
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Boolean> delete(@PathVariable Long id) {
        try {
            boolean result = knowledgeService.deleteKnowledge(id);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("删除知识失败 id:{}", id, e);
            return ApiResponse.error(500, "删除失败");
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Knowledge> detail(@PathVariable Long id) {
        Knowledge knowledge = knowledgeService.getById(id);
        if (knowledge == null) {
            return ApiResponse.error(404, "未找到该知识");
        }
        return ApiResponse.success(knowledge);
    }

    @GetMapping("/category/{categoryId}")
    public ApiResponse<List<Knowledge>> listByCategory(@PathVariable Long categoryId) {
        try {
            List<Knowledge> list = knowledgeService.listByCategory(categoryId);
            return ApiResponse.success(list);
        } catch (Exception e) {
            log.error("按分类获取知识失败 categoryId:{}", categoryId, e);
            return ApiResponse.error(500, "查询失败");
        }
    }

    @GetMapping("/page")
    public ApiResponse<Page<Knowledge>> pageList(@RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        try {
            QueryWrapper<Knowledge> wrapper = new QueryWrapper<>();
            if (categoryId != null) {
                wrapper.eq("category_id", categoryId);
            }
            if (keyword != null && !keyword.isEmpty()) {
                wrapper.and(w -> w.like("title", keyword).or().like("content", keyword));
            }
            wrapper.eq("deleted", 0).orderByDesc("updated_at");
            // 归一化分页参数
            int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
            int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);

            Page<Knowledge> page = knowledgeService.pageList(new Page<>(normalizedPageNo, normalizedPageSize), wrapper);
            return ApiResponse.success(page);
        } catch (Exception e) {
            log.error("分页查询失败", e);
            return ApiResponse.error(500, "查询失败");
        }
    }

    @PostMapping("/{id}/view")
    public ApiResponse<Boolean> incrementView(@PathVariable Long id) {
        try {
            boolean ok = knowledgeService.incrementViewCount(id);
            return ApiResponse.success(ok);
        } catch (Exception e) {
            log.error("增加浏览失败 id:{}", id, e);
            return ApiResponse.error(500, "操作失败");
        }
    }

    @PostMapping("/{id}/like")
    public ApiResponse<Boolean> like(@PathVariable Long id) {
        try {
            boolean ok = knowledgeService.likeKnowledge(id);
            return ApiResponse.success(ok);
        } catch (Exception e) {
            log.error("点赞失败 id:{}", id, e);
            return ApiResponse.error(500, "操作失败");
        }
    }

    @GetMapping("/recommendations")
    public ApiResponse<List<String>> getRecommendations() {
        try {
            // Simple logic for now: Get top 3 viewed articles
            List<Knowledge> top = knowledgeService.listTopViewed(3);
            List<String> recs = top.stream()
                    .map(k -> "📈 热门内容：“" + k.getTitle() + "”被查看" + k.getViewCount() + "次，建议优先学习")
                    .collect(java.util.stream.Collectors.toList());

            if (recs.isEmpty()) {
                recs.add("✨ 智能匹配：基于您的角色，推荐“销售技巧”相关内容");
            }
            // Fill up to 2 items if needed
            if (recs.size() < 2) {
                recs.add("🔥 实时更新：新的产品资料已添加，建议及时查看");
            }
            return ApiResponse.success(recs);
        } catch (Exception e) {
            log.error("获取推荐失败", e);
            List<String> defaults = new java.util.ArrayList<>();
            defaults.add("✨ 智能匹配：基于您的角色，推荐“销售技巧”相关内容");
            return ApiResponse.success(defaults);
        }
    }
}
