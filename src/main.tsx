import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './lib/notifications/registerServiceWorker';
import { AuthProvider } from './providers/AuthProvider';
import { FirestoreSyncProvider } from './providers/FirestoreSyncProvider';

void registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FirestoreSyncProvider>
          <App />
        </FirestoreSyncProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
