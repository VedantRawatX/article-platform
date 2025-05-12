    // File: src/App.tsx
    import React, { useState } from 'react'; // Removed useRef
    import './index.css'; // CSS for transitions will be removed from here or the specific file

    import Container from 'react-bootstrap/Container';
    import Button from 'react-bootstrap/Button';
    import Navbar from 'react-bootstrap/Navbar';
    import { Routes, Route, useNavigation, Outlet } from 'react-router-dom'; // useLocation removed as it was for CSSTransition key
    import { LinkContainer } from 'react-router-bootstrap';
    import { BookmarkHeartFill, ChatDotsFill } from 'react-bootstrap-icons';
    // CSSTransition and TransitionGroup are removed
    // import { CSSTransition, TransitionGroup } from 'react-transition-group';
    import NavigationBar from './components/NavigationBar';
    import ProtectedRoute from './components/ProtectedRoute';
    import SavedArticlesSidebar from './components/shared/SavedArticlesSidebar';
    import ChatSidebar from './components/shared/ChatSidebar';
    import ToastContainerComponent from './components/shared/ToastContainerComponent';
    import TopProgressBar from './components/shared/TopProgressBar'; // Will remove this component usage

    // Page imports are not strictly needed here if router config is in main.tsx,
    // but keeping them doesn't harm if App is the root element in router config.
    // import HomePage from './pages/HomePage';
    // import AuthPage from './pages/AuthPage';
    // import ArticlesListPage from './pages/ArticlesListPage';
    // import ArticleDetailPage from './pages/ArticleDetailPage';
    // import AdminPage from './pages/AdminPage';
    // import UserProfilePage from './pages/UserProfilePage';

    import { useAuth } from './contexts/AuthContext';

    const FOOTER_HEIGHT = '60px';
    const STICKY_BUTTON_SIZE = '60px';
    const STICKY_BUTTON_OFFSET = '20px';

    function App() {
      const [showSavedArticles, setShowSavedArticles] = useState(false);
      const [showChat, setShowChat] = useState(false);
      const { isAuthenticated } = useAuth();
      const navigation = useNavigation();
      // const location = useLocation(); // No longer needed for CSSTransition key

      // const nodeRef = useRef<HTMLDivElement>(null); // No longer needed

      const isLoadingNavigation = navigation.state !== 'idle';

      const toggleSavedArticlesSidebar = () => { setShowSavedArticles(prev => !prev); if (showChat && !showSavedArticles) setShowChat(false); };
      const toggleChatSidebar = () => { setShowChat(prev => !prev); if (showSavedArticles && !showChat) setShowSavedArticles(false); };

      const stickyButtonStyleBase: React.CSSProperties = {
        position: 'fixed', width: STICKY_BUTTON_SIZE, height: STICKY_BUTTON_SIZE,
        borderRadius: '50%', zIndex: 1031,
      };
      const savedArticlesButtonStyle: React.CSSProperties = {
        ...stickyButtonStyleBase, bottom: `calc(${STICKY_BUTTON_OFFSET} + ${FOOTER_HEIGHT} + 10px)`,
        left: STICKY_BUTTON_OFFSET,
      };
      const chatButtonStyle: React.CSSProperties = {
        ...stickyButtonStyleBase, bottom: `calc(${STICKY_BUTTON_OFFSET} + ${FOOTER_HEIGHT} + 10px)`,
        right: STICKY_BUTTON_OFFSET,
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* TopProgressBar is still here but will be removed in next step if desired */}
          <TopProgressBar isLoading={isLoadingNavigation} />
          <NavigationBar />
          <ToastContainerComponent />

          <main
            className="flex-grow-1"
            style={{
              paddingBottom: `calc(${FOOTER_HEIGHT} + ${STICKY_BUTTON_OFFSET} + ${STICKY_BUTTON_SIZE})`,
              // position: 'relative' // No longer strictly needed for TransitionGroup
            }}
          >
            {/* Removed TransitionGroup and CSSTransition */}
            <Outlet /> {/* Child routes are rendered here directly */}
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

          <Navbar bg="dark" variant="dark" fixed="bottom" className="p-3 text-center" style={{ zIndex: 1030 }}>
            <Container><div className="w-100"><p className="mb-0 text-white-50">&copy; {new Date().getFullYear()} Article Platform.</p></div></Container>
          </Navbar>

          <SavedArticlesSidebar show={showSavedArticles} handleClose={toggleSavedArticlesSidebar} />
          <ChatSidebar show={showChat} handleClose={toggleChatSidebar} />
        </div>
      );
    }

    export default App;
    