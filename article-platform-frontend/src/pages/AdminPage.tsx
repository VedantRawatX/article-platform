    // File: src/pages/AdminPage.tsx
    import React, { useState, useEffect, useCallback, type ChangeEvent, useRef } from 'react';
    import Container from 'react-bootstrap/Container';
    import Button from 'react-bootstrap/Button';
    import Table from 'react-bootstrap/Table';
    import Alert from 'react-bootstrap/Alert';
    import Spinner from 'react-bootstrap/Spinner';
    import Card from 'react-bootstrap/Card';
    import { PencilSquare, Trash, Eye, EyeSlash, PlusCircleFill } from 'react-bootstrap-icons';
    import { useAuth } from '../contexts/AuthContext';
    import { useToasts } from '../contexts/ToastContext'; // Import useToasts
    import { fetchAllArticlesAdmin, deleteArticle as apiDeleteArticle } from '../services/ApiService';
    import type { Article, PaginatedArticles, ArticleSortBy, ArticleSortDirection, ArticleCategoryFilter, PublishedStatusFilter } from '../services/ApiService';
    import CreateEditArticleModal from '../components/admin/CreateEditArticleModal';
    import FilterControls from '../components/shared/FilterControls';
    import SharedPagination from '../components/shared/SharedPagination';
    import type { FilterValues } from '../components/shared/FilterControls';

    const ITEMS_PER_PAGE = 10;

    const AdminPage: React.FC = () => {
      const [articles, setArticles] = useState<Article[]>([]);
      const [loading, setLoading] = useState<boolean>(true);
      const [error, setError] = useState<string | null>(null); // For page-level errors
      const { token, user } = useAuth();
      const { addToast } = useToasts(); // Get addToast function

      const [currentPage, setCurrentPage] = useState(1);
      const [totalPages, setTotalPages] = useState(0);
      const [totalArticles, setTotalArticles] = useState(0);

      const [filters, setFilters] = useState<FilterValues>({ /* ... */
        searchTerm: '', selectedCategory: '', tagsFilter: '',
        publishedStatusFilter: 'all', sortBy: 'createdAt', sortDirection: 'DESC',
      });
      const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
      const [showModal, setShowModal] = useState(false);
      const [editingArticle, setEditingArticle] = useState<Article | null>(null);
      const isInitialMount = useRef(true);

      useEffect(() => { /* ... debounce logic ... */
        const handler = setTimeout(() => { if (filters.searchTerm !== debouncedSearchTerm) { setDebouncedSearchTerm(filters.searchTerm || '');}}, 500);
        return () => clearTimeout(handler);
      }, [filters.searchTerm, debouncedSearchTerm]);

      const loadArticles = useCallback(async (page: number) => { /* ... loadArticles logic ... */
        if (!token) { setError("Auth token missing."); setLoading(false); return; }
        try {
          setLoading(true); setError(null);
          const res: PaginatedArticles = await fetchAllArticlesAdmin(token, page, ITEMS_PER_PAGE, debouncedSearchTerm, filters.selectedCategory, filters.tagsFilter, filters.publishedStatusFilter, filters.sortBy, filters.sortDirection);
          setArticles(res.data); setTotalArticles(res.total); setTotalPages(res.totalPages); setCurrentPage(res.page);
        } catch (err) { if (err instanceof Error) setError(err.message); else setError('Failed to fetch articles.');}
        finally { setLoading(false); }
      }, [token, debouncedSearchTerm, filters]);

      useEffect(() => { /* ... main useEffect for loading ... */
        if (user?.role === 'admin') {
            if (currentPage !== 1 && (debouncedSearchTerm !== filters.searchTerm || Object.values(filters).some((val, i) => val !== (Object.values({searchTerm:'',selectedCategory:'',tagsFilter:'',publishedStatusFilter:'all',sortBy:'createdAt',sortDirection:'DESC'})[i])))) {
                 setCurrentPage(1);
            } else { loadArticles(currentPage); }
        } else if (user) { setError("Access Denied."); setLoading(false); }
      }, [loadArticles, user, currentPage, debouncedSearchTerm, filters]);


      const handleFilterStateChange = (newFilterValues: Partial<FilterValues>) => { /* ... */ setFilters(prev => ({ ...prev, ...newFilterValues }));};
      const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => handleFilterStateChange({ searchTerm: e.target.value });
      const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => handleFilterStateChange({ selectedCategory: e.target.value as ArticleCategoryFilter });
      const handleTagsInputChange = (e: ChangeEvent<HTMLInputElement>) => handleFilterStateChange({ tagsFilter: e.target.value });
      const handleTagsApply = () => { /* useEffect will trigger reload if filters.tagsFilter changed */ };
      const handlePublishedStatusChange = (e: ChangeEvent<HTMLSelectElement>) => handleFilterStateChange({ publishedStatusFilter: e.target.value as PublishedStatusFilter });
      const handleSortByChange = (e: ChangeEvent<HTMLSelectElement>) => handleFilterStateChange({ sortBy: e.target.value as ArticleSortBy });
      const toggleSortDirection = () => handleFilterStateChange({ sortDirection: filters.sortDirection === 'ASC' ? 'DESC' : 'ASC' });

      const handleCreateArticle = () => { setEditingArticle(null); setShowModal(true); };
      const handleEditArticle = (article: Article) => { setEditingArticle(article); setShowModal(true); };

      const handleDeleteArticle = async (articleId: string) => {
        if (!token) { addToast("Authentication required to delete.", 'warning'); return; }
        if (window.confirm(`Are you sure you want to delete this article? This action cannot be undone.`)) {
          try {
            await apiDeleteArticle(articleId, token);
            addToast(`Article deleted successfully.`, 'success'); // Use Toast
            if (articles.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
            else loadArticles(currentPage);
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to delete article.";
            setError(msg); // Keep page-level error for major issues
            addToast(msg, 'danger'); // Use Toast for action feedback
          }
        }
      };

      const handleModalSave = (savedArticle: Article) => {
        setShowModal(false);
        loadArticles(currentPage);
        addToast(`Article "${savedArticle.title}" ${editingArticle ? 'updated' : 'created'} successfully!`, 'success'); // Use Toast
        setEditingArticle(null);
      };

      const handleModalClose = () => { setShowModal(false); setEditingArticle(null); }
      const handlePageChange = (pageNumber: number) => { setCurrentPage(pageNumber); };

      if (loading && articles.length === 0) { /* ... initial loader ... */ }
      if (user?.role !== 'admin' && !loading) { /* ... access denied ... */ }

      return (
        <Container fluid className="py-4 px-md-4">
          <Container>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
              <h1 className="display-5 fw-bold mb-2 mb-md-0">Manage Articles</h1>
              <Button variant="success" size="lg" onClick={handleCreateArticle}><PlusCircleFill className="me-2" />Create</Button>
            </div>
            {/* Page-level error for fetch errors, not action errors which are now toasts */}
            {error && !loading && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          </Container>

          <Container className="mb-4">
            <FilterControls
                isAdminPage={true}
                filters={filters}
                onSearchChange={handleSearchChange}
                onCategoryChange={handleCategoryChange}
                onTagsChange={handleTagsInputChange}
                onTagsApply={handleTagsApply}
                onPublishedStatusChange={handlePublishedStatusChange}
                onSortByChange={handleSortByChange}
                onToggleSortDirection={toggleSortDirection}
            />
          </Container>

          <Container>
            {/* ... Table rendering ... */}
            {loading && articles.length > 0 && (<div className="text-center my-3"><Spinner size="sm" /> Refreshing...</div>)}
            {!loading && articles.length === 0 && !error && (<Alert variant="info">No articles match criteria.</Alert>)}
            {articles.length > 0 && (
              <Card className="shadow-sm mt-0">
                <Card.Header as="h5">All Articles ({totalArticles})</Card.Header>
                <Card.Body>
                  <Table striped hover responsive className="align-middle" size="sm">
                    <thead className="table-dark">
                      <tr>
                        <th className="text-center">#</th><th>Title</th><th>Category</th>
                        <th className="text-center">Status</th><th className="text-center">Likes</th>
                        <th>Created At</th><th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((article, index) => (
                        <tr key={article.id}>
                          <td className="text-center">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                          <td><a href={`/articles/${article.id}`} target="_blank" rel="noopener noreferrer">{article.title}</a></td>
                          <td>{article.category}</td>
                          <td className="text-center">
                            {article.isPublished ? (<span className="badge bg-success"><Eye className="me-1"/>Pub</span>) : (<span className="badge bg-warning text-dark"><EyeSlash className="me-1"/>Draft</span>)}
                          </td>
                          <td className="text-center">{article.likes}</td>
                          <td>{new Date(article.createdAt).toLocaleDateString()}</td>
                          <td className="text-center">
                            <Button variant="primary" size="sm" className="me-2 mb-1 mb-md-0" onClick={() => handleEditArticle(article)}><PencilSquare /> Edit</Button>
                            <Button variant="danger" size="sm" onClick={() => handleDeleteArticle(article.id)}><Trash /> Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
                {totalPages > 1 && (
                  <Card.Footer className="d-flex justify-content-center">
                    <SharedPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange}/>
                  </Card.Footer>
                )}
              </Card>
            )}
          </Container>
          <CreateEditArticleModal show={showModal} handleClose={handleModalClose} article={editingArticle} onSave={handleModalSave}/>
        </Container>
      );
    };
    export default AdminPage;
    