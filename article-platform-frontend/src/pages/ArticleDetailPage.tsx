    // File: src/pages/ArticleDetailPage.tsx
    import React, { useState, useEffect, useCallback } from 'react';
    import Container from 'react-bootstrap/Container';
    import Row from 'react-bootstrap/Row';
    import Col from 'react-bootstrap/Col';
    import Button from 'react-bootstrap/Button';
    import Alert from 'react-bootstrap/Alert';
    import Spinner from 'react-bootstrap/Spinner';
    import Image from 'react-bootstrap/Image';
    import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
    import { LinkContainer } from 'react-router-bootstrap';
    import { Heart, HeartFill, Bookmark, BookmarkFill } from 'react-bootstrap-icons'; // Import bookmark icons
    import {
        fetchArticleById,
        likeArticle as apiLikeArticle,
        toggleSaveArticle as apiToggleSaveArticle, // Import toggleSaveArticle
        type Article as ArticleType
    } from '../services/ApiService';
    import { useAuth } from '../contexts/AuthContext';

    const ArticleDetailPage: React.FC = () => {
      const { articleId } = useParams<{ articleId: string }>();
      const [article, setArticle] = useState<ArticleType | null>(null);
      // currentUserHasLiked is now part of the article object from API
      // const [currentUserHasLiked, setCurrentUserHasLiked] = useState<boolean>(false);
      // currentUserHasSaved is now part of the article object from API
      // const [currentUserHasSaved, setCurrentUserHasSaved] = useState<boolean>(false);

      const [loading, setLoading] = useState<boolean>(true);
      const [error, setError] = useState<string | null>(null);

      const [likeError, setLikeError] = useState<string | null>(null);
      const [isLiking, setIsLiking] = useState<boolean>(false);

      const [saveError, setSaveError] = useState<string | null>(null);
      const [isSaving, setIsSaving] = useState<boolean>(false);

      const { isAuthenticated, token } = useAuth();
      const navigate = useNavigate();
      const location = useLocation();

      const loadArticleDetails = useCallback(async () => {
        if (!articleId) {
          setError("Article ID is missing.");
          setLoading(false);
          return;
        }
        try {
          setLoading(true);
          setError(null);
          setLikeError(null);
          setSaveError(null);
          const fetchedArticle = await fetchArticleById(articleId, token); // Pass token
          setArticle(fetchedArticle);
          // Initial like/save status is now set directly from fetchedArticle in the render
        } catch (err) {
          if (err instanceof Error) setError(err.message);
          else setError('An unknown error occurred while fetching the article.');
          console.error(`ArticleDetailPage fetch error (ID: ${articleId}):`, err);
        } finally {
          setLoading(false);
        }
      }, [articleId, token]);

      useEffect(() => {
        loadArticleDetails();
      }, [loadArticleDetails]);

      const handleLikeToggle = async () => {
        if (!isAuthenticated || !token) { navigate('/auth', { state: { from: location } }); return; }
        if (!article || !articleId) return;
        setIsLiking(true); setLikeError(null);
        try {
          const updatedArticle = await apiLikeArticle(articleId, token);
          setArticle(updatedArticle); // This will update article.likes and article.currentUserHasLiked
        } catch (err) {
          if (err instanceof Error) setLikeError(err.message);
          else setLikeError('An unknown error occurred while (un)liking the article.');
        } finally {
          setIsLiking(false);
        }
      };

      const handleSaveToggle = async () => {
        if (!isAuthenticated || !token) { navigate('/login', { state: { from: location } }); return; }
        if (!article || !articleId) return;
        setIsSaving(true); setSaveError(null);
        try {
          const updatedArticle = await apiToggleSaveArticle(articleId, token);
          setArticle(updatedArticle); // This will update article.currentUserHasSaved
        } catch (err) {
          if (err instanceof Error) setSaveError(err.message);
          else setSaveError('An unknown error occurred while (un)saving the article.');
        } finally {
          setIsSaving(false);
        }
      };

      if (loading) { /* ... loading spinner ... */ 
        return (<Container className="text-center py-5"><Spinner animation="border" /><p className="mt-2">Loading article...</p></Container>);
      }
      if (error) { /* ... error alert ... */
        return (<Container className="py-5 text-center"><Alert variant="danger">Error: {error}</Alert><LinkContainer to="/articles"><Button variant="secondary" className="mt-3">Back to Articles</Button></LinkContainer></Container>);
      }
      if (!article) { /* ... not found alert ... */
        return (<Container className="text-center py-5"><Alert variant="warning">Article not found.</Alert><LinkContainer to="/articles"><Button variant="secondary" className="mt-3">Back to Articles</Button></LinkContainer></Container>);
      }

      return (
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <article>
                <header className="mb-4">
                  <h1 className="display-4 fw-bolder mb-1">{article.title}</h1>
                  <div className="text-muted fst-italic mb-2">
                    Published on {new Date(article.createdAt).toLocaleDateString()} in <span className="fw-semibold">{article.category}</span>
                  </div>
                  <div>
                    {article.tags.map(tag => (
                      <LinkContainer key={tag} to={`/tags/${tag}`}>
                        <a role="button" className="badge bg-secondary text-decoration-none link-light me-1">{tag}</a>
                      </LinkContainer>
                    ))}
                  </div>
                </header>
                {article.imageUrl && (
                  <figure className="mb-4 text-center">
                    <Image src={article.imageUrl} alt={`${article.title} full image`} fluid rounded className="shadow-sm" />
                  </figure>
                )}
                <section className="mb-5 fs-5 lh-lg" style={{ whiteSpace: 'pre-line' }}>
                  {article.body}
                </section>
                <hr className="my-4"/>
                {likeError && <Alert variant="danger" className="mt-2 py-2">{likeError}</Alert>}
                {saveError && <Alert variant="danger" className="mt-2 py-2">{saveError}</Alert>}
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <Button
                          variant="outline-danger"
                          onClick={handleLikeToggle}
                          disabled={isLiking}
                          title={!isAuthenticated ? "Login to like" : (article.currentUserHasLiked ? "Unlike" : "Like")}
                          className="d-flex align-items-center me-3" // Added me-3 for spacing
                        >
                          {isLiking ? (
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          ) : article.currentUserHasLiked ? (
                            <HeartFill size={20} className="me-2 text-danger" />
                          ) : (
                            <Heart size={20} className="me-2" />
                          )}
                          <span className="fw-medium">{article.likes}</span>
                        </Button>

                        <Button
                            variant="outline-secondary" // Or another appropriate variant
                            onClick={handleSaveToggle}
                            disabled={isSaving}
                            title={!isAuthenticated ? "Login to save" : (article.currentUserHasSaved ? "Unsave Article" : "Save Article")}
                            className="d-flex align-items-center"
                        >
                            {isSaving ? (
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                            ) : article.currentUserHasSaved ? (
                                <BookmarkFill size={20} className="text-primary" /> // Example: primary color when saved
                            ) : (
                                <Bookmark size={20} />
                            )}
                            <span className="ms-2 d-none d-sm-inline">{article.currentUserHasSaved ? 'Saved' : 'Save'}</span>
                        </Button>
                    </div>
                    <LinkContainer to="/articles">
                      <Button variant="secondary">Back to Articles</Button>
                    </LinkContainer>
                </div>
              </article>
            </Col>
          </Row>
        </Container>
      );
    };
    export default ArticleDetailPage;
    