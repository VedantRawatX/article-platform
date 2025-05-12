    // File: src/components/admin/CreateEditArticleModal.tsx
    import React, { useState, useEffect } from 'react';
    import type { FormEvent } from 'react';
    import Modal from 'react-bootstrap/Modal';
    import Button from 'react-bootstrap/Button';
    import Form from 'react-bootstrap/Form';
    import Alert from 'react-bootstrap/Alert';
    import Spinner from 'react-bootstrap/Spinner';
    import { createArticle, updateArticle } from '../../services/ApiService'; // Adjust path
    import type { Article, CreateArticleDto, UpdateArticleDto } from '../../services/ApiService'; // Adjust path
    import { useAuth } from '../../contexts/AuthContext'; // Adjust path

  
    export const ArticleCategories = {
      TECH: 'Tech',
      NEWS: 'News',
      GENERAL: 'General',
    } as const;

    export type ArticleCategoryType = typeof ArticleCategories[keyof typeof ArticleCategories];

    interface CreateEditArticleModalProps {
      show: boolean;
      handleClose: () => void;
      article: Article | null; // null for create mode, Article object for edit mode
      onSave: (savedArticle: Article) => void; // Callback after successful save
    }

    const CreateEditArticleModal: React.FC<CreateEditArticleModalProps> = ({ show, handleClose, article, onSave }) => {
      const { token } = useAuth();
      const isEditMode = !!article;

      // Form state
      const [title, setTitle] = useState('');
      const [body, setBody] = useState('');
      const [imageUrl, setImageUrl] = useState('');
      const [category, setCategory] = useState<ArticleCategoryType>(ArticleCategories.GENERAL); // Default to GENERAL
      const [tags, setTags] = useState('');
      const [isPublished, setIsPublished] = useState(true);

      const [submitting, setSubmitting] = useState(false);
      const [error, setError] = useState<string | null>(null);

      useEffect(() => {
        if (article && isEditMode) {
          setTitle(article.title);
          setBody(article.body);
          setImageUrl(article.imageUrl || '');
          // Ensure the category from the article is a valid ArticleCategoryType
          setCategory(article.category as ArticleCategoryType); // Cast if backend returns string that matches
          setTags(article.tags.join(', '));
          setIsPublished(article.isPublished);
        } else {
          setTitle('');
          setBody('');
          setImageUrl('');
          setCategory(ArticleCategories.GENERAL); // Default for new articles
          setTags('');
          setIsPublished(true);
        }
        setError(null);
      }, [article, isEditMode, show]);

      const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!token) {
          setError("Authentication token not found. Please login again.");
          return;
        }
        setSubmitting(true);
        setError(null);

        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

        try {
          let savedArticle: Article;
          if (isEditMode && article) {
            const articleData: UpdateArticleDto = {
              title,
              body,
              imageUrl: imageUrl || undefined,
              category, // category is now ArticleCategoryType
              tags: tagsArray,
              isPublished,
            };
            savedArticle = await updateArticle(article.id, articleData, token);
          } else {
            const articleData: CreateArticleDto = {
              title,
              body,
              imageUrl: imageUrl || undefined,
              category, // category is now ArticleCategoryType
              tags: tagsArray,
              isPublished,
            };
            savedArticle = await createArticle(articleData, token);
          }
          onSave(savedArticle);
          handleClose();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
          setError(errorMessage);
          console.error("Error saving article:", err);
        } finally {
          setSubmitting(false);
        }
      };

      return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{isEditMode ? 'Edit Article' : 'Create New Article'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form.Group className="mb-3" controlId="formArticleTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" placeholder="Enter article title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={submitting}/>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formArticleBody">
                <Form.Label>Body</Form.Label>
                <Form.Control as="textarea" rows={10} placeholder="Enter article content" value={body} onChange={(e) => setBody(e.target.value)} required disabled={submitting}/>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formArticleImageUrl">
                <Form.Label>Image URL (Optional)</Form.Label>
                <Form.Control type="url" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={submitting}/>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formArticleCategory">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  aria-label="Article category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ArticleCategoryType)}
                  required
                  disabled={submitting}
                >
                  {/* Iterate over the values of the ArticleCategories object */}
                  {Object.values(ArticleCategories).map((catValue) => (
                    <option key={catValue} value={catValue}>
                      {catValue} {/* Display the value (e.g., "Tech", "News") */}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formArticleTags">
                <Form.Label>Tags (comma-separated)</Form.Label>
                <Form.Control type="text" placeholder="e.g., react, nestjs, webdev" value={tags} onChange={(e) => setTags(e.target.value)} disabled={submitting}/>
                <Form.Text className="text-muted">Enter tags separated by commas.</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formArticlePublished">
                <Form.Check type="switch" id="isPublishedSwitch" label="Published" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} disabled={submitting}/>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose} disabled={submitting}>Close</Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" /> {isEditMode ? 'Saving...' : 'Creating...'}</>
                ) : (
                  isEditMode ? 'Save Changes' : 'Create Article'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      );
    };

    export default CreateEditArticleModal;
    