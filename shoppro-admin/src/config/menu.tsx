import React from 'react';
import type { MenuProps } from 'antd';
import {
    LayoutDashboard,
    UserCheck,
    Users,
    CheckSquare,
    ShoppingBag,
    BarChart3,
    Target,
    Bot,
    Activity,
    Eye,
    GraduationCap,
    Send,
    TrendingUp,
    BookOpen,
    MessageSquareText,
    Boxes,
    Share2,
    Workflow,
    Settings,
    Building2,
    Cpu,
    CreditCard,
    ShieldCheck,
    Layers,
    FileCode,
    ScrollText,
    Download
} from 'lucide-react';
import { getSalesAgentLabel, getSalesAgentTooltip } from '@/config/salesAgents';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group'
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
        type,
    } as MenuItem;
}

// 1. 【PC 端业务主站】菜单（专门给客户企业的销售人员、销售经理、业务人员使用）
export const businessMenuItems: MenuItem[] = [
    getItem('销售业务工作台', 'grp-sales-workbench', null, [
        getItem('数据概览大盘', '/dashboard', <LayoutDashboard className="w-4 h-4 text-blue-600" />),
        getItem('销售线索中心', '/leads', <UserCheck className="w-4 h-4 text-blue-500" />),
        getItem('客户 360° 档案', '/customers', <Users className="w-4 h-4 text-cyan-600" />),
        getItem('SOP 跟进待办', '/tasks', <CheckSquare className="w-4 h-4 text-emerald-600" />),
        getItem('商机与成单转化', '/deals', <ShoppingBag className="w-4 h-4 text-amber-500" />),
        getItem('全域数据分析看板', '/analytics', <BarChart3 className="w-4 h-4 text-indigo-500" />, [
            getItem('数据概览', '/analytics/overview'),
            getItem('销售漏斗分析', '/analytics/funnel'),
            getItem('管道健康度', '/analytics/pipeline'),
            getItem('销售行为分析', '/analytics/behavior'),
            getItem('团队业绩分析', '/analytics/team'),
            getItem('销售风险分析', '/analytics/risk'),
            getItem('高级多维分析', '/analytics/custom'),
        ]),
    ], 'group'),

    getItem('AI 销售智能体', 'grp-sales-agents', null, [
        getItem(<span title={getSalesAgentTooltip('sdr')}>{getSalesAgentLabel('sdr')}</span>, '/agents/leads', <Target className="w-4 h-4 text-blue-500" />),
        getItem(<span title={getSalesAgentTooltip('customer')}>{getSalesAgentLabel('customer')}</span>, '/agents/customer', <Eye className="w-4 h-4 text-cyan-500" />),
        getItem(<span title={getSalesAgentTooltip('coach')}>{getSalesAgentLabel('coach')}</span>, '/agents/coach', <GraduationCap className="w-4 h-4 text-indigo-500" />),
        getItem(<span title={getSalesAgentTooltip('marketing')}>{getSalesAgentLabel('marketing')}</span>, '/agents/marketing', <Send className="w-4 h-4 text-amber-500" />),
        getItem(<span title={getSalesAgentTooltip('revenue')}>{getSalesAgentLabel('revenue')}</span>, '/agents/revenue', <TrendingUp className="w-4 h-4 text-emerald-500" />),
    ], 'group'),

    getItem('销售赋能工具', 'grp-sales-tools', null, [
        getItem('知识库中心', '/knowledge', <BookOpen className="w-4 h-4 text-slate-600" />),
        getItem('营销话术库', '/scripts', <MessageSquareText className="w-4 h-4 text-slate-600" />),
        getItem('产品方案目录', '/products', <Boxes className="w-4 h-4 text-slate-600" />),
        getItem('全域获客裂变', '/acquisition/fission', <Share2 className="w-4 h-4 text-slate-600" />),
    ], 'group'),
];

// 2. 【超级管理员后台管理平台】菜单（专门给本公司超级管理员使用，管控全平台租户/模型/计费）
export const superAdminMenuItems: MenuItem[] = [
    getItem('多租户与组织管理', 'grp-tenancy', null, [
        getItem('租户管理列表', '/tenancy/tenants', <Layers className="w-4 h-4 text-blue-600" />),
        getItem('租户开通与初始化', '/tenancy/provision', <Building2 className="w-4 h-4 text-blue-500" />),
        getItem('全平台用户管理', '/tenancy/users', <Users className="w-4 h-4 text-slate-600" />),
        getItem('企业公司入驻管理', '/enterprise/companies', <Building2 className="w-4 h-4 text-cyan-600" />),
        getItem('企业组织与团队架构', '/enterprise/team', <Users className="w-4 h-4 text-indigo-600" />),
        getItem('企业标准化产品库', '/enterprise/products', <Boxes className="w-4 h-4 text-amber-600" />),
    ], 'group'),

    getItem('AI 模型与 Agent 基础设施', 'grp-models', null, [
        getItem('AI 模型网关接入', '/models', <Cpu className="w-4 h-4 text-violet-600" />),
        getItem('模型版本与路由控制', '/models/versions', <Layers className="w-4 h-4 text-violet-500" />),
        getItem('Prompt 提示词模板库', '/models/prompts', <FileCode className="w-4 h-4 text-indigo-500" />),
        getItem('Agent 智能体编排与管控', '/models/agents', <Bot className="w-4 h-4 text-blue-600" />),
        getItem('Agent 调用与消耗日志', '/models/agent-logs', <ScrollText className="w-4 h-4 text-slate-500" />),
        getItem('对话流规则与状态机', '/models/conversation-config', <Workflow className="w-4 h-4 text-cyan-600" />),
    ], 'group'),

    getItem('SaaS 订阅与财务计费', 'grp-subscription', null, [
        getItem('SaaS 订阅套餐方案', '/subscription/plans', <CreditCard className="w-4 h-4 text-emerald-600" />),
        getItem('客户订阅与续费订单', '/subscription/orders', <ShoppingBag className="w-4 h-4 text-emerald-500" />),
        getItem('营收核算与抽佣规则', '/data/revenue-config', <TrendingUp className="w-4 h-4 text-amber-600" />),
        getItem('平台数据资产导出', '/data/export', <Download className="w-4 h-4 text-slate-600" />),
    ], 'group'),

    getItem('SOP 流程与营销引擎配置', 'grp-marketing-ops', null, [
        getItem('SOP 流程规则配置', '/marketing/operation/sop', <Workflow className="w-4 h-4 text-blue-600" />),
        getItem('自动化规则策略', '/marketing/operation/automation', <Workflow className="w-4 h-4 text-emerald-600" />),
        getItem('客户行为信号雷达', '/marketing/operation/signals', <Activity className="w-4 h-4 text-amber-500" />),
        getItem('流程执行审计与监控', '/marketing/operation/audit', <ScrollText className="w-4 h-4 text-slate-500" />),
        getItem('全域渠道活码引擎', '/marketing/acquisition/channel-code', <Share2 className="w-4 h-4 text-indigo-500" />),
    ], 'group'),

    getItem('平台超管运维与安全审计', 'grp-system', null, [
        getItem('系统超级管理员权限', '/system/admins', <ShieldCheck className="w-4 h-4 text-rose-600" />),
        getItem('全系统操作审计日志', '/system/logs', <ScrollText className="w-4 h-4 text-slate-500" />),
        getItem('全平台系统公告推送', '/system/notifications', <Send className="w-4 h-4 text-blue-500" />),
        getItem('企业主体资质认证审核', '/settings/certification', <ShieldCheck className="w-4 h-4 text-emerald-600" />),
    ], 'group'),
];

// 根据用户角色返回对应菜单（销售人员严禁看到超管菜单，超管则展示平台超管菜单）
export const getMenuByRole = (role?: string): MenuItem[] => {
    const r = (role || '').toLowerCase();
    if (r === 'admin' || r === 'super_admin' || r === 'platform_admin') {
        return superAdminMenuItems;
    }
    return businessMenuItems;
};

export const menuItems = businessMenuItems;
export default menuItems;
