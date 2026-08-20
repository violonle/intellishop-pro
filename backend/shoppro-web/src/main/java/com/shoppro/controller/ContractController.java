package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.Contract;
import com.shoppro.service.ContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@Tag(name = "合同管理")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER', 'SALES')")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @GetMapping
    @Operation(summary = "获取合同列表")
    public ApiResponse<Page<Contract>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        Page<Contract> result = contractService.list(page, size, keyword, status);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取合同详情")
    public ApiResponse<Contract> getById(@PathVariable Long id) {
        Contract contract = contractService.getById(id);
        return ApiResponse.success(contract);
    }

    @PostMapping
    @Operation(summary = "创建合同")
    public ApiResponse<Contract> create(@RequestBody Contract contract) {
        Contract result = contractService.create(contract);
        return ApiResponse.success(result, "创建成功");
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新合同")
    public ApiResponse<Contract> update(@PathVariable Long id, @RequestBody Contract contract) {
        contract.setId(id);
        Contract result = contractService.update(contract);
        return ApiResponse.success(result, "更新成功");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除合同")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        contractService.delete(id);
        return ApiResponse.success(null, "删除成功");
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "获取客户的所有合同")
    public ApiResponse<List<Contract>> getByCustomerId(@PathVariable Long customerId) {
        List<Contract> contracts = contractService.getByCustomerId(customerId);
        return ApiResponse.success(contracts);
    }

    @GetMapping("/lead/{leadId}")
    @Operation(summary = "获取线索关联的合同")
    public ApiResponse<List<Contract>> getByLeadId(@PathVariable Long leadId) {
        List<Contract> contracts = contractService.getByLeadId(leadId);
        return ApiResponse.success(contracts);
    }
}
