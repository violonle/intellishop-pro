package com.shoppro.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT令牌提供器
 * 负责JWT令牌的生成、验证和刷新
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Component
public class JwtTokenProvider {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshTokenExpiration;

    @jakarta.annotation.PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.length() < 64) {
            throw new IllegalStateException("jwt.secret must be configured with at least 64 characters");
        }
    }

    /**
     * 从Authentication生成JWT令牌
     */
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        return generateTokenFromUsername(username);
    }

    /**
     * 从用户名生成JWT令牌
     */
    public String generateTokenFromUsername(String username) {
        return generateTokenFromUsernameWithExpiration(username, jwtExpiration);
    }

    /**
     * 从用户名生成刷新令牌
     */
    public String generateRefreshToken(String username) {
        return generateTokenFromUsernameWithExpiration(username, refreshTokenExpiration);
    }

    /**
     * 生成指定过期时间的令牌
     */
    private String generateTokenFromUsernameWithExpiration(String username, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * 从令牌提取用户名
     */
    public String getUsernameFromToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (JwtException | IllegalArgumentException e) {
            log.error("无法从JWT令牌提取用户名: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 验证JWT令牌
     */
    public boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (SignatureException e) {
            log.error("JWT签名无效: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("JWT格式无效: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT令牌已过期: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT令牌不受支持: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT声明字符串为空: {}", e.getMessage());
        }
        return false;
    }

    /**
     * 验证JWT令牌并抛出异常
     * 用于需要获取具体错误信息的场景
     */
    public void validateTokenThrows(String token) throws JwtException, IllegalArgumentException {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }

    /**
     * 获取令牌过期时间
     */
    public Date getExpirationDateFromToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getExpiration();
        } catch (JwtException | IllegalArgumentException e) {
            log.error("无法从JWT令牌提取过期时间", e);
            return null;
        }
    }

    /**
     * 检查令牌是否已过期
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            return expiration != null && expiration.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * 刷新令牌
     */
    public String refreshToken(String refreshToken) {
        if (!validateToken(refreshToken)) {
            return null;
        }
        String username = getUsernameFromToken(refreshToken);
        if (username == null) {
            return null;
        }
        return generateTokenFromUsername(username);
    }
}
