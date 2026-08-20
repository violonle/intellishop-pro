package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.OperationLog;

public interface OperationLogService {
    Page<OperationLog> getLogPage(int pageNo, int pageSize, String username, String module);

    void saveLog(OperationLog log);
}
