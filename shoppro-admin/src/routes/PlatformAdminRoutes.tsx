import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLogin from '@/pages/Login/AdminLogin';
import BasicLayout from '@/layouts/BasicLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RoleRoute, PLATFORM_ADMIN_ROLES, PlatformAdminRootRedirect } from './RouteGuards';

import TenantList from '@/pages/Tenancy/TenantList';
import Provision from '@/pages/Tenancy/Provision';
import UserManagement from '@/pages/Tenancy/UserManagement';
import CompanyList from '@/pages/Enterprise/CompanyList';
import EnterpriseDetail from '@/pages/Enterprise/EnterpriseDetail';
import EnterpriseEdit from '@/pages/Enterprise/EnterpriseEdit';
import EnterpriseTeam from '@/pages/Enterprise/EnterpriseTeam';
import Plans from '@/pages/Subscription/Plans';
import PlanEdit from '@/pages/Subscription/PlanEdit';
import Orders from '@/pages/Subscription/Orders';
import DataExport from '@/pages/Data/Export';
import RevenueConfig from '@/pages/Data/RevenueConfig';
import Models from '@/pages/AIModels/Models';
import Versions from '@/pages/AIModels/Versions';
import PromptTemplates from '@/pages/AIModels/PromptTemplates';
import AgentManagement from '@/pages/AIModels/AgentManagement';
import AgentLogs from '@/pages/AIModels/AgentLogs';
import ConversationConfig from '@/pages/AIModels/ConversationConfig';
import SystemNotifications from '@/pages/System/Notifications';
import Logs from '@/pages/System/Logs';
import Admins from '@/pages/System/Admins';
import EnterpriseCertificationPage from '@/pages/Settings/EnterpriseCertification';
import ChannelCode from '@/pages/Marketing/Acquisition/ChannelCode';
import SopManagement from '@/pages/Marketing/Operation/SopManagement';
import AutomationRules from '@/pages/Marketing/Operation/AutomationRules';
import ExecutionAudit from '@/pages/Marketing/Operation/ExecutionAudit';
import SignalEngine from '@/pages/Marketing/Operation/SignalEngine';

const PlatformAdminRoutes: React.FC = () => (
    <Routes>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/login" element={<Navigate to="/admin-login" replace />} />
        <Route path="/" element={<PlatformAdminRootRedirect />} />
        <Route
            path="/*"
            element={
                <ProtectedRoute allowedRoles={PLATFORM_ADMIN_ROLES} unauthorizedPath="/admin-login">
                    <BasicLayout />
                </ProtectedRoute>
            }
        >
            <Route path="tenancy/tenants" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><TenantList /></RoleRoute>} />
            <Route path="tenancy/list" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><TenantList /></RoleRoute>} />
            <Route path="tenancy/provision" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><Provision /></RoleRoute>} />
            <Route path="tenancy/users" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><UserManagement /></RoleRoute>} />

            <Route path="enterprise/companies" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><CompanyList /></RoleRoute>} />
            <Route path="enterprise/list" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><CompanyList /></RoleRoute>} />
            <Route path="enterprise/detail/:id" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><EnterpriseDetail /></RoleRoute>} />
            <Route path="enterprise/edit/:id" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><EnterpriseEdit /></RoleRoute>} />
            <Route path="enterprise/team/:id" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><EnterpriseTeam /></RoleRoute>} />

            <Route path="subscription/plans" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><Plans /></RoleRoute>} />
            <Route path="subscription/plans/edit/:id" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><PlanEdit /></RoleRoute>} />
            <Route path="subscription/orders" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><Orders /></RoleRoute>} />
            <Route path="data/export" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><DataExport /></RoleRoute>} />
            <Route path="data/revenue" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><RevenueConfig /></RoleRoute>} />
            <Route path="data/revenue-config" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><RevenueConfig /></RoleRoute>} />

            <Route path="models" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><Models /></RoleRoute>} />
            <Route path="models/versions" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><Versions /></RoleRoute>} />
            <Route path="models/prompts" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><PromptTemplates /></RoleRoute>} />
            <Route path="models/agents" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><AgentManagement /></RoleRoute>} />
            <Route path="models/agent-logs" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><AgentLogs /></RoleRoute>} />
            <Route path="models/conversation-config" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><ConversationConfig /></RoleRoute>} />
            <Route path="ai/models" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><Models /></RoleRoute>} />
            <Route path="ai/versions" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><Versions /></RoleRoute>} />
            <Route path="ai/prompts" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><PromptTemplates /></RoleRoute>} />
            <Route path="ai/agents" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><AgentManagement /></RoleRoute>} />
            <Route path="ai/agent-logs" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><AgentLogs /></RoleRoute>} />
            <Route path="ai/conversations" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><ConversationConfig /></RoleRoute>} />

            <Route path="marketing/acquisition/channel-code" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><ChannelCode /></RoleRoute>} />
            <Route path="marketing/operation/sop" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><SopManagement /></RoleRoute>} />
            <Route path="marketing/operation/automation" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><AutomationRules /></RoleRoute>} />
            <Route path="marketing/operation/audit" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><ExecutionAudit /></RoleRoute>} />
            <Route path="marketing/operation/signals" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><SignalEngine /></RoleRoute>} />

            <Route path="system/notifications" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><SystemNotifications /></RoleRoute>} />
            <Route path="system/logs" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><Logs /></RoleRoute>} />
            <Route path="system/admins" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><Admins /></RoleRoute>} />
            <Route path="settings/certification" element={<RoleRoute roles={PLATFORM_ADMIN_ROLES}><EnterpriseCertificationPage /></RoleRoute>} />
            <Route path="*" element={<Navigate to="/tenancy/tenants" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin-login" replace />} />
    </Routes>
);

export default PlatformAdminRoutes;
