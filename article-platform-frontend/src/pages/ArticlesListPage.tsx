    // File: src/pages/ArticlesListPage.tsx
    import ArticleCard from '../components/article/ArticleCard';
    import React, { useState, useEffect, useCallback, type ChangeEvent, useRef } from 'react';
    import Container from 'react-bootstrap/Container';
    import Row from 'react-bootstrap/Row';
    import Col from 'react-bootstrap/Col';
    import Card from 'react-bootstrap/Card';
    import Button from 'react-bootstrap/Button';
    import Alert from 'react-bootstrap/Alert';
    import Spinner from 'react-bootstrap/Spinner';
    import Nav from 'react-bootstrap/Nav';
    import { LinkContainer } from 'react-router-bootstrap';
    import { fetchPublishedArticles } from '../services/ApiService';
    import type { Article, PaginatedArticles, ArticleSortBy, ArticleSortDirection, ArticleCategoryFilter, PublishedStatusFilter } from '../services/ApiService';
    import FilterControls, { type FilterValues } from '../components/shared/FilterControls';
    import SharedPagination from '../components/shared/SharedPagination';

    const ITEMS_PER_PAGE = 8;

    const ArticlesListPage: React.FC = () => {
      const [articles, setArticles] = useState<Article[]>([]);
      const [loading, setLoading] = useState<boolean>(true);
      const [error, setError] = useState<string | null>(null);

      const [currentPage, setCurrentPage] = useState(1);
      const [totalPages, setTotalPages] = useState(0);
      const [totalArticles, setTotalArticles] = useState(0);

      const [filters, setFilters] = useState<Partial<FilterValues>>({
        searchTerm: '',
        selectedCategory: '',
        tagsFilter: '', // This will hold the live input for tags
        sortBy: 'createdAt',
        sortDirection: 'DESC',
      });
      const [appliedTagsFilter, setAppliedTagsFilter] = useState<string>(''); // Tags applied to the query
      const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

      const isInitialMount = useRef(true);

      // Debounce search term
      useEffect(() => {
        const handler = setTimeout(() => {
          if (filters.searchTerm !== debouncedSearchTerm) {
            setDebouncedSearchTerm(filters.searchTerm || '');
            if (currentPage !== 1) setCurrentPage(1); // Reset page on new debounced search
          }
        }, 500);
        return () => clearTimeout(handler);
      }, [filters.searchTerm, debouncedSearchTerm, currentPage]);


      const loadArticles = useCallback(async (pageToFetch: number) => {
        console.log(`Frontend (ArticlesList): Requesting page: ${pageToFetch}, search: '${debouncedSearchTerm}', category: '${filters.selectedCategory}', tags: '${appliedTagsFilter}', sort: ${filters.sortBy} ${filters.sortDirection}`);
        try {
          setLoading(true); setError(null);
          const paginatedResponse: PaginatedArticles = await fetchPublishedArticles(
            pageToFetch,
            ITEMS_PER_PAGE,
            debouncedSearchTerm,
            filters.selectedCategory,
            appliedTagsFilter, // Use applied tags filter for the API call
            filters.sortBy,
            filters.sortDirection
          );
          setArticles(paginatedResponse.data);
          setTotalArticles(paginatedResponse.total);
          setTotalPages(paginatedResponse.totalPages);
          // setCurrentPage(paginatedResponse.page); // Backend confirms the page
        } catch (err) {
           if (err instanceof Error) setError(err.message);
           else setError('An unknown error occurred while fetching articles.');
           console.error("ArticlesListPage fetch error:", err);
        } finally {
          setLoading(false);
        }
      }, [debouncedSearchTerm, filters.selectedCategory, appliedTagsFilter, filters.sortBy, filters.sortDirection]); // Depend on appliedTagsFilter

      // Main useEffect for loading articles
      useEffect(() => {
        // Only load if not initial mount or if critical dependencies change
        if (!isInitialMount.current || currentPage !== 1) {
            loadArticles(currentPage);
        } else if (isInitialMount.current) {
            loadArticles(1); // Initial load
            isInitialMount.current = false;
        }
      }, [currentPage, loadArticles]); // loadArticles changes if its dependencies change

      // Effect to reset page to 1 when filters (excluding live searchTerm/tagsFilter) or sort change
      // This effect will run when debouncedSearchTerm or appliedTagsFilter changes too.
      useEffect(() => {
        if (!isInitialMount.current) { // Don't reset on initial mount
            console.log("Filter or sort changed, resetting to page 1");
            setCurrentPage(1);
        }
      }, [debouncedSearchTerm, filters.selectedCategory, appliedTagsFilter, filters.sortBy, filters.sortDirection]);


      const handleFilterStateChange = (newFilterValues: Partial<FilterValues>) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilterValues }));
      };

      const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        // Only update searchTerm, debounce effect will handle the rest
        setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
      };
      const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => handleFilterStateChange({ selectedCategory: e.target.value as ArticleCategoryFilter });
      
      // For tags, update the live input state, don't trigger API call directly
      const handleTagsInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, tagsFilter: e.target.value }));
      };
      
      // Apply tags filter when the "Apply" button is clicked
      const handleTagsApply = () => {
        setAppliedTagsFilter(filters.tagsFilter || ''); // This will trigger the useEffect for page reset if needed
      };
      
      const handleSortByChange = (e: ChangeEvent<HTMLSelectElement>) => handleFilterStateChange({ sortBy: e.target.value as ArticleSortBy });
      const toggleSortDirection = () => handleFilterStateChange({ sortDirection: filters.sortDirection === 'ASC' ? 'DESC' : 'ASC' });

      const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
      };

      if (loading && articles.length === 0) { return (<Container className="text-center py-5"><Spinner animation="border" /><p>Loading...</p></Container>); }

      return (
        <Container className="py-5">
          <Row className="mb-4 align-items-center">
            <Col md={8}><h1 className="display-5 fw-bold">All Articles</h1></Col>
            <Col md={4} className="text-md-end">
                {totalArticles > 0 && <span className="text-muted">{totalArticles} articles found</span>}
            </Col>
          </Row>

          <FilterControls
            isAdminPage={false}
            filters={{
                searchTerm: filters.searchTerm || '',
                selectedCategory: filters.selectedCategory || '',
                tagsFilter: filters.tagsFilter || '', // Pass live tags input to FilterControls
                sortBy: filters.sortBy || 'createdAt',
                sortDirection: filters.sortDirection || 'DESC',
            }}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onTagsChange={handleTagsInputChange} // Use specific handler for live input
            onTagsApply={handleTagsApply} // Pass the apply handler
            onSortByChange={handleSortByChange}
            onToggleSortDirection={toggleSortDirection}
          />

          {error && <Alert variant="danger" className="text-center mt-3">{error}</Alert>}
          {loading && articles.length > 0 && (<div className="text-center my-3"><Spinner size="sm" /> Loading...</div>)}
          {!loading && articles.length === 0 && !error && (<Alert variant="info" className="text-center mt-3">No articles match your criteria.</Alert>)}

          <Row xs={1} md={2} lg={3} xl={4} className="g-4 mt-0">
            {articles.map((article) => (
              <Col key={article.id}><ArticleCard article={article} /></Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4 pt-2">
              <SharedPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange}/>
            </div>
          )}
        </Container>
      );
    };
    export default ArticlesListPage;
    