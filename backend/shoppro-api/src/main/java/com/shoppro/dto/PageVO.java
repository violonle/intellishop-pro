package com.shoppro.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * 分页VO
 * 
 * @author ShopPro Team
 * @version 1.0.0
 */
@Schema(description = "分页响应VO")
public class PageVO<T> {

    @Schema(description = "当前页码")
    private Long current;

    @Schema(description = "每页大小")
    private Long size;

    @Schema(description = "总记录数")
    private Long total;

    @Schema(description = "总页数")
    private Long pages;

    @Schema(description = "数据列表")
    private List<T> records;

    /**
     * 是否有下一页
     */
    @Schema(description = "是否有下一页")
    public boolean hasNext() {
        return current < pages;
    }

    /**
     * 是否有上一页
     */
    @Schema(description = "是否有上一页")
    public boolean hasPrevious() {
        return current > 1;
    }
}
