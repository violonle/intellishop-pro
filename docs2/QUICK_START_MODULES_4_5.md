# Quick Start: Continuing Module 4 & 5 Development

## Overview
This document provides a quick reference for continuing the development of Module 4 (Follow-Up Records) and Module 5 (Product Management).

**Status**: Module 4 is 60% complete, Module 5 is 50% complete
**Estimated Time to Complete**: 9-15 hours

---

## Module 4: Follow-Up Records - Next Steps

### Step 1: Implement FollowUpRecordServiceImpl (2-3 hours)

**Location**: `backend/src/main/java/com/shoppro/service/impl/FollowUpRecordServiceImpl.java`

**Template to follow**:
```java
@Service
@RequiredArgsConstructor
public class FollowUpRecordServiceImpl implements FollowUpRecordService {
    private final FollowUpRecordRepository repository;
    
    @Override
    public FollowUpRecord createFollowUp(FollowUpCreateDTO dto) {
        // Validate dto
        // Map DTO to entity
        // Set createdAt = LocalDateTime.now()
        // Save using repository.save()
        // Return saved entity
    }
    
    @Override
    public Page<FollowUpRecord> listUserFollowUps(Long userId, int pageNo, int pageSize, 
                                                   String type, String result) {
        // Create Page object: new Page<>(pageNo, pageSize)
        // Call repository.findPageByUser() with all parameters
        // Return result
    }
    
    // Implement other 9 methods similarly
}
```

**Key Methods to Implement**:
1. `createFollowUp()` - Validate and save new record
2. `getFollowUpDetail()` - Retrieve by ID
3. `updateFollowUp()` - Update existing record
4. `deleteFollowUp()` - Delete record
5. `listUserFollowUps()` - Paginated list for user
6. `listCustomerFollowUps()` - Paginated list for customer
7. `listLeadFollowUps()` - Paginated list for lead
8. `getPendingReminders()` - Filter by date range
9. `getOverdueFollowUps()` - Filter overdue
10. `getDailyStatistics()` - Aggregate daily stats
11. `getResultStatistics()` - Aggregate result stats

### Step 2: Implement FollowUpController (1-2 hours)

**Location**: `backend/src/main/java/com/shoppro/controller/FollowUpController.java`

**Template to follow**:
```java
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/follow-ups")
@Api(tags = "跟进记录管理", description = "跟进记录相关API")
public class FollowUpController {
    
    private final FollowUpRecordService service;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @ApiOperation("创建跟进记录")
    public ApiResponse<FollowUpRecord> createFollowUp(@RequestBody FollowUpCreateDTO dto) {
        // Validate dto (use @Valid if added to DTO)
        // Call service.createFollowUp(dto)
        // Return ApiResponse.success(result, "创建成功")
    }
    
    @GetMapping("/{id}")
    @ApiOperation("获取跟进记录详情")
    public ApiResponse<FollowUpRecord> getDetail(@PathVariable Long id) {
        // Call service.getFollowUpDetail(id)
        // Return ApiResponse.success() or ApiResponse.error() if not found
    }
    
    // Continue with remaining 13-17 endpoints...
}
```

**Endpoints to Create**:
```
POST   /follow-ups                           - Create
GET    /follow-ups/{id}                      - Get detail
PUT    /follow-ups/{id}                      - Update
DELETE /follow-ups/{id}                      - Delete
GET    /follow-ups/user/{userId}             - List user's follow-ups
GET    /follow-ups/customer/{customerId}     - List customer's follow-ups
GET    /follow-ups/lead/{leadId}             - List lead's follow-ups
GET    /follow-ups/reminders/{userId}        - Get pending reminders
GET    /follow-ups/overdue                   - Get overdue follow-ups
GET    /follow-ups/statistics/daily/{userId} - Daily statistics
GET    /follow-ups/statistics/result/{userId} - Result statistics
```

---

## Module 5: Product Management - Next Steps

### Step 1: Create Product DTOs and VOs (1-2 hours)

**Location**: `backend/src/main/java/com/shoppro/dto/ProductDTOs.java`

**Required Classes**:
- `ProductCreateDTO` - for POST /products
- `ProductUpdateDTO` - for PUT /products/{id}
- `ProductResponseVO` - for GET responses
- `ProductCategoryDTO` - for category operations
- `ProductSearchDTO` - for search parameters

**Key Fields for Product DTOs**:
```
name (required), sku (unique), categoryId, brand, model,
price, marketPrice, costPrice,
specifications (JSON), features (JSON), images (JSON),
description, stockQuantity, minStock
```

### Step 2: Implement ProductService & ProductCategoryService (3-4 hours)

**Create Two Service Classes**:

1. **ProductService.java** interface with methods:
   - CRUD: create, get, update, delete
   - Search: search, findByCategory, findByBrand, findByPriceRange
   - Featured: getFeaturedProducts, getTopSellers
   - Stock: decreaseStock, increaseStock, findLowStockProducts
   - List: listProducts (paginated, filtered)

2. **ProductCategoryService.java** interface with methods:
   - CRUD: create, get, update, delete
   - Tree: getRootCategories, getCategoryChildren, getCategoryPath
   - List: listCategories (paginated)
   - Validation: checkCircularReference, checkDuplicateName

### Step 3: Create ProductController & ProductCategoryController (2-3 hours)

**ProductController Endpoints**:
```
POST   /products                    - Create product
GET    /products/{id}               - Get product detail
PUT    /products/{id}               - Update product
DELETE /products/{id}               - Delete product
GET    /products                    - List products (paginated)
GET    /products/search             - Search products
GET    /products/featured           - Get featured products
GET    /products/top-sellers        - Get top sellers
POST   /products/{id}/stock/decrease - Decrease stock
POST   /products/{id}/stock/increase - Increase stock
GET    /products/price-range        - Filter by price
GET    /products/category/{categoryId} - List by category
```

**ProductCategoryController Endpoints**:
```
POST   /product-categories          - Create category
GET    /product-categories/{id}     - Get category
PUT    /product-categories/{id}     - Update category
DELETE /product-categories/{id}     - Delete category
GET    /product-categories          - List categories (root)
GET    /product-categories/{id}/children - Get sub-categories
GET    /product-categories/products/{categoryId} - Products in category
```

---

## Testing & Verification

### After Implementing Each Component

1. **Syntax Check**: Make sure code compiles
   ```bash
   mvn clean compile
   ```

2. **Build Check**:
   ```bash
   mvn clean package -DskipTests
   ```

3. **Test with Swagger**:
   - Start application: `mvn spring-boot:run`
   - Open browser: `http://localhost:8080/api/swagger-ui.html`
   - Try endpoints with sample data

### Sample Test Data

**For Follow-Up Records**:
```json
{
  "userId": 1,
  "customerId": 1,
  "leadId": 1,
  "type": "call",
  "title": "电话咨询",
  "content": "客户询问产品功能",
  "result": "positive",
  "nextFollowUpDate": "2024-10-25 10:00:00",
  "duration": 15
}
```

**For Products**:
```json
{
  "name": "iPhone 15 Pro",
  "sku": "IP15-PRO-128",
  "categoryId": 1,
  "brand": "Apple",
  "model": "A2846",
  "price": 8999.00,
  "marketPrice": 9299.00,
  "costPrice": 7500.00,
  "stockQuantity": 50,
  "minStock": 10,
  "description": "Apple's latest flagship smartphone",
  "status": "active"
}
```

---

## Common Pitfalls to Avoid

1. ❌ Forgetting `@RequiredArgsConstructor` on Service/Controller classes
2. ❌ Not using `@PreAuthorize` for security
3. ❌ Missing `@JsonFormat` on DateTime fields
4. ❌ Not validating input data before saving
5. ❌ Forgetting to set `createdAt`/`updatedAt` timestamps
6. ❌ Not handling null values properly in updates
7. ❌ Missing pagination parameters in list methods
8. ❌ Not using `ApiResponse.error()` for error cases

---

## Reference Pattern (from Module 2: Customers)

Look at these files for implementation patterns:
- `CustomerController.java` - Controller pattern with security
- `CustomerService.java` + `CustomerServiceImpl.java` - Service pattern
- `CustomerRepository.java` - Repository pattern

Copy the same structure and patterns for Module 4 & 5.

---

## File Locations

### Module 4 Files
- Entity: `backend/src/main/java/com/shoppro/entity/FollowUpRecord.java` ✅
- Repository: `backend/src/main/java/com/shoppro/repository/FollowUpRecordRepository.java` ✅
- Service Interface: `backend/src/main/java/com/shoppro/service/FollowUpRecordService.java` ✅
- Service Impl: `backend/src/main/java/com/shoppro/service/impl/FollowUpRecordServiceImpl.java` ⏳
- Controller: `backend/src/main/java/com/shoppro/controller/FollowUpController.java` ⏳
- DTOs: `backend/src/main/java/com/shoppro/dto/FollowUpRecordDTOs.java` ✅

### Module 5 Files
- Entity: `backend/src/main/java/com/shoppro/entity/Product.java` ✅
- Entity: `backend/src/main/java/com/shoppro/entity/ProductCategory.java` ✅
- Repository: `backend/src/main/java/com/shoppro/repository/ProductRepository.java` ✅
- Repository: `backend/src/main/java/com/shoppro/repository/ProductCategoryRepository.java` ✅
- Service Interfaces: `backend/src/main/java/com/shoppro/service/ProductService.java` ⏳
- Service Interfaces: `backend/src/main/java/com/shoppro/service/ProductCategoryService.java` ⏳
- Service Impl: `backend/src/main/java/com/shoppro/service/impl/ProductServiceImpl.java` ⏳
- Service Impl: `backend/src/main/java/com/shoppro/service/impl/ProductCategoryServiceImpl.java` ⏳
- Controllers: `backend/src/main/java/com/shoppro/controller/ProductController.java` ⏳
- Controllers: `backend/src/main/java/com/shoppro/controller/ProductCategoryController.java` ⏳
- DTOs: `backend/src/main/java/com/shoppro/dto/ProductDTOs.java` ⏳

---

## Support Resources

1. **Database Schema**: `database/scripts/01_init_database.sql`
2. **Existing Examples**: 
   - CustomerController.java (Module 2)
   - LeadController.java (Module 3)
3. **Configuration**: `backend/src/main/resources/application.yml`
4. **Status Report**: `MODULE_4_5_PROGRESS.md`
5. **Development Status**: `DEVELOPMENT_STATUS.md`

---

**Good luck! You've got this! 🚀**

*Generated: 2024-10-19*
