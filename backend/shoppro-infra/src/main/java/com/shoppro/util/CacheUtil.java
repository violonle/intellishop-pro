package com.shoppro.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Redis缓存工具类
 * 提供Redis缓存操作的便利方法
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Component
public class CacheUtil {

    private static final Logger log = LoggerFactory.getLogger(CacheUtil.class);

    private final RedisTemplate<String, Object> redisTemplate;

    public CacheUtil(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * 设置缓存
     *
     * @param key   缓存键
     * @param value 缓存值
     */
    public void set(String key, Object value) {
        try {
            redisTemplate.opsForValue().set(key, value);
        } catch (Exception e) {
            log.error("设置缓存失败: key={}, e={}", key, e.getMessage());
        }
    }

    /**
     * 设置缓存并指定过期时间
     *
     * @param key      缓存键
     * @param value    缓存值
     * @param timeout  过期时间
     * @param timeUnit 时间单位
     */
    public void setWithExpire(String key, Object value, long timeout, TimeUnit timeUnit) {
        try {
            redisTemplate.opsForValue().set(key, value, timeout, timeUnit);
        } catch (Exception e) {
            log.error("设置缓存失败: key={}, timeout={}, unit={}, e={}", key, timeout, timeUnit, e.getMessage());
        }
    }

    /**
     * 获取缓存
     *
     * @param key 缓存键
     * @return 缓存值
     */
    public Object get(String key) {
        try {
            return redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.error("获取缓存失败: key={}, e={}", key, e.getMessage());
            return null;
        }
    }

    /**
     * 获取缓存并转换为指定类型
     *
     * @param key   缓存键
     * @param clazz 目标类型
     * @return 缓存值
     */
    public <T> T get(String key, Class<T> clazz) {
        try {
            Object obj = redisTemplate.opsForValue().get(key);
            if (obj == null) {
                return null;
            }
            if (clazz.isInstance(obj)) {
                return clazz.cast(obj);
            }
            return null;
        } catch (Exception e) {
            log.error("获取缓存失败: key={}, class={}, e={}", key, clazz.getName(), e.getMessage());
            return null;
        }
    }

    /**
     * 删除缓存
     *
     * @param key 缓存键
     */
    public void delete(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error("删除缓存失败: key={}, e={}", key, e.getMessage());
        }
    }

    /**
     * 删除多个缓存
     *
     * @param keys 缓存键集合
     */
    public void deleteMultiple(Collection<String> keys) {
        try {
            redisTemplate.delete(keys);
        } catch (Exception e) {
            log.error("删除缓存失败: keys={}, e={}", keys, e.getMessage());
        }
    }

    /**
     * 检查缓存是否存在
     *
     * @param key 缓存键
     * @return 是否存在
     */
    public Boolean exists(String key) {
        try {
            return redisTemplate.hasKey(key);
        } catch (Exception e) {
            log.error("检查缓存失败: key={}, e={}", key, e.getMessage());
            return false;
        }
    }

    /**
     * 获取缓存过期时间
     *
     * @param key 缓存键
     * @return 过期时间（秒），-1表示永不过期，-2表示键不存在
     */
    public Long getExpire(String key) {
        try {
            return redisTemplate.getExpire(key, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("获取缓存过期时间失败: key={}, e={}", key, e.getMessage());
            return -2L;
        }
    }

    /**
     * 设置缓存过期时间
     *
     * @param key      缓存键
     * @param timeout  过期时间
     * @param timeUnit 时间单位
     */
    public Boolean expire(String key, long timeout, TimeUnit timeUnit) {
        try {
            return redisTemplate.expire(key, timeout, timeUnit);
        } catch (Exception e) {
            log.error("设置缓存过期时间失败: key={}, timeout={}, unit={}, e={}", key, timeout, timeUnit, e.getMessage());
            return false;
        }
    }

    /**
     * 增加计数器
     *
     * @param key   缓存键
     * @param delta 增加量
     * @return 增加后的值
     */
    public Long increment(String key, long delta) {
        try {
            return redisTemplate.opsForValue().increment(key, delta);
        } catch (Exception e) {
            log.error("增加计数失败: key={}, delta={}, e={}", key, delta, e.getMessage());
            return null;
        }
    }

    /**
     * 减少计数器
     *
     * @param key   缓存键
     * @param delta 减少量
     * @return 减少后的值
     */
    public Long decrement(String key, long delta) {
        try {
            return redisTemplate.opsForValue().decrement(key, delta);
        } catch (Exception e) {
            log.error("减少计数失败: key={}, delta={}, e={}", key, delta, e.getMessage());
            return null;
        }
    }

    /**
     * 设置Hash字段
     *
     * @param key   缓存键
     * @param field 字段名
     * @param value 字段值
     */
    public void hSet(String key, String field, Object value) {
        try {
            redisTemplate.opsForHash().put(key, field, value);
        } catch (Exception e) {
            log.error("设置Hash字段失败: key={}, field={}, e={}", key, field, e.getMessage());
        }
    }

    /**
     * 获取Hash字段
     *
     * @param key   缓存键
     * @param field 字段名
     * @return 字段值
     */
    public Object hGet(String key, String field) {
        try {
            return redisTemplate.opsForHash().get(key, field);
        } catch (Exception e) {
            log.error("获取Hash字段失败: key={}, field={}, e={}", key, field, e.getMessage());
            return null;
        }
    }

    /**
     * 获取Hash中所有字段和值
     *
     * @param key 缓存键
     * @return 字段值映射
     */
    public Map<Object, Object> hGetAll(String key) {
        try {
            return redisTemplate.opsForHash().entries(key);
        } catch (Exception e) {
            log.error("获取Hash所有字段失败: key={}, e={}", key, e.getMessage());
            return Map.of();
        }
    }

    /**
     * 删除Hash字段
     *
     * @param key    缓存键
     * @param fields 字段名集合
     */
    public void hDelete(String key, String... fields) {
        try {
            redisTemplate.opsForHash().delete(key, (Object[]) fields);
        } catch (Exception e) {
            log.error("删除Hash字段失败: key={}, fields={}, e={}", key, fields, e.getMessage());
        }
    }

    /**
     * 向Set中添加成员
     *
     * @param key    缓存键
     * @param values 成员值集合
     */
    public void sAdd(String key, Object... values) {
        try {
            redisTemplate.opsForSet().add(key, values);
        } catch (Exception e) {
            log.error("向Set添加成员失败: key={}, e={}", key, e.getMessage());
        }
    }

    /**
     * 从Set中获取所有成员
     *
     * @param key 缓存键
     * @return 成员集合
     */
    public Set<Object> sMembers(String key) {
        try {
            return redisTemplate.opsForSet().members(key);
        } catch (Exception e) {
            log.error("获取Set所有成员失败: key={}, e={}", key, e.getMessage());
            return Set.of();
        }
    }

    /**
     * 从Set中删除成员
     *
     * @param key    缓存键
     * @param values 成员值集合
     */
    public void sRemove(String key, Object... values) {
        try {
            redisTemplate.opsForSet().remove(key, values);
        } catch (Exception e) {
            log.error("从Set删除成员失败: key={}, e={}", key, e.getMessage());
        }
    }

    /**
     * 向List中推入元素
     *
     * @param key    缓存键
     * @param values 元素值集合
     */
    public void lPush(String key, Object... values) {
        try {
            redisTemplate.opsForList().rightPushAll(key, values);
        } catch (Exception e) {
            log.error("向List推入元素失败: key={}, e={}", key, e.getMessage());
        }
    }

    /**
     * 从List中获取指定范围的元素
     *
     * @param key   缓存键
     * @param start 开始位置
     * @param end   结束位置
     * @return 元素列表
     */
    public List<Object> lRange(String key, long start, long end) {
        try {
            return redisTemplate.opsForList().range(key, start, end);
        } catch (Exception e) {
            log.error("从List获取元素失败: key={}, e={}", key, e.getMessage());
            return List.of();
        }
    }

    /**
     * 删除所有缓存（谨慎使用）
     */
    public void flushAll() {
        try {
            redisTemplate.execute((RedisCallback<Object>) connection -> {
                connection.flushAll();
                return null;
            });
        } catch (Exception e) {
            log.error("清空所有缓存失败: e={}", e.getMessage());
        }
    }

    /**
     * 获取缓存键匹配的所有键
     *
     * @param pattern 键模式（支持通配符 *）
     * @return 匹配的键集合
     */
    public Set<String> getKeys(String pattern) {
        try {
            return redisTemplate.keys(pattern);
        } catch (Exception e) {
            log.error("获取缓存键失败: pattern={}, e={}", pattern, e.getMessage());
            return Set.of();
        }
    }

}
