import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, theme as antdTheme } from 'antd';
import StaticAntd from '@/utils/StaticAntd';
import BusinessRoutes from '@/routes/BusinessRoutes';
import PlatformAdminRoutes from '@/routes/PlatformAdminRoutes';
import { IS_PLATFORM_ADMIN_SITE } from '@/site';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

const AntdStaticConfig: React.FC = () => {
    const { message, notification, modal } = AntdApp.useApp();
    StaticAntd.message = message;
    StaticAntd.notification = notification;
    StaticAntd.modal = modal;
    return null;
};

const AppContent: React.FC = () => {
    const { themeMode } = useTheme();

    return (
        <ConfigProvider
            theme={{
                algorithm: themeMode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#2563EB',
                    colorInfo: '#2563EB',
                    colorLink: '#2563EB',
                    borderRadius: 12,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                },
            }}
        >
            <div className="shoppro-app-shell">
                <AntdApp>
                    <AntdStaticConfig />
                    <CompanyProvider>
                        <Router>
                            {IS_PLATFORM_ADMIN_SITE ? <PlatformAdminRoutes /> : <BusinessRoutes />}
                        </Router>
                    </CompanyProvider>
                </AntdApp>
            </div>
        </ConfigProvider>
    );
};

const App: React.FC = () => (
    <ThemeProvider>
        <AppContent />
    </ThemeProvider>
);

export default App;
