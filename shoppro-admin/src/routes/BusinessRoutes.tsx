import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Onboarding from '@/pages/Onboarding';
import BasicLayout from '@/layouts/BasicLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getToken } from '@/utils/storage';
import { RoleRoute, BusinessRootRedirect } from './RouteGuards';

import Dashboard from '@/pages/Dashboard';
import LeadsPage from '@/pages/Leads';
import LeadDetailPage from '@/pages/Leads/LeadDetail';
import CreateLeadPage from '@/pages/Leads/CreateLead';
import CustomersPage from '@/pages/Customers';
import CustomerDetailPage from '@/pages/Customers/CustomerDetail';
import TagManagementPage from '@/pages/Customers/TagManagement';
import TasksPage from '@/pages/Tasks';
import DealsPage from '@/pages/Deals';
import DealDetailPage from '@/pages/Deals/DealDetail';

import AnalyticsOverviewPage from '@/pages/Analytics/Overview';
import FunnelAnalysisPage from '@/pages/Analytics/FunnelAnalysis';
import PipelineHealthPage from '@/pages/Analytics/PipelineHealth';
import SalesBehaviorPage from '@/pages/Analytics/SalesBehavior';
import TeamPerformancePage from '@/pages/Analytics/TeamPerformance';
import RiskAnalysisPage from '@/pages/Analytics/RiskAnalysis';
import CustomBIPage from '@/pages/Analytics/CustomBI';

import LeadsAgentPage from '@/pages/Agents/LeadsAgent';
import CustomerAgentPage from '@/pages/Agents/CustomerAgent';
import CoachAgentPage from '@/pages/Agents/CoachAgent';
import MarketingAgentPage from '@/pages/Agents/MarketingAgent';
import RevenueAgentPage from '@/pages/Agents/RevenueAgent';

import FissionPage from '@/pages/Acquisition/Fission';
import WelcomeMessagePage from '@/pages/Acquisition/WelcomeMessage';
import ProductDetailPage from '@/pages/Products/ProductDetail';
import ProfileEditPage from '@/pages/Profile/ProfileEdit';
import WorkLogPage from '@/pages/Profile/WorkLog';
import MyPerformancePage from '@/pages/Profile/Performance';
import EnterpriseCertificationPage from '@/pages/Settings/EnterpriseCertification';
import NotificationsPage from '@/pages/Notifications';
import HelpCenterPage from '@/pages/Help';
import StateSpecsPage from '@/pages/StateSpecs';

import EnterpriseInfo from '@/pages/Enterprise/Info';
import TeamManagement from '@/pages/Enterprise/Team';
import ProductList from '@/pages/Enterprise/Product';
import ProductAdd from '@/pages/Enterprise/ProductAdd';
import ProductEdit from '@/pages/Enterprise/ProductEdit';
import EnterpriseDetail from '@/pages/Enterprise/EnterpriseDetail';
import EnterpriseEdit from '@/pages/Enterprise/EnterpriseEdit';
import EnterpriseTeam from '@/pages/Enterprise/EnterpriseTeam';
import DataExport from '@/pages/Data/Export';
import RevenueConfig from '@/pages/Data/RevenueConfig';
import ChannelCode from '@/pages/Marketing/Acquisition/ChannelCode';
import SopManagement from '@/pages/Marketing/Operation/SopManagement';
import AutomationRules from '@/pages/Marketing/Operation/AutomationRules';
import ExecutionAudit from '@/pages/Marketing/Operation/ExecutionAudit';
import SignalEngine from '@/pages/Marketing/Operation/SignalEngine';
import Models from '@/pages/AIModels/Models';
import PromptTemplates from '@/pages/AIModels/PromptTemplates';
import AgentManagement from '@/pages/AIModels/AgentManagement';
import AgentLogs from '@/pages/AIModels/AgentLogs';
import ConversationConfig from '@/pages/AIModels/ConversationConfig';

const BusinessRedirect: React.FC = () => {
    if (!getToken()) return <Navigate to="/login" replace />;
    return <BusinessRootRedirect />;
};

const BUSINESS_MANAGER_ROLES = ['admin', 'super_admin', 'platform_admin', 'enterprise_admin', 'manager', 'sales_director', 'sales_manager'];
const BUSINESS_AI_ROLES = ['admin', 'super_admin', 'platform_admin', 'enterprise_admin'];

const BusinessRoutes: React.FC = () => (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<BusinessRedirect />} />
        <Route
            path="/*"
            element={
                <ProtectedRoute>
                    <BasicLayout />
                </ProtectedRoute>
            }
        >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="leads/detail" element={<LeadDetailPage />} />
            <Route path="leads/create" element={<CreateLeadPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/detail" element={<CustomerDetailPage />} />
            <Route path="customers/tags" element={<TagManagementPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="deals/detail" element={<DealDetailPage />} />

            <Route path="analytics" element={<Navigate to="/analytics/overview" replace />} />
            <Route path="analytics/overview" element={<AnalyticsOverviewPage />} />
            <Route path="analytics/funnel" element={<FunnelAnalysisPage />} />
            <Route path="analytics/health" element={<PipelineHealthPage />} />
            <Route path="analytics/behavior" element={<SalesBehaviorPage />} />
            <Route path="analytics/team" element={<TeamPerformancePage />} />
            <Route path="analytics/risk" element={<RiskAnalysisPage />} />
            <Route path="analytics/custom-bi" element={<CustomBIPage />} />

            <Route path="agents/leads" element={<LeadsAgentPage />} />
            <Route path="agents/customer" element={<CustomerAgentPage />} />
            <Route path="agents/coach" element={<CoachAgentPage />} />
            <Route path="agents/marketing" element={<MarketingAgentPage />} />
            <Route path="agents/revenue" element={<RevenueAgentPage />} />
            <Route path="acquisition/fission" element={<FissionPage />} />
            <Route path="acquisition/welcome" element={<WelcomeMessagePage />} />
            <Route path="products" element={<ProductDetailPage />} />

            <Route path="profile/edit" element={<ProfileEditPage />} />
            <Route path="profile/worklog" element={<WorkLogPage />} />
            <Route path="profile/performance" element={<MyPerformancePage />} />
            <Route path="settings/certification" element={<EnterpriseCertificationPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="help" element={<HelpCenterPage />} />
            <Route path="state-specs" element={<StateSpecsPage />} />

            <Route path="enterprise/detail/:id" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><EnterpriseDetail /></RoleRoute>} />
            <Route path="enterprise/edit/:id" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><EnterpriseEdit /></RoleRoute>} />
            <Route path="enterprise/team/:id" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><EnterpriseTeam /></RoleRoute>} />
            <Route path="enterprise/info" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><EnterpriseInfo /></RoleRoute>} />
            <Route path="enterprise/team" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><TeamManagement /></RoleRoute>} />
            <Route path="enterprise/products" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><ProductList /></RoleRoute>} />
            <Route path="enterprise/product" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><ProductList /></RoleRoute>} />
            <Route path="enterprise/product/add" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><ProductAdd /></RoleRoute>} />
            <Route path="enterprise/product/edit/:id" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><ProductEdit /></RoleRoute>} />

            <Route path="data/export" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><DataExport /></RoleRoute>} />
            <Route path="data/revenue" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><RevenueConfig /></RoleRoute>} />
            <Route path="data/revenue-config" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><RevenueConfig /></RoleRoute>} />
            <Route path="marketing/acquisition/channels" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><ChannelCode /></RoleRoute>} />
            <Route path="marketing/acquisition/channel-code" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><ChannelCode /></RoleRoute>} />
            <Route path="marketing/acquisition/welcome" element={<WelcomeMessagePage />} />
            <Route path="marketing/operation/sop" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><SopManagement /></RoleRoute>} />
            <Route path="marketing/operation/rules" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><AutomationRules /></RoleRoute>} />
            <Route path="marketing/operation/automation" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><AutomationRules /></RoleRoute>} />
            <Route path="marketing/operation/audit" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><ExecutionAudit /></RoleRoute>} />
            <Route path="marketing/operation/signals" element={<RoleRoute roles={BUSINESS_MANAGER_ROLES}><SignalEngine /></RoleRoute>} />

            <Route path="models" element={<RoleRoute roles={BUSINESS_AI_ROLES}><Models /></RoleRoute>} />
            <Route path="models/prompts" element={<RoleRoute roles={BUSINESS_AI_ROLES}><PromptTemplates /></RoleRoute>} />
            <Route path="models/agents" element={<RoleRoute roles={BUSINESS_AI_ROLES}><AgentManagement /></RoleRoute>} />
            <Route path="models/agent-logs" element={<RoleRoute roles={BUSINESS_AI_ROLES}><AgentLogs /></RoleRoute>} />
            <Route path="models/conversation-config" element={<RoleRoute roles={BUSINESS_AI_ROLES}><ConversationConfig /></RoleRoute>} />
            <Route path="ai/models" element={<RoleRoute roles={BUSINESS_AI_ROLES}><Models /></RoleRoute>} />
            <Route path="ai/prompts" element={<RoleRoute roles={BUSINESS_AI_ROLES}><PromptTemplates /></RoleRoute>} />
            <Route path="ai/agents" element={<RoleRoute roles={BUSINESS_AI_ROLES}><AgentManagement /></RoleRoute>} />
            <Route path="ai/agent-logs" element={<RoleRoute roles={BUSINESS_AI_ROLES}><AgentLogs /></RoleRoute>} />
            <Route path="ai/conversations" element={<RoleRoute roles={BUSINESS_AI_ROLES}><ConversationConfig /></RoleRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
);

export default BusinessRoutes;
