package com.shoppro.service.integration;


/**
 * 钉钉集成相关数据模型和常量
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public class DingTalk {

    /**
     * 钉钉API常量
     */
    public static class Constants {
        public static final String BASE_URL = "https://oapi.dingtalk.com";
        public static final String TOKEN_URL = BASE_URL + "/gettoken";
        public static final String MESSAGE_SEND_URL = BASE_URL + "/topapi/message/send";
        public static final String ROBOT_SEND_URL = BASE_URL + "/robot/send";
        public static final String USER_GET_URL = BASE_URL + "/user/get";
        public static final String DEPARTMENT_GET_URL = BASE_URL + "/department/get";
        public static final String WORKFLOW_LIST_URL = BASE_URL + "/topapi/process/listbyname";
        public static final String WORKFLOW_TASK_LIST_URL = BASE_URL + "/topapi/process/gettasks";
    }

    /**
     * 钉钉消息类型
     */
    public enum MessageType {
        TEXT("text"),
        LINK("link"),
        MARKDOWN("markdown"),
        ACTION_CARD("action_card"),
        IMAGE("image"),
        FILE("file"),
        VOICE("voice"),
        VIDEO("video");

        private final String value;

        MessageType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    /**
     * 钉钉机器人文本消息
     */
    public static class RobotTextMessage {
        private String msgtype = "text";
        private TextContent text;
        private At at;

        public RobotTextMessage() {}

        public RobotTextMessage(String msgtype, TextContent text, At at) {
            this.msgtype = msgtype;
            this.text = text;
            this.at = at;
        }

        public String getMsgtype() { return msgtype; }
        public void setMsgtype(String msgtype) { this.msgtype = msgtype; }
        public TextContent getText() { return text; }
        public void setText(TextContent text) { this.text = text; }
        public At getAt() { return at; }
        public void setAt(At at) { this.at = at; }
    }

    /**
     * 文本内容
     */
    public static class TextContent {
        private String content;

        public TextContent() {}

        public TextContent(String content) {
            this.content = content;
        }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    /**
     * @提醒设置
     */
    public static class At {
        private String[] atMobiles;
        private String[] atUserIds;
        private Boolean isAtAll;

        public At() {}

        public At(String[] atMobiles, String[] atUserIds, Boolean isAtAll) {
            this.atMobiles = atMobiles;
            this.atUserIds = atUserIds;
            this.isAtAll = isAtAll;
        }

        public String[] getAtMobiles() { return atMobiles; }
        public void setAtMobiles(String[] atMobiles) { this.atMobiles = atMobiles; }
        public String[] getAtUserIds() { return atUserIds; }
        public void setAtUserIds(String[] atUserIds) { this.atUserIds = atUserIds; }
        public Boolean getIsAtAll() { return isAtAll; }
        public void setIsAtAll(Boolean isAtAll) { this.isAtAll = isAtAll; }
    }

    /**
     * 消息发送请求
     */
    public static class MessageRequest {
        private Long receiver_id;          // 接收人ID
        private Integer msg_type;          // 消息类型
        private String content;            // 消息内容
        private Long agent_id;             // 应用ID

        public MessageRequest() {}

        public MessageRequest(Long receiver_id, Integer msg_type, String content, Long agent_id) {
            this.receiver_id = receiver_id;
            this.msg_type = msg_type;
            this.content = content;
            this.agent_id = agent_id;
        }

        public Long getReceiver_id() { return receiver_id; }
        public void setReceiver_id(Long receiver_id) { this.receiver_id = receiver_id; }
        public Integer getMsg_type() { return msg_type; }
        public void setMsg_type(Integer msg_type) { this.msg_type = msg_type; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Long getAgent_id() { return agent_id; }
        public void setAgent_id(Long agent_id) { this.agent_id = agent_id; }
    }

    /**
     * API响应
     */
    public static class ApiResponse<T> {
        private Integer errcode;
        private String errmsg;
        private T result;
        private Boolean success;

        public ApiResponse() {}

        public ApiResponse(Integer errcode, String errmsg, T result, Boolean success) {
            this.errcode = errcode;
            this.errmsg = errmsg;
            this.result = result;
            this.success = success;
        }

        public Integer getErrcode() { return errcode; }
        public void setErrcode(Integer errcode) { this.errcode = errcode; }
        public String getErrmsg() { return errmsg; }
        public void setErrmsg(String errmsg) { this.errmsg = errmsg; }
        public T getResult() { return result; }
        public void setResult(T result) { this.result = result; }
        public Boolean getSuccess() { return success; }
        public void setSuccess(Boolean success) { this.success = success; }
    }

    /**
     * Token响应
     */
    public static class TokenResponse {
        private String access_token;
        private Integer expires_in;

        public TokenResponse() {}

        public TokenResponse(String access_token, Integer expires_in) {
            this.access_token = access_token;
            this.expires_in = expires_in;
        }

        public String getAccess_token() { return access_token; }
        public void setAccess_token(String access_token) { this.access_token = access_token; }
        public Integer getExpires_in() { return expires_in; }
        public void setExpires_in(Integer expires_in) { this.expires_in = expires_in; }
    }

    /**
     * 用户信息
     */
    public static class UserInfo {
        private Long userid;
        private String name;
        private String mobile;
        private String email;
        private Integer department_id;
        private String position;
        private String avatar;

        public UserInfo() {}

        public UserInfo(Long userid, String name, String mobile, String email, Integer department_id, String position, String avatar) {
            this.userid = userid;
            this.name = name;
            this.mobile = mobile;
            this.email = email;
            this.department_id = department_id;
            this.position = position;
            this.avatar = avatar;
        }

        public Long getUserid() { return userid; }
        public void setUserid(Long userid) { this.userid = userid; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Integer getDepartment_id() { return department_id; }
        public void setDepartment_id(Integer department_id) { this.department_id = department_id; }
        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }
        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }
    }

    /**
     * 部门信息
     */
    public static class DepartmentInfo {
        private Integer id;
        private String name;
        private Integer parent_id;
        private Integer member_count;

        public DepartmentInfo() {}

        public DepartmentInfo(Integer id, String name, Integer parent_id, Integer member_count) {
            this.id = id;
            this.name = name;
            this.parent_id = parent_id;
            this.member_count = member_count;
        }

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Integer getParent_id() { return parent_id; }
        public void setParent_id(Integer parent_id) { this.parent_id = parent_id; }
        public Integer getMember_count() { return member_count; }
        public void setMember_count(Integer member_count) { this.member_count = member_count; }
    }

    /**
     * 工作流信息
     */
    public static class WorkflowInfo {
        private String process_code;
        private String process_name;
        private String description;

        public WorkflowInfo() {}

        public WorkflowInfo(String process_code, String process_name, String description) {
            this.process_code = process_code;
            this.process_name = process_name;
            this.description = description;
        }

        public String getProcess_code() { return process_code; }
        public void setProcess_code(String process_code) { this.process_code = process_code; }
        public String getProcess_name() { return process_name; }
        public void setProcess_name(String process_name) { this.process_name = process_name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    /**
     * 任务信息
     */
    public static class TaskInfo {
        private String task_id;
        private String task_name;
        private String assignee;
        private String status;
        private Long create_time;
        private Long due_time;

        public TaskInfo() {}

        public TaskInfo(String task_id, String task_name, String assignee, String status, Long create_time, Long due_time) {
            this.task_id = task_id;
            this.task_name = task_name;
            this.assignee = assignee;
            this.status = status;
            this.create_time = create_time;
            this.due_time = due_time;
        }

        public String getTask_id() { return task_id; }
        public void setTask_id(String task_id) { this.task_id = task_id; }
        public String getTask_name() { return task_name; }
        public void setTask_name(String task_name) { this.task_name = task_name; }
        public String getAssignee() { return assignee; }
        public void setAssignee(String assignee) { this.assignee = assignee; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Long getCreate_time() { return create_time; }
        public void setCreate_time(Long create_time) { this.create_time = create_time; }
        public Long getDue_time() { return due_time; }
        public void setDue_time(Long due_time) { this.due_time = due_time; }
    }

    /**
     * 消息发送结果
     */
    public static class MessageSendResult {
        private Integer errcode;
        private String errmsg;
        private String message_id;

        public MessageSendResult() {}

        public MessageSendResult(Integer errcode, String errmsg, String message_id) {
            this.errcode = errcode;
            this.errmsg = errmsg;
            this.message_id = message_id;
        }

        public Integer getErrcode() { return errcode; }
        public void setErrcode(Integer errcode) { this.errcode = errcode; }
        public String getErrmsg() { return errmsg; }
        public void setErrmsg(String errmsg) { this.errmsg = errmsg; }
        public String getMessage_id() { return message_id; }
        public void setMessage_id(String message_id) { this.message_id = message_id; }
    }

    /**
     * 机器人消息结果
     */
    public static class RobotMessageResult {
        private Integer errcode;
        private String errmsg;

        public RobotMessageResult() {}

        public RobotMessageResult(Integer errcode, String errmsg) {
            this.errcode = errcode;
            this.errmsg = errmsg;
        }

        public Integer getErrcode() { return errcode; }
        public void setErrcode(Integer errcode) { this.errcode = errcode; }
        public String getErrmsg() { return errmsg; }
        public void setErrmsg(String errmsg) { this.errmsg = errmsg; }
    }
}
