    // File: src/main.tsx
    // Location: article-platform-frontend/src/main.tsx

    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App.tsx';
    import './index.css';

    import 'bootstrap/dist/css/bootstrap.min.css';
    import { BrowserRouter } from 'react-router-dom';
    import { AuthProvider } from './contexts/AuthContext.tsx';
    import { ToastProvider } from './contexts/ToastContext.tsx'; // Import ToastProvider

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider> {/* Wrap with ToastProvider */}
              <App />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </React.StrictMode>,
    );
    