    // File: src/main.tsx
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App.tsx'; // App is now the root layout component
    import './index.css';

    import 'bootstrap/dist/css/bootstrap.min.css';
    // BrowserRouter is removed
    import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'; // Import createBrowserRouter and RouterProvider

    // Import Context Providers
    import { AuthProvider } from './contexts/AuthContext.tsx';
    import { ToastProvider } from './contexts/ToastContext.tsx';
    import { SocketProvider } from './contexts/SocketContext.tsx';

    // Import Page Components for router configuration
    import HomePage from './pages/HomePage';
    import AuthPage from './pages/AuthPage';
    import ArticlesListPage from './pages/ArticlesListPage';
    import ArticleDetailPage from './pages/ArticleDetailPage';
    import AdminPage from './pages/AdminPage';
    import UserProfilePage from './pages/UserProfilePage';
    import ProtectedRoute from './components/ProtectedRoute'; // For protecting routes

    // Import Bootstrap components for 404 page if needed directly in router config
    import Container from 'react-bootstrap/Container';
    import Button from 'react-bootstrap/Button';
    import { LinkContainer } from 'react-router-bootstrap';


    // Define the router configuration
    const router = createBrowserRouter([
      {
        path: "/",
        element: <App />, // App component is the root layout
        // ErrorElement can be added here for root-level errors
        children: [
          { index: true, element: <HomePage /> }, // index: true makes this the default child route for "/"
          { path: "auth", element: <AuthPage /> },
          { path: "articles", element: <ArticlesListPage /> },
          { path: "articles/:articleId", element: <ArticleDetailPage /> },
          {
            path: "admin",
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "profile",
            element: (
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            ),
          },
          {
            path: "*", // Catch-all for 404 Not Found
            element: (
              <Container
                className="text-center py-5 d-flex flex-column justify-content-center align-items-center"
                style={{ minHeight: `calc(100vh - 56px - 60px)` }} // Adjust heights as needed
              >
                <h1 className="display-1 fw-bold">404</h1>
                <p className="fs-3"> <span className="text-danger">Opps!</span> Page not found.</p>
                <p className="lead">The page you’re looking for doesn’t exist.</p>
                <LinkContainer to="/">
                  <Button variant="primary">Go Home</Button>
                </LinkContainer>
              </Container>
            ),
          },
        ],
      },
      // You can define other top-level routes here if App shouldn't be the layout for them
    ]);

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <AuthProvider>
          <SocketProvider>
            <ToastProvider>
              <RouterProvider router={router} /> {/* Use RouterProvider */}
            </ToastProvider>
          </SocketProvider>
        </AuthProvider>
      </React.StrictMode>,
    );
    