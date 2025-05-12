    // File: src/components/shared/SavedArticlesSidebar.tsx
    import React, { useState, useEffect, useCallback } from 'react';
    import Offcanvas from 'react-bootstrap/Offcanvas';
    import ListGroup from 'react-bootstrap/ListGroup';
    import Button from 'react-bootstrap/Button';
    import Spinner from 'react-bootstrap/Spinner';
    import Alert from 'react-bootstrap/Alert';
    import { Link } from 'react-router-dom';
    import { BookmarkStarFill } from 'react-bootstrap-icons';
    import { useAuth } from '../../contexts/AuthContext';
    import { fetchSavedArticles, type Article, type PaginatedArticles } from '../../services/ApiService';

    interface SavedArticlesSidebarProps {
      show: boolean;
      handleClose: () => void;
    }

    const SavedArticlesSidebar: React.FC<SavedArticlesSidebarProps> = ({ show, handleClose }) => {
      const { isAuthenticated, token } = useAuth();
      const [savedArticles, setSavedArticles] = useState<Article[]>([]);
      const [loading, setLoading] = useState<boolean>(false);
      const [error, setError] = useState<string | null>(null);
      const [currentPage, setCurrentPage] = useState(1);
      const [totalPages, setTotalPages] = useState(0);
      const [hasMore, setHasMore] = useState(true);

      const loadSavedArticles = useCallback(async (page: number, initialLoad = false) => {
        if (!isAuthenticated || !token) {
          setSavedArticles([]); setTotalPages(0); setHasMore(false); return;
        }
        setLoading(true); setError(null);
        try {
          const response: PaginatedArticles = await fetchSavedArticles(token, page, 5);
          if (initialLoad) { setSavedArticles(response.data); }
          else {
            setSavedArticles(prev => {
                const newArticles = response.data.filter(na => !prev.some(pa => pa.id === na.id));
                return [...prev, ...newArticles];
            });
          }
          setTotalPages(response.totalPages); setCurrentPage(response.page);
          setHasMore(response.page < response.totalPages);
        } catch (err) {
          if (err instanceof Error) setError(err.message); else setError('Failed to load saved articles.');
        } finally { setLoading(false); }
      }, [isAuthenticated, token]);

      useEffect(() => {
        if (show && isAuthenticated) { loadSavedArticles(1, true); }
        else if (!isAuthenticated) {
            setSavedArticles([]); setCurrentPage(1); setTotalPages(0); setHasMore(false);
        }
      }, [show, isAuthenticated, loadSavedArticles]);

      const handleLoadMore = () => { if (hasMore && !loading) { loadSavedArticles(currentPage + 1); }};

      if (!isAuthenticated && show) { // If somehow shown while not authenticated, close it or show login prompt
        handleClose(); // Or return a prompt to login
        return null;
      }


      return (
        <Offcanvas show={show} onHide={handleClose} placement="start" scroll={true} backdrop={true}> {/* Changed placement to "start" */}
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <BookmarkStarFill size={24} className="me-2" /> Saved Articles
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
            {savedArticles.length === 0 && !loading && !error && (
              <p className="text-muted text-center mt-3">You haven't saved any articles yet.</p>
            )}
            <ListGroup variant="flush">
              {savedArticles.map(article => (
                <ListGroup.Item key={article.id} as={Link} to={`/articles/${article.id}`} onClick={handleClose} action className="text-decoration-none">
                  <div className="fw-bold">{article.title}</div>
                  <small className="text-muted">{article.category} - Saved on {new Date(article.updatedAt).toLocaleDateString()}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
            {loading && (<div className="text-center my-3"><Spinner animation="border" size="sm" /> Loading...</div>)}
            {!loading && hasMore && (<div className="d-grid mt-3"><Button variant="outline-primary" onClick={handleLoadMore}>Load More</Button></div>)}
            {!loading && !hasMore && savedArticles.length > 0 && (<p className="text-muted text-center mt-3 small">End of saved articles.</p>)}
          </Offcanvas.Body>
        </Offcanvas>
      );
    };
    export default SavedArticlesSidebar;
    