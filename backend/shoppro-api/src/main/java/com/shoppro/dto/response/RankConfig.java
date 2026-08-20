package com.shoppro.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 职级体系配置 DTO
 */
/**
 * 职级体系配置 DTO
 */
public class RankConfig {
    /**
     * 职级分类名称 (如：管理职、专业职、操作职)
     */
    private String category;

    /**
     * 职级列表 (如：M1, M2, M3)
     */
    private List<String> levels;

    public RankConfig() {
    }

    public RankConfig(String category, List<String> levels) {
        this.category = category;
        this.levels = levels;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getLevels() {
        return levels;
    }

    public void setLevels(List<String> levels) {
        this.levels = levels;
    }
}
