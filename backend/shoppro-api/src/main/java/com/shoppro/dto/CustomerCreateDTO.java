package com.shoppro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 创建客户DTO
 * 
 * @author ShopPro Team
 * @version 1.0.0
 */

@Schema(description = "创建客户请求DTO")
public class CustomerCreateDTO {

    @NotBlank(message = "客户姓名不能为空")
    @Schema(description = "客户姓名")
    private String name;

    @NotBlank(message = "联系电话不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$|^\\d{7,8}$|^\\d{3,4}-\\d{7,8}$", message = "电话号码格式不正确")
    @Schema(description = "联系电话")
    private String phone;

    @Email(message = "邮箱格式不正确")
    @Schema(description = "邮箱地址")
    private String email;

    @Schema(description = "微信号")
    private String wechat;

    @Pattern(regexp = "^(male|female|unknown)$", message = "性别只能是male、female或unknown")
    @Schema(description = "性别: male-男, female-女, unknown-未知")
    private String gender;

    @Min(value = 0, message = "年龄不能为负数")
    @Max(value = 150, message = "年龄不能超过150岁")
    @Schema(description = "年龄")
    private Integer age;

    @Schema(description = "生日")
    private LocalDate birthday;

    @Schema(description = "客户来源")
    private String source;

    @Pattern(regexp = "^(normal|vip|diamond)$", message = "客户等级只能是normal、vip或diamond")
    @Schema(description = "客户等级: normal-普通, vip-VIP, diamond-钻石")
    private String level;

    @Pattern(regexp = "^(active|inactive|potential|lost)$", message = "客户状态只能是active、inactive、potential或lost")
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

    @DecimalMin(value = "0", inclusive = false, message = "年收入必须为正数")
    @Schema(description = "年收入")
    private BigDecimal annualIncome;

    @Schema(description = "偏好设置")
    private Map<String, Object> preferences;

    @Schema(description = "备注信息")
    private String notes;

    @Schema(description = "分配给（销售人员ID）")
    private Long assignedTo;

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

    public java.time.LocalDate getBirthday() { return birthday; }
    public void setBirthday(java.time.LocalDate birthday) { this.birthday = birthday; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public java.util.List<String> getTags() { return tags; }
    public void setTags(java.util.List<String> tags) { this.tags = tags; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public java.math.BigDecimal getAnnualIncome() { return annualIncome; }
    public void setAnnualIncome(java.math.BigDecimal annualIncome) { this.annualIncome = annualIncome; }

    public java.util.Map<String, Object> getPreferences() { return preferences; }
    public void setPreferences(java.util.Map<String, Object> preferences) { this.preferences = preferences; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }
}
