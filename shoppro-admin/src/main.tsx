import React, { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { IS_PLATFORM_ADMIN_SITE, LOGIN_PATH } from './site';

document.title = IS_PLATFORM_ADMIN_SITE
  ? 'ShopPro 平台管理后台'
  : 'IntelliShop Pro - 新一代AI销售管理智能体及收入运营平台';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[React Error Boundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 16, border: '1px solid #E2E8F0', maxWidth: 600, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#E11D48', margin: '0 0 12px' }}>系统加载遇到异常</h2>
            <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px' }}>{this.state.error?.message || '未知运行时错误'}</p>
            <button
              onClick={() => { localStorage.clear(); window.location.href = LOGIN_PATH; }}
              style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}
            >
              清除缓存并重试
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log('Starting ShopPro PC Application...');

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log('ShopPro PC Application Rendered');
}
