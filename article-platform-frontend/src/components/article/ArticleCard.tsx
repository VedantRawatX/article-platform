    // File: src/components/articles/ArticleCard.tsx
    import React from 'react';
    import Card from 'react-bootstrap/Card';
    import Button from 'react-bootstrap/Button';
    import Nav from 'react-bootstrap/Nav'; // For Card.Title link styling
    import { LinkContainer } from 'react-router-bootstrap';
    import { type Article } from '../../services/ApiService'; // Adjust path as needed
    import { HeartFill } from 'react-bootstrap-icons'; // Added Heart icon

    interface ArticleCardProps {
      article: Article;
      showExcerpt?: boolean;
      className?: string;
    }

    const ArticleCard: React.FC<ArticleCardProps> = ({ article, showExcerpt = true, className }) => {
      const excerpt = article.body.substring(0, 100) + (article.body.length > 100 ? '...' : '');

      return (
        <Card className={`h-100 shadow ${className || ''}`}>
          {/* 1. Image is clickable */}
          <LinkContainer to={`/articles/${article.id}`}>
            <Nav.Link className="p-0" style={{ lineHeight: '0' }}>
              <Card.Img
                variant="top"
                src={article.imageUrl || `https://placehold.co/600x400/EBF8FF/3182CE?text=${encodeURIComponent(article.title)}`}
                alt={`${article.title} Thumbnail`}
                style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
              />
            </Nav.Link>
          </LinkContainer>

          <Card.Body className="d-flex flex-column">
            {/* 2. Title is clickable */}
            <Card.Title as="h5" className="mb-2">
              <LinkContainer to={`/articles/${article.id}`}>
                <Nav.Link className="p-0 fw-bold" style={{ color: 'inherit', textDecoration: 'none' }}>
                  {article.title}
                </Nav.Link>
              </LinkContainer>
            </Card.Title>

            <Card.Text className="text-muted small mb-2">
              <span className="fw-medium">{article.category}</span>
              {article.tags && article.tags.length > 0 && " | Tags: "}
              {article.tags.join(', ')}
            </Card.Text>
            {showExcerpt && (
                <Card.Text className="flex-grow-1 small mb-3">
                    {excerpt}
                </Card.Text>
            )}

            <div className="mt-auto d-flex justify-content-between align-items-center">
              <LinkContainer to={`/articles/${article.id}`}>
                  <Button variant="outline-primary" size="sm">Read More</Button>
              </LinkContainer>
              <div className="d-flex align-items-center text-muted small">
                  <HeartFill size={16} className="me-2 text-danger" /> {article.likes}
              </div>
            </div>
          </Card.Body>

          <Card.Footer className="text-muted small">
            Published: {new Date(article.createdAt).toLocaleDateString()}
          </Card.Footer>
        </Card>
      );
    };

    export default ArticleCard;
    