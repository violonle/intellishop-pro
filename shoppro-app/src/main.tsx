import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/common/ErrorBoundary.tsx'

document.title = 'IntelliShop Pro - 新一代AI销售管理智能体'

console.log('Main: Starting app...');
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('FATAL: Root element not found');
  } else {
    console.log('Main: Root element found, mounting React');
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <Provider store={store}>
            <App />
          </Provider>
        </ErrorBoundary>
      </StrictMode>,
    );
  }
} catch (error) {
  console.error('FATAL: React mount failed', error);
}
