#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ShopPro AI SCRM - 全链路端到端业务集成测试套件 (E2E Integration Test Suite)
覆盖：用户鉴权、个人资料读写、线索流转、AI智能大脑、销售预测、知识库生态、大模型接入管理、双端反向代理
"""

import sys
import json
import urllib.request
import urllib.error

BACKEND_URL = "http://localhost:8080/api"
ADMIN_URL = "http://localhost:5174"
APP_URL = "http://localhost:5173"

PASS_COUNT = 0
FAIL_COUNT = 0


def log_test(name, success, detail=""):
    global PASS_COUNT, FAIL_COUNT
    if success:
        PASS_COUNT += 1
        print(f"  \033[92m✔ [PASS]\033[0m {name} {detail}")
    else:
        FAIL_COUNT += 1
        print(f"  \033[91m✘ [FAIL]\033[0m {name} {detail}")


def http_request(url, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_body = resp.read().decode("utf-8")
            return resp.status, json.loads(resp_body)
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(resp_body)
        except Exception:
            return e.code, {"raw": resp_body}
    except Exception as e:
        return 0, {"error": str(e)}


def run_e2e_tests():
    print("\n" + "=" * 65)
    print(" 🚀 ShopPro 全链路端到端集成测试开始执行")
    print("=" * 65 + "\n")

    # 1. 认证鉴权测试
    print("▶ 1. 用户认证与鉴权测试")
    status, res = http_request(
        f"{BACKEND_URL}/auth/login",
        method="POST",
        data={"username": "admin", "password": "wrong_password", "sysCode": "ADMIN"}
    )
    is_rejected = res.get("code") == 400 and not res.get("success", True)
    log_test("非法密码拦截测试", is_rejected, f"(Code: {res.get('code')}, Message: {res.get('message')})")

    status, res = http_request(
        f"{BACKEND_URL}/auth/login",
        method="POST",
        data={"username": "admin", "password": "123456", "sysCode": "ADMIN"}
    )
    token = res.get("data", {}).get("accessToken")
    log_test("管理员正常登录并获取 JWT", status == 200 and bool(token), f"(User: {res.get('data', {}).get('username')})")

    if not token:
        print("\n\033[91m[FATAL] 无法获取访问令牌，终止后续测试\033[0m")
        return

    # 2. 用户管理与防 1288 回归测试
    print("\n▶ 2. 用户个人资料与防 1288 回归测试")
    status, res = http_request(
        f"{BACKEND_URL}/users/1",
        method="PUT",
        data={"realName": "系统超级管理员", "phone": "13800000001", "email": "admin@shoppro.com", "role": "admin"},
        token=token
    )
    log_test("修改用户个人资料 (验证物理表与1288修复)", status == 200 and res.get("code") == 200, f"({res.get('message')})")

    status, res = http_request(f"{BACKEND_URL}/users/1", method="GET", token=token)
    user_name = res.get("data", {}).get("realName")
    log_test("查询用户信息回显验证", status == 200 and user_name == "系统超级管理员", f"(RealName: {user_name})")

    # 3. 用户分页列表
    print("\n▶ 3. 用户分页列表测试")
    status, res = http_request(f"{BACKEND_URL}/users/list?pageNo=1&pageSize=5", method="GET", token=token)
    records = res.get("data", {}).get("records", [])
    log_test("用户分页列表数据查询", status == 200 and len(records) > 0, f"(Returned {len(records)} users, Total: {res.get('data', {}).get('total')})")

    # 4. 销售线索全生命周期与智能评级
    print("\n▶ 4. 销售线索与 AI 智能评级")
    status, res = http_request(f"{BACKEND_URL}/ai/leads", method="GET", token=token)
    ai_leads = res.get("data", [])
    log_test("AI 评分线索与潜在价值计算", status == 200 and len(ai_leads) > 0, f"(Score: {ai_leads[0].get('score') if ai_leads else 'N/A'}, Name: {ai_leads[0].get('name') if ai_leads else 'N/A'})")

    # 5. AI 核心微服务接口
    print("\n▶ 5. AI 智能大脑与算法微服务测试")
    status, res = http_request(
        f"{BACKEND_URL}/ai/chat",
        method="POST",
        data={"message": "客户觉得系统价格有点高，该怎么说？"},
        token=token
    )
    reply = res.get("data", "")
    log_test("AI 销售助理智能对话 (异议应对)", status == 200 and "FAB" in reply or len(reply) > 20, f"(Reply length: {len(reply)} chars)")

    status, res = http_request(
        f"{BACKEND_URL}/ai/sales-prediction",
        method="POST",
        data={"quarter": "Q3", "historicalRevenue": 1000000},
        token=token
    )
    pred_data = res.get("data", {})
    log_test("结构化销售业绩预测", status == 200 and "predictedRevenue" in pred_data, f"(Predicted: ¥{pred_data.get('predictedRevenue')}, Growth: {pred_data.get('growthRate') * 100:.1f}%)")

    status, res = http_request(
        f"{BACKEND_URL}/ai/generate-script",
        method="POST",
        data={"industry": "软件服务", "stage": "初次接触"},
        token=token
    )
    script_data = res.get("data", {})
    log_test("场景促成话术生成", status == 200 and len(script_data.get("scripts", [])) > 0, f"(Scene: {script_data.get('scene')})")

    status, res = http_request(
        f"{BACKEND_URL}/ai/customer-profile",
        method="POST",
        data={"company": "未来科技", "budget": "50万"},
        token=token
    )
    profile_data = res.get("data", {})
    log_test("多维客户画像聚类分析", status == 200 and len(profile_data.get("tags", [])) > 0, f"(Tags: {profile_data.get('tags')})")

    # 6. 销售实战知识库生态
    print("\n▶ 6. 销售实战知识库生态测试")
    status, res = http_request(f"{BACKEND_URL}/knowledge/page?pageNo=1&pageSize=5", method="GET", token=token)
    k_records = res.get("data", {}).get("records", [])
    log_test("知识库分页列表读取", status == 200 and len(k_records) >= 5, f"(Found {len(k_records)} seed articles)")

    status, res = http_request(f"{BACKEND_URL}/knowledge/recommendations", method="GET", token=token)
    recs = res.get("data", [])
    log_test("知识库 AI 智能推荐", status == 200 and len(recs) > 0, f"(Top recommendation: {recs[0][:30]}...)")

    status, res = http_request(f"{BACKEND_URL}/knowledge/1/like", method="POST", token=token)
    log_test("知识库文章点赞与互动", status == 200 and res.get("data") is True, "(Like incremented)")

    # 7. 大模型接入管理中心
    print("\n▶ 7. 大模型接入管理与场景调度测试")
    status, res = http_request(f"{BACKEND_URL}/ai-models", method="GET", token=token)
    models = res.get("data", [])
    log_test("大模型接入配置列表查询", status == 200 and len(models) >= 3, f"(Registered models: {len(models)})")

    status, res = http_request(f"{BACKEND_URL}/ai/scenarios/list", method="GET", token=token)
    scenarios = res.get("data", [])
    log_test("7大业务场景模型调度配置", status == 200 and len(scenarios) == 7, f"(Configured scenarios: {len(scenarios)})")

    # 8. 前端 Vite 开发代理连通性
    print("\n▶ 8. 前端反向代理连通性测试")
    status, res = http_request(f"{ADMIN_URL}/api/ai-models", method="GET", token=token)
    log_test("PC 管理端 (:5174) 反向代理通畅性", status == 200 and len(res.get("data", [])) >= 3, "(Port 5174 -> 8080 proxy OK)")

    status, res = http_request(f"{APP_URL}/api/knowledge/page?pageNo=1&pageSize=5", method="GET", token=token)
    log_test("移动端 App (:5173) 反向代理通畅性", status == 200 and len(res.get("data", {}).get("records", [])) >= 5, "(Port 5173 -> 8080 proxy OK)")

    # 9. AI 销售智能体 (Agentic CRM)
    print("\n▶ 9. AI 销售智能体 (Agentic CRM) 自动化测试")
    status, res = http_request(f"{BACKEND_URL}/ai/agents/summary", method="GET", token=token)
    agent_sum = res.get("data", {})
    log_test("智能体概览与活跃度统计", status == 200 and "activeAgentsCount" in agent_sum, f"(Active: {agent_sum.get('activeAgentsCount')} agents)")

    status, res = http_request(f"{BACKEND_URL}/ai/agents/tasks?agentType=all&status=all", method="GET", token=token)
    tasks = res.get("data", [])
    log_test("智能体自主生成任务流水线查询", status == 200 and len(tasks) >= 3, f"(Found {len(tasks)} agent tasks)")

    status, res = http_request(f"{BACKEND_URL}/ai/agents/tasks/1/confirm", method="POST", token=token)
    log_test("销售审阅确认并执行 Agent 首触方案", status == 200 and res.get("data") is True, "(Task #1 confirmed)")

    # 10. 会话智能与实时辅导
    print("\n▶ 10. 会话智能与实时通话耳语辅导测试")
    status, res = http_request(f"{BACKEND_URL}/ai/conversations", method="GET", token=token)
    convs = res.get("data", [])
    log_test("会话沟通记录与情绪指数查询", status == 200 and len(convs) >= 2, f"(Found {len(convs)} conversation records, Top Sentiment: {convs[0].get('sentiment')})")

    status, res = http_request(
        f"{BACKEND_URL}/ai/coaching/advice",
        method="POST",
        data={"customerId": 1, "keywords": "价格太高"},
        token=token
    )
    advice_data = res.get("data", {})
    log_test("毫秒级实时通话耳语辅导话术生成", status == 200 and "suggestedResponse" in advice_data, f"(Scenario: {advice_data.get('scenario')})")

    # 11. 收入运营引擎
    print("\n▶ 11. 收入运营与销售管道健康度分析测试")
    status, res = http_request(f"{BACKEND_URL}/ai/revenue/dashboard", method="GET", token=token)
    dash = res.get("data", {})
    log_test("收入运营核心指标与动态胜率测算", status == 200 and "predictedQuarterRevenue" in dash, f"(Predicted: ¥{dash.get('predictedQuarterRevenue')}, WinRate: {dash.get('winRate') * 100:.1f}%)")

    status, res = http_request(f"{BACKEND_URL}/ai/revenue/pipeline", method="GET", token=token)
    pipe = res.get("data", {})
    log_test("销售漏斗全流程流速与卡单热力图", status == 200 and len(pipe.get("stages", [])) >= 5, f"(Bottleneck: {pipe.get('bottleneckStage')})")

    # 12. 智能信号流与触发引擎
    print("\n▶ 12. 智能信号流中心与自动化触发规则测试")
    status, res = http_request(f"{BACKEND_URL}/ai/signals", method="GET", token=token)
    signals = res.get("data", [])
    log_test("多维客户行为信号捕获流水线", status == 200 and len(signals) >= 3, f"(Found {len(signals)} real-time signals)")

    status, res = http_request(f"{BACKEND_URL}/ai/signals/1/handle", method="POST", token=token)
    log_test("销售响应并完成信号处理动作", status == 200 and res.get("data") is True, "(Signal #1 handled)")

    status, res = http_request(f"{BACKEND_URL}/ai/trigger-rules", method="GET", token=token)
    rules = res.get("data", [])
    log_test("自动化触发规则链配置查询", status == 200 and len(rules) >= 2, f"(Registered {len(rules)} trigger rules)")

    # 总结汇报
    print("\n" + "=" * 65)
    total = PASS_COUNT + FAIL_COUNT
    if FAIL_COUNT == 0:
        print(f" 🎯 测试总结: 共执行 {total} 项测试，\033[92m全部 {PASS_COUNT} 项测试 100% 通过！\033[0m")
    else:
        print(f" ⚠️ 测试总结: 共执行 {total} 项测试，{PASS_COUNT} 通过，\033[91m{FAIL_COUNT} 失败\033[0m")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    run_e2e_tests()
