import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import OfflineManager from './components/OfflineManager.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <OfflineManager>
        <App />
      </OfflineManager>
    </ErrorBoundary>
  </StrictMode>,
);

