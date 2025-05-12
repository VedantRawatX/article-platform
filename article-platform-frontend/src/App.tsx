    // File: src/App.tsx
    import React, { useState } from 'react';
    import './index.css';

    import Container from 'react-bootstrap/Container';
    import Button from 'react-bootstrap/Button';
    import Navbar from 'react-bootstrap/Navbar';
    import { Routes, Route } from 'react-router-dom';
    import { LinkContainer } from 'react-router-bootstrap';
    import { BookmarkHeartFill } from 'react-bootstrap-icons';

    import NavigationBar from './components/NavigationBar';
    import ProtectedRoute from './components/ProtectedRoute';
    import SavedArticlesSidebar from './components/shared/SavedArticlesSidebar';
    import ToastContainerComponent from './components/shared/ToastContainerComponent'; // Import ToastContainerComponent

    import HomePage from './pages/HomePage';
    import AuthPage from './pages/AuthPage';
    import ArticlesListPage from './pages/ArticlesListPage';
    import ArticleDetailPage from './pages/ArticleDetailPage';
    import AdminPage from './pages/AdminPage';
    import { useAuth } from './contexts/AuthContext';

    const FOOTER_HEIGHT = '60px';
    const STICKY_BUTTON_SIZE = '60px';
    const STICKY_BUTTON_OFFSET = '20px';

    function App() {
      const [showSavedArticles, setShowSavedArticles] = useState(false);
      const { isAuthenticated } = useAuth();

      const toggleSavedArticlesSidebar = () => {
        setShowSavedArticles(prev => !prev);
      };

      const stickyButtonStyle: React.CSSProperties = {
        position: 'fixed',
        bottom: `calc(${STICKY_BUTTON_OFFSET} + ${FOOTER_HEIGHT} + 10px)`,
        right: STICKY_BUTTON_OFFSET,
        width: STICKY_BUTTON_SIZE,
        height: STICKY_BUTTON_SIZE,
        borderRadius: '50%',
        zIndex: 1031,
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <NavigationBar />
          <ToastContainerComponent /> {/* Add ToastContainerComponent here */}

          <main
            className="flex-grow-1"
            style={{ paddingBottom: FOOTER_HEIGHT }}
          >
            <Routes>
              {/* ... your routes ... */}
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/articles" element={<ArticlesListPage />} />
              <Route path="/articles/:articleId" element={<ArticleDetailPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={
                <Container className="text-center py-5 d-flex flex-column justify-content-center align-items-center" style={{minHeight: `calc(100vh - 112px - ${FOOTER_HEIGHT})`}}>
                  <h1 className="display-1 fw-bold">404</h1>
                  <p className="fs-3"> <span className="text-danger">Opps!</span> Page not found.</p>
                  <p className="lead">The page you’re looking for doesn’t exist.</p>
                  <LinkContainer to="/"><Button variant="primary">Go Home</Button></LinkContainer>
                </Container>
              } />
            </Routes>
          </main>

          {isAuthenticated && (
            <Button
              variant="primary"
              style={stickyButtonStyle}
              className="shadow-lg d-flex align-items-center justify-content-center p-0"
              onClick={toggleSavedArticlesSidebar}
              title="View Saved Articles"
              aria-label="View Saved Articles"
            >
              <BookmarkHeartFill size={24} />
            </Button>
          )}

          <Navbar bg="dark" variant="dark" fixed="bottom" className="p-3 text-center" style={{ zIndex: 1030 }}>
            <Container>
              <div className="w-100">
                <p className="mb-0 text-white-50">&copy; {new Date().getFullYear()} Article Platform. All rights reserved.</p>
              </div>
            </Container>
          </Navbar>

          <SavedArticlesSidebar show={showSavedArticles} handleClose={toggleSavedArticlesSidebar} />
        </div>
      );
    }

    export default App;
    