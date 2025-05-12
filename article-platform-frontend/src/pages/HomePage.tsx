    // File: src/pages/HomePage.tsx
    import React, { useState, useEffect } from 'react';
    import Container from 'react-bootstrap/Container';
    import Row from 'react-bootstrap/Row';
    import Col from 'react-bootstrap/Col';
    import Button from 'react-bootstrap/Button';
    import Alert from 'react-bootstrap/Alert';
    import Spinner from 'react-bootstrap/Spinner';
    import { LinkContainer } from 'react-router-bootstrap';
    import { fetchPublishedArticles, type Article, type PaginatedArticles } from '../services/ApiService';
    import ArticleCard from '../components/article/ArticleCard'; // Import ArticleCard

    const HomePage: React.FC = () => {
      const [articles, setArticles] = useState<Article[]>([]);
      const [loading, setLoading] = useState<boolean>(true);
      const [error, setError] = useState<string | null>(null);

      useEffect(() => {
        const loadArticles = async () => {
          try {
            setLoading(true); setError(null);
            const paginatedResponse: PaginatedArticles = await fetchPublishedArticles(1, 3);
            setArticles(paginatedResponse.data);
          } catch (err) { /* ... error handling ... */
            if (err instanceof Error) setError(err.message); else setError('An unknown error occurred.');
          } finally { setLoading(false); }
        };
        loadArticles();
      }, []);

      if (loading) { /* ... loading UI ... */
        return (<Container className="text-center py-5"><Spinner animation="border" /><p className="mt-2">Loading...</p></Container>);
      }
      if (error) { /* ... error UI ... */
        return (<Container className="py-5"><Alert variant="danger">{error}</Alert></Container>);
      }

      return (
        <Container className="py-45">
          <Row className="justify-content-center text-center mb-5">
            <Col md={8}>
              <h1 className="display-4 fw-bold">Welcome to Articulate</h1>
              <p className="lead text-muted">Discover amazing articles on amazing topics.</p>
            </Col>
          </Row>
          <h2 className="mb-4 text-center h3">Featured Articles</h2>
          {articles.length === 0 && !loading && (<Alert variant="info">No featured articles.</Alert>)}
          <Row xs={1} md={2} lg={3} className="g-4">
            {articles.map((article) => (
              <Col key={article.id}>
                <ArticleCard article={article} /> {/* Use ArticleCard component */}
              </Col>
            ))}
          </Row>
           <Row className="mt-5 text-center">
            <Col>
                <LinkContainer to="/articles">
                  <Button variant="outline-primary" size="lg">View All Articles</Button>
                </LinkContainer>
            </Col>
          </Row>
        </Container>
      );
    };
    export default HomePage;
    