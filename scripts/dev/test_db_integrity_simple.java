import java.sql.*;

public class test_db_integrity_simple {
    public static void main(String[] args) {
        String jdbcUrl = "jdbc:mysql://localhost:3306/shoppro?useUnicode=true&characterEncoding=utf8&serverTimezone=GMT%2B8&useSSL=false&allowPublicKeyRetrieval=true";
        String username = "shoppro";
        String password = "ShopProDB2024!";
        
        try (Connection conn = DriverManager.getConnection(jdbcUrl, username, password)) {
            System.out.println("数据库连接成功！");
            
            // 检查用户表结构
            checkUserTableStructure(conn);
            
            // 检查用户数据
            checkUserData(conn);
            
            // 检查user_profiles表结构
            checkUserProfilesTableStructure(conn);
            
            // 检查user_profiles数据
            checkUserProfilesData(conn);
            
        } catch (SQLException e) {
            System.err.println("数据库连接失败: " + e.getMessage());
        }
    }
    
    private static void checkUserTableStructure(Connection conn) throws SQLException {
        System.out.println("\n=== 检查用户表结构 ===");
        
        String query = "DESCRIBE users";
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            
            System.out.println("users表字段:");
            while (rs.next()) {
                String field = rs.getString(1);
                String type = rs.getString(2);
                String nullFlag = rs.getString(3);
                String key = rs.getString(4);
                System.out.println(field + " (" + type + ", " + nullFlag + ", " + key + ")");
            }
        }
    }
    
    private static void checkUserData(Connection conn) throws SQLException {
        System.out.println("\n=== 检查用户数据 ===");
        
        String query = "SELECT id, username, email, phone, password, role, status FROM users WHERE deleted = 0";
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            
            System.out.println("用户数据:");
            while (rs.next()) {
                long id = rs.getLong(1);
                String username = rs.getString(2);
                String email = rs.getString(3);
                String phone = rs.getString(4);
                String passwordHash = rs.getString(5);
                String role = rs.getString(6);
                int status = rs.getInt(7);
                
                System.out.println("ID: " + id + ", 用户名: " + username + ", 邮箱: " + email + ", 电话: " + phone + ", 角色: " + role + ", 状态: " + status);
                System.out.println("  密码哈希: " + passwordHash.substring(0, 20) + "...");
            }
        }
    }
    
    private static void checkUserProfilesTableStructure(Connection conn) throws SQLException {
        System.out.println("\n=== 检查user_profiles表结构 ===");
        
        String query = "DESCRIBE user_profiles";
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            
            System.out.println("user_profiles表字段:");
            while (rs.next()) {
                String field = rs.getString(1);
                String type = rs.getString(2);
                String nullFlag = rs.getString(3);
                String key = rs.getString(4);
                System.out.println(field + " (" + type + ", " + nullFlag + ", " + key + ")");
            }
        } catch (SQLException e) {
            System.out.println("user_profiles表可能不存在: " + e.getMessage());
        }
    }
    
    private static void checkUserProfilesData(Connection conn) throws SQLException {
        System.out.println("\n=== 检查user_profiles数据 ===");
        
        String query = "SELECT id, username, email, phone, password, user_type, status FROM user_profiles WHERE deleted = 0";
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            
            System.out.println("user_profiles数据:");
            while (rs.next()) {
                long id = rs.getLong(1);
                String username = rs.getString(2);
                String email = rs.getString(3);
                String phone = rs.getString(4);
                String passwordHash = rs.getString(5);
                String userType = rs.getString(6);
                int status = rs.getInt(7);
                
                System.out.println("ID: " + id + ", 用户名: " + username + ", 邮箱: " + email + ", 电话: " + phone + ", 用户类型: " + userType + ", 状态: " + status);
                System.out.println("  密码哈希: " + passwordHash.substring(0, 20) + "...");
            }
        } catch (SQLException e) {
            System.out.println("查询user_profiles数据失败: " + e.getMessage());
        }
    }
}