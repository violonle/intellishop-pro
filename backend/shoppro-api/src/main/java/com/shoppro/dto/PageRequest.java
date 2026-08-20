package com.shoppro.dto;

import io.swagger.v3.oas.annotations.media.Schema;


import jakarta.validation.constraints.Min;

/**
 * 分页请求DTO
 * 
 * @author ShopPro Team
 * @version 1.0.0
 */

@Schema(description = "分页请求DTO")
public class PageRequest {

    @Min(value = 1, message = "当前页码必须大于0")
    @Schema(description = "当前页码", required = true)
    private Long current = 1L;

    @Min(value = 1, message = "每页大小必须大于0")
    @Schema(description = "每页大小", required = true)
    private Long size = 10L;

    @Schema(description = "排序字段")
    private String orderByColumn;

    @Schema(description = "排序方向：asc-升序，desc-降序")
    private String orderDirection;

    // 无参构造器
    public PageRequest() {
    }

    // 全参构造器
    public PageRequest(Long current, Long size, String orderByColumn, String orderDirection) {
        this.current = current;
        this.size = size;
        this.orderByColumn = orderByColumn;
        this.orderDirection = orderDirection;
    }

        public Long getCurrent() {
        return current;
    }

    public void setCurrent(Long current) {
        this.current = current;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public String getOrderByColumn() {
        return orderByColumn;
    }

    public void setOrderByColumn(String orderByColumn) {
        this.orderByColumn = orderByColumn;
    }

    public String getOrderDirection() {
        return orderDirection;
    }

    public void setOrderDirection(String orderDirection) {
        this.orderDirection = orderDirection;
    }
}
