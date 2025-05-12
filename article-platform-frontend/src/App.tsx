    // File: src/App.tsx
    import React, { useState } from 'react';
    import './index.css';

    import Container from 'react-bootstrap/Container';
    import Button from 'react-bootstrap/Button';
    import Navbar from 'react-bootstrap/Navbar';
    import { Routes, Route } from 'react-router-dom';
    import { LinkContainer } from 'react-router-bootstrap';
    import { BookmarkHeartFill, ChatDotsFill } from 'react-bootstrap-icons';

    import NavigationBar from './components/NavigationBar';
    import ProtectedRoute from './components/ProtectedRoute';
    import SavedArticlesSidebar from './components/shared/SavedArticlesSidebar';
    import ToastContainerComponent from './components/shared/ToastContainerComponent';
    import TopProgressBar from './components/shared/TopProgressBar'; // Assuming you want to keep this
    import ChatSidebar from './components/shared/ChatSidebar';

    import HomePage from './pages/HomePage';
    import AuthPage from './pages/AuthPage';
    import ArticlesListPage from './pages/ArticlesListPage';
    import ArticleDetailPage from './pages/ArticleDetailPage';
    import AdminPage from './pages/AdminPage';
    import UserProfilePage from './pages/UserProfilePage';
    import { useAuth } from './contexts/AuthContext'; // useAuth might be needed for sticky buttons

    const FOOTER_HEIGHT = '60px';
    const STICKY_BUTTON_SIZE = '60px';
    const STICKY_BUTTON_OFFSET = '20px';

    function App() {
      const [showSavedArticles, setShowSavedArticles] = useState(false);
      const [showChat, setShowChat] = useState(false);
      const { isAuthenticated } = useAuth(); // Get auth state for sticky buttons
      // const navigation = useNavigation(); // Removed as TopProgressBar might be removed or simplified
      // const isLoadingNavigation = navigation.state !== 'idle'; // Related to useNavigation

      const toggleSavedArticlesSidebar = () => { setShowSavedArticles(prev => !prev); if (showChat && !showSavedArticles) setShowChat(false); };
      const toggleChatSidebar = () => { setShowChat(prev => !prev); if (showSavedArticles && !showChat) setShowSavedArticles(false); };

      const stickyButtonStyleBase: React.CSSProperties = {
        position: 'fixed', width: STICKY_BUTTON_SIZE, height: STICKY_BUTTON_SIZE,
        borderRadius: '50%', zIndex: 1031,
      };
      const savedArticlesButtonStyle: React.CSSProperties = {
        ...stickyButtonStyleBase, bottom: `calc(${STICKY_BUTTON_OFFSET})`,
        left: STICKY_BUTTON_OFFSET,
      };
      const chatButtonStyle: React.CSSProperties = {
        ...stickyButtonStyleBase, bottom: `calc(${STICKY_BUTTON_OFFSET})`,
        right: STICKY_BUTTON_OFFSET,
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* <TopProgressBar isLoading={isLoadingNavigation} />  // Consider if still needed without useNavigation */}
          <NavigationBar />
          <ToastContainerComponent />

          <main
            className="flex-grow"
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected Articles List Route */}
              <Route
                path="/articles"
                element={
                  <ProtectedRoute> {/* No specific roles, just needs authentication */}
                    <ArticlesListPage />
                  </ProtectedRoute>
                }
              />
              {/* Individual articles can remain public, or also be protected if desired */}
              <Route path="/articles/:articleId" element={<ArticleDetailPage />} />

              <Route
                path="/admin"
                element={ <ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute> }
              />
              <Route
                path="/profile"
                element={ <ProtectedRoute><UserProfilePage /></ProtectedRoute> }
              />
              <Route path="*" element={
                <Container className="text-center py-5 d-flex flex-column justify-content-center align-items-center" style={{minHeight: `calc(100vh - 56px - ${FOOTER_HEIGHT})`}}>
                  <h1 className="display-1 fw-bold">404</h1>
                  <p className="fs-3"> <span className="text-danger">Opps!</span> Page not found.</p>
                  <p className="lead">The page you’re looking for doesn’t exist.</p>
                  <LinkContainer to="/"><Button variant="primary">Go Home</Button></LinkContainer>
                </Container>
              } />
            </Routes>
          </main>

          {isAuthenticated && (
            <Button variant="info" style={savedArticlesButtonStyle} className="shadow-lg d-flex align-items-center justify-content-center p-0" onClick={toggleSavedArticlesSidebar} title="Saved Articles">
              <BookmarkHeartFill size={24} />
            </Button>
          )}
          {isAuthenticated && (
            <Button variant="success" style={chatButtonStyle} className="shadow-lg d-flex align-items-center justify-content-center p-0" onClick={toggleChatSidebar} title="Open Chat">
              <ChatDotsFill size={24} />
            </Button>
          )}

          <SavedArticlesSidebar show={showSavedArticles} handleClose={toggleSavedArticlesSidebar} />
          <ChatSidebar show={showChat} handleClose={toggleChatSidebar} />
        </div>
      );
    }

    export default App;
    