package com.shoppro.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 客户响应VO
 * 
 * @author ShopPro Team
 * @version 1.0.0
 */
@Schema(description = "客户响应VO")
public class CustomerResponseVO {

    @Schema(description = "客户ID")
    private Long id;

    @Schema(description = "客户姓名")
    private String name;

    @Schema(description = "联系电话")
    private String phone;

    @Schema(description = "邮箱地址")
    private String email;

    @Schema(description = "微信号")
    private String wechat;

    @Schema(description = "性别: male-男, female-女, unknown-未知")
    private String gender;

    @Schema(description = "年龄")
    private Integer age;

    @Schema(description = "生日")
    private LocalDate birthday;

    @Schema(description = "客户来源")
    private String source;

    @Schema(description = "客户等级: normal-普通, vip-VIP, diamond-钻石")
    private String level;

    @Schema(description = "客户状态: active-活跃, inactive-不活跃, potential-潜在, lost-流失")
    private String status;

    @Schema(description = "客户标签列表")
    private List<String> tags;

    @Schema(description = "联系地址")
    private String address;

    @Schema(description = "公司名称")
    private String company;

    @Schema(description = "职位")
    private String position;

    @Schema(description = "年收入")
    private BigDecimal annualIncome;

    @Schema(description = "偏好设置")
    private Map<String, Object> preferences;

    @Schema(description = "备注信息")
    private String notes;

    @Schema(description = "创建人ID")
    private Long createdBy;

    @Schema(description = "分配给（销售人员ID）")
    private Long assignedTo;

    @Schema(description = "分配给（销售人员姓名）")
    private String assignedToName;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;

    // 显式无参构造器
    public CustomerResponseVO() {}

        public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getWechat() { return wechat; }
    public void setWechat(String wechat) { this.wechat = wechat; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public LocalDate getBirthday() { return birthday; }
    public void setBirthday(LocalDate birthday) { this.birthday = birthday; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public BigDecimal getAnnualIncome() { return annualIncome; }
    public void setAnnualIncome(BigDecimal annualIncome) { this.annualIncome = annualIncome; }

    public Map<String, Object> getPreferences() { return preferences; }
    public void setPreferences(Map<String, Object> preferences) { this.preferences = preferences; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }

    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
