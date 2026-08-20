# API 分页规则说明

为提升服务稳定性并避免异常调用，后端接口统一采用以下分页参数归一化策略，并建议所有分页接口遵循：

## 统一参数
- `pageNo`：页码，默认值 `1`
- `pageSize`：每页数量，默认值 `10`

## 归一化策略
- 页码下限：`pageNo >= 1`。当传入 `pageNo <= 0` 时，归一化为 `1`。
- 页大小范围：`1 <= pageSize <= 100`。当传入 `pageSize <= 0` 时归一化为 `1`，当传入 `pageSize > 100` 时归一化为 `100`。

## 适用范围
- 已应用控制器：`CustomerController`、`ProductController`、`LeadController`、`UserController`、`DepartmentController`、`KnowledgeController`。
- 建议统一接入：`PermissionController` 及其他存在分页的接口。

## 设计原则
- 归一化在控制器层完成，服务层签名保持不变。
- 默认排序与过滤逻辑不受影响。
- 返回体遵循统一的 `ApiResponse` 包装，分页数据以 `Page<T>` 序列化到 `data` 字段中。

## 示例
- 请求：`GET /api/customers/list?pageNo=0&pageSize=0` → 实际使用：`pageNo=1, pageSize=1`
- 请求：`GET /api/products/search?pageNo=10&pageSize=999` → 实际使用：`pageNo=10, pageSize=100`

## 客户端建议
- 前端在构建请求时尽量遵循上述边界，减少不必要的归一化开销。
- 当需要大批量导出时，请使用专门的导出接口，避免将 `pageSize` 设置为过大值。

## 分页示例

### Customers
- 请求：`GET /api/customers?pageNo=1&pageSize=20&level=VIP`
- 响应示例：
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "list": [ { "id": 1, "name": "Acme", "level": "VIP" } ],
    "total": 1,
    "pageNo": 1,
    "pageSize": 20
  }
}
```

### Products
- 请求：`GET /api/products?pageNo=1&pageSize=20&status=ONSALE`
- 响应示例：
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "list": [ { "id": 100, "name": "Widget", "status": "ONSALE" } ],
    "total": 1,
    "pageNo": 1,
    "pageSize": 20
  }
}
```

### Departments
- 请求：`GET /api/departments/page?pageNo=1&pageSize=10&name=研发&status=1`
- 响应示例：
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "list": [ { "id": 10, "name": "研发部", "status": 1 } ],
    "total": 1,
    "pageNo": 1,
    "pageSize": 10
  }
}
```

### Permissions
- 请求：`GET /api/permissions/page?pageNo=1&pageSize=10&resource=product&status=1`
- 响应示例：
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "list": [ { "id": 5, "name": "产品查看", "resource": "product", "status": 1 } ],
    "total": 1,
    "pageNo": 1,
    "pageSize": 10
  }
}
```

## 控制器层适配示例（PermissionController）

下面示例展示了在控制器层对 `pageNo`/`pageSize` 进行归一化，保持服务层签名不变：

```java
@GetMapping("/page")
public ApiResponse<PagePermissionResult> page(
    @RequestParam(defaultValue = "1") int pageNo,
    @RequestParam(defaultValue = "10") int pageSize,
    @RequestParam(required = false) String name,
    @RequestParam(required = false) String resource,
    @RequestParam(required = false) Integer status
) {
    // 归一化策略：pageNo >= 1，1 <= pageSize <= 100
    pageNo = Math.max(1, pageNo);
    pageSize = Math.min(100, Math.max(1, pageSize));
    return ApiResponse.success(permissionService.page(pageNo, pageSize, name, resource, status));
}
```

注意事项：
- 归一化与默认值在控制器层处理，避免影响服务层签名与测试。
- 过滤参数（`name`、`resource`、`status`）保持可选，默认不影响查询结果。
- 返回体统一为 `ApiResponse` 包装，分页数据序列化为 `PagePermissionResult` 的 `data` 字段。