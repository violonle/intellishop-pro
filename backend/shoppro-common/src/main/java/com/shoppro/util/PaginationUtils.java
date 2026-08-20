package com.shoppro.util;

/**
 * 统一的分页参数归一化工具类。
 * 规则：pageNo >= 1；pageSize ∈ [1, 100]
 */
public final class PaginationUtils {
    private PaginationUtils() {}

    public static int normalizePageNo(int pageNo) {
        return Math.max(1, pageNo);
    }

    public static int normalizePageSize(int pageSize) {
        return Math.min(Math.max(1, pageSize), 100);
    }
}