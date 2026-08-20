import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Login/Register';
import PhoneLogin from './pages/Login/PhoneLogin';
import Verification from './pages/Login/Verification';
import Dashboard from './pages/Dashboard/Dashboard';
import LeadList from './pages/Leads/LeadList';
import LeadDetail from './pages/Leads/LeadDetail';
import LeadForm from './pages/Leads/LeadForm';
import CustomerList from './pages/Customers/CustomerList';
import CustomerDetail from './pages/Customers/CustomerDetail';
import CustomerForm from './pages/Customers/CustomerForm';
import ProductList from './pages/Products/ProductList';
import ProductDetail from './pages/Products/ProductDetail';
import ProductCatalog from './pages/Products/ProductCatalog';
import ProductConfig from './pages/Products/ProductConfig';
import ProductAdd from './pages/Products/ProductAdd';
import ProductImageGallery from './pages/Products/ProductImageGallery';
import KnowledgeBase from './pages/Knowledge/KnowledgeBase';
import KnowledgeDetail from './pages/Knowledge/KnowledgeDetail';
import AIScripts from './pages/AI/AIScripts';
import AIBrain from './pages/AI/AIBrain';
import AIPersona from './pages/AI/AIPersona';
import AIPersonaDetail from './pages/AI/AIPersonaDetail';
import AIPersonaAnalysis from './pages/AI/AIPersonaAnalysis';
import AILeads from './pages/AI/AILeads';
import AILeadDetail from './pages/AI/AILeadDetail';
import AILeadPrediction from './pages/AI/AILeadPrediction';
import AIAlerts from './pages/AI/AIAlerts';
import AIChat from './pages/AI/AIChat';
import AIAgents from './pages/AI/AIAgents';
import AIAgentTask from './pages/AI/AIAgentTask';
import AIConversations from './pages/AI/AIConversations';
import AIConversationDetail from './pages/AI/AIConversationDetail';
import AICoaching from './pages/AI/AICoaching';
import AISignals from './pages/AI/AISignals';
import AISignalDetail from './pages/AI/AISignalDetail';
import RevenueIntelligence from './pages/Analytics/RevenueIntelligence';
import PipelineHealth from './pages/Analytics/PipelineHealth';
import DealInspector from './pages/Analytics/DealInspector';
import Settings from './pages/System/Settings';
import Profile from './pages/System/Profile';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import AdvancedAnalytics from './pages/Analytics/AdvancedAnalytics';
import MarketingAutomation from './pages/Marketing/MarketingAutomation';
import SalesManagement from './pages/Sales/SalesManagement';
import SalesDetail from './pages/Sales/SalesDetail';
import SalesBehavior from './pages/Sales/SalesBehavior';
import LeadAssign from './pages/Leads/LeadAssign';
import FollowUpAction from './pages/Leads/FollowUpAction';
import Onboarding from './pages/System/Onboarding';
import Notifications from './pages/System/Notifications';
import HelpCenter from './pages/System/HelpCenter';
import Maintenance from './pages/System/Maintenance';
import Splash from './pages/System/Splash';
import PermissionsTest from './pages/System/PermissionsTest';
import './index.css';
import ProfileEdit from './pages/System/ProfileEdit';
import WorkLog from './pages/System/WorkLog';
import TeamManagement from './pages/System/TeamManagement';
import PerformanceReport from './pages/System/PerformanceReport';
import PrivacyPolicy from './pages/System/PrivacyPolicy';
import ShareApp from './pages/System/ShareApp';
import Support from './pages/System/Support';
import SalesTeamAnalysis from './pages/Analytics/SalesTeamAnalysis';
import RiskAnalysis from './pages/Analytics/RiskAnalysis';
import FunnelAnalysis from './pages/Analytics/FunnelAnalysis';
import TagDetail from './pages/Tags/TagDetail';
import LeadConversion from './pages/Leads/LeadConversion';
import EnterpriseSettings from './pages/System/EnterpriseSettings';
import EnterpriseCertification from './pages/System/EnterpriseCertification';
import ChannelCodeList from './pages/Acquisition/ChannelCodeList';
import WelcomeMessageConfig from './pages/Acquisition/WelcomeMessageConfig';
import FissionToolList from './pages/Acquisition/FissionToolList';
import ChannelQRDetail from './pages/Acquisition/ChannelQRDetail';
import SopManagement from './pages/Operation/SopManagement';
import TaskList from './pages/Operation/TaskList';

// ... imports
import MobileLayout from './components/layout/MobileLayout';
import AuthGuard from './components/layout/AuthGuard';

// Routes configuration
function App() {
  return (
    <Router>
      <Routes>
        {/* Standalone Pages (No Bottom Nav, Full Screen) */}
        <Route path="/splash" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login/phone" element={<PhoneLogin />} />
        <Route path="/register/phone" element={<PhoneLogin />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/maintenance" element={<Maintenance />} />

        {/* Main App with Bottom Nav - Protected */}
        <Route element={
          <AuthGuard>
            <MobileLayout />
          </AuthGuard>
        }>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* System Pages */}
          <Route path="/permissions-test" element={<PermissionsTest />} />

          {/* Leads Module */}
          <Route path="/leads" element={<LeadList />} />
          <Route path="/leads/new" element={<LeadForm />} />
          <Route path="/leads/assign" element={<LeadAssign />} />
          <Route path="/leads/follow-up" element={<FollowUpAction />} />
          <Route path="/leads/:id" element={<LeadDetail />} />

          {/* Customers Module */}
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />

          {/* Products Module */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/add" element={<ProductAdd />} />
          <Route path="/products/gallery" element={<ProductImageGallery />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/config" element={<ProductConfig />} />
          <Route path="/catalog" element={<ProductCatalog />} />

          {/* Knowledge Module */}
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/knowledge/:id" element={<KnowledgeDetail />} />

          {/* AI Module */}
          <Route path="/ai/scripts" element={<AIScripts />} />
          <Route path="/ai/brain" element={<AIBrain />} />
          <Route path="/ai/persona" element={<AIPersona />} />
          <Route path="/ai/persona/:id" element={<AIPersonaDetail />} />
          <Route path="/ai/persona/:id/analysis" element={<AIPersonaAnalysis />} />
          <Route path="/ai/leads" element={<AILeads />} />
          <Route path="/ai/leads/:id" element={<AILeadDetail />} />
          <Route path="/ai/leads/prediction/:id" element={<AILeadPrediction />} />
          <Route path="/leads/conversion/:id" element={<LeadConversion />} />
          <Route path="/ai/alerts" element={<AIAlerts />} />
          <Route path="/ai/chat" element={<AIChat />} />

          {/* AI Strategic Enhancements */}
          <Route path="/ai/agents" element={<AIAgents />} />
          <Route path="/ai/agents/task/:id" element={<AIAgentTask />} />
          <Route path="/ai/conversations" element={<AIConversations />} />
          <Route path="/ai/conversations/:id" element={<AIConversationDetail />} />
          <Route path="/ai/coaching" element={<AICoaching />} />
          <Route path="/ai/signals" element={<AISignals />} />
          <Route path="/ai/signals/:id" element={<AISignalDetail />} />
          <Route path="/analytics/revenue" element={<RevenueIntelligence />} />
          <Route path="/analytics/pipeline" element={<PipelineHealth />} />
          <Route path="/analytics/deals/:id" element={<DealInspector />} />

          {/* System Module */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/profile/work-log" element={<WorkLog />} />
          <Route path="/profile/team" element={<TeamManagement />} />
          <Route path="/profile/performance" element={<PerformanceReport />} />
          <Route path="/profile/privacy" element={<PrivacyPolicy />} />
          <Route path="/profile/share" element={<ShareApp />} />
          <Route path="/profile/support" element={<Support />} />

          {/* Acquisition Module */}
          <Route path="/acquisition/channels" element={<ChannelCodeList />} />
          <Route path="/acquisition/channel/:channelType" element={<ChannelQRDetail />} />
          <Route path="/acquisition/welcome" element={<WelcomeMessageConfig />} />
          <Route path="/acquisition/fission" element={<FissionToolList />} />

          {/* Operation Module */}
          <Route path="/operation/sop" element={<SopManagement />} />
          <Route path="/operation/tasks" element={<TaskList />} />

          {/* Phase 5: Analytics & Marketing */}
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/analytics/advanced" element={<AdvancedAnalytics />} />
          <Route path="/analytics/team" element={<SalesTeamAnalysis />} />
          <Route path="/analytics/risk" element={<RiskAnalysis />} />
          <Route path="/analytics/funnel" element={<FunnelAnalysis />} />
          <Route path="/marketing" element={<MarketingAutomation />} />
          <Route path="/sales" element={<SalesManagement />} />
          <Route path="/sales/:id" element={<SalesDetail />} />
          <Route path="/sales/behavior" element={<SalesBehavior />} />

          {/* Phase 6: Polish */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/tags/:tag" element={<TagDetail />} />
          <Route path="/enterprise/settings" element={<EnterpriseSettings />} />
          <Route path="/enterprise/certification" element={<EnterpriseCertification />} />
        </Route>

        {/* Default route - Show Splash if not authenticated */}
        <Route path="/" element={<Navigate to="/splash" replace />} />
        {/* Catch all - 404 behavior or redirect */}
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
