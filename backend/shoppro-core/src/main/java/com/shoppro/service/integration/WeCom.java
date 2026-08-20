package com.shoppro.service.integration;


/**
 * 企业微信相关数据模型和常量
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public class WeCom {

    /**
     * 企业微信API常量
     */
    public static class Constants {
        public static final String BASE_URL = "https://qyapi.weixin.qq.com/cgi-bin";
        public static final String TOKEN_URL = BASE_URL + "/gettoken";
        public static final String MESSAGE_SEND_URL = BASE_URL + "/message/send";
        public static final String USER_GET_URL = BASE_URL + "/user/get";
        public static final String USER_LIST_URL = BASE_URL + "/user/list";
        public static final String DEPARTMENT_LIST_URL = BASE_URL + "/department/list";
    }

    /**
     * 企业微信消息类型
     */
    public enum MessageType {
        TEXT("text"),
        IMAGE("image"),
        VOICE("voice"),
        VIDEO("video"),
        FILE("file"),
        TEXTCARD("textcard"),
        NEWS("news");

        private final String value;

        MessageType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    /**
     * 企业微信消息请求
     */
    public static class MessageRequest {
        private String touser;           // 成员ID列表
        private String toparty;          // 部门ID列表
        private String totag;            // 标签ID列表
        private String msgtype;          // 消息类型
        private String agentid;          // 应用ID
        private TextMessage text;
        private NewsMessage news;
        private ImageMessage image;

        public MessageRequest() {}

        public String getTouser() { return touser; }
        public void setTouser(String touser) { this.touser = touser; }
        public String getToparty() { return toparty; }
        public void setToparty(String toparty) { this.toparty = toparty; }
        public String getTotag() { return totag; }
        public void setTotag(String totag) { this.totag = totag; }
        public String getMsgtype() { return msgtype; }
        public void setMsgtype(String msgtype) { this.msgtype = msgtype; }
        public String getAgentid() { return agentid; }
        public void setAgentid(String agentid) { this.agentid = agentid; }
        public TextMessage getText() { return text; }
        public void setText(TextMessage text) { this.text = text; }
        public NewsMessage getNews() { return news; }
        public void setNews(NewsMessage news) { this.news = news; }
        public ImageMessage getImage() { return image; }
        public void setImage(ImageMessage image) { this.image = image; }
    }

    /**
     * 文本消息
     */
    public static class TextMessage {
        private String content;

        public TextMessage() {}

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    /**
     * 图文消息
     */
    public static class NewsMessage {
        private Article[] articles;

        public NewsMessage() {}

        public Article[] getArticles() { return articles; }
        public void setArticles(Article[] articles) { this.articles = articles; }
    }

    /**
     * 图文消息项
     */
    public static class Article {
        private String title;
        private String description;
        private String url;
        private String picurl;

        public Article() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getPicurl() { return picurl; }
        public void setPicurl(String picurl) { this.picurl = picurl; }
    }

    /**
     * 图片消息
     */
    public static class ImageMessage {
        private String media_id;

        public ImageMessage() {}

        public String getMedia_id() { return media_id; }
        public void setMedia_id(String media_id) { this.media_id = media_id; }
    }

    /**
     * API响应
     */
    public static class ApiResponse<T> {
        private Integer errcode;
        private String errmsg;
        private T data;

        public ApiResponse() {}

        public Integer getErrcode() { return errcode; }
        public void setErrcode(Integer errcode) { this.errcode = errcode; }
        public String getErrmsg() { return errmsg; }
        public void setErrmsg(String errmsg) { this.errmsg = errmsg; }
        public T getData() { return data; }
        public void setData(T data) { this.data = data; }
    }

    /**
     * Token响应
     */
    public static class TokenResponse {
        private String access_token;
        private Integer expires_in;

        public TokenResponse() {}

        public String getAccess_token() { return access_token; }
        public void setAccess_token(String access_token) { this.access_token = access_token; }
        public Integer getExpires_in() { return expires_in; }
        public void setExpires_in(Integer expires_in) { this.expires_in = expires_in; }
    }

    /**
     * 用户信息
     */
    public static class UserInfo {
        private String userid;
        private String name;
        private String mobile;
        private String email;
        private String department;
        private String position;
        private String avatar;

        public UserInfo() {}

        public String getUserid() { return userid; }
        public void setUserid(String userid) { this.userid = userid; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
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
        private Integer parentid;

        public DepartmentInfo() {}

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Integer getParentid() { return parentid; }
        public void setParentid(Integer parentid) { this.parentid = parentid; }
    }

    /**
     * 消息发送结果
     */
    public static class MessageSendResult {
        private Integer errcode;
        private String errmsg;
        private String msgid;
        private Integer invaliduser;
        private Integer invalidparty;
        private Integer invalidtag;

        public MessageSendResult() {}

        public Integer getErrcode() { return errcode; }
        public void setErrcode(Integer errcode) { this.errcode = errcode; }
        public String getErrmsg() { return errmsg; }
        public void setErrmsg(String errmsg) { this.errmsg = errmsg; }
        public String getMsgid() { return msgid; }
        public void setMsgid(String msgid) { this.msgid = msgid; }
        public Integer getInvaliduser() { return invaliduser; }
        public void setInvaliduser(Integer invaliduser) { this.invaliduser = invaliduser; }
        public Integer getInvalidparty() { return invalidparty; }
        public void setInvalidparty(Integer invalidparty) { this.invalidparty = invalidparty; }
        public Integer getInvalidtag() { return invalidtag; }
        public void setInvalidtag(Integer invalidtag) { this.invalidtag = invalidtag; }
    }
}
