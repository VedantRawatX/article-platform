    // File: src/components/shared/FilterControls.tsx
    import React, { type ChangeEvent } from 'react';
    import Form from 'react-bootstrap/Form';
    import InputGroup from 'react-bootstrap/InputGroup';
    import Button from 'react-bootstrap/Button';
    import Row from 'react-bootstrap/Row';
    import Col from 'react-bootstrap/Col';
    import Card from 'react-bootstrap/Card';
    import { Search, FunnelFill, SortDown, SortUp } from 'react-bootstrap-icons';
    import type {
    ArticleSortBy,
    ArticleSortDirection,
    ArticleCategoryFilter,
    PublishedStatusFilter // Assuming this is also exported from apiService or defined commonly
} from '../../services/ApiService'; // Adjust path as needed
 // Adjust path as needed

    // Define available options (can be passed as props or defined here if static)
    const CATEGORY_OPTIONS: ArticleCategoryFilter[] = ['Tech', 'News', 'General', '']; // '' for All
    const PUBLISHED_STATUS_OPTIONS: { value: PublishedStatusFilter, label: string }[] = [
        { value: 'all', label: 'All Statuses' },
        { value: 'true', label: 'Published' },
        { value: 'false', label: 'Drafts' },
    ];
    const BASE_SORT_BY_OPTIONS: { value: ArticleSortBy, label: string }[] = [
        { value: 'createdAt', label: 'Date Created' },
        { value: 'updatedAt', label: 'Last Updated' },
        { value: 'title', label: 'Title' },
        { value: 'likes', label: 'Popularity' },
    ];
    const ADMIN_SPECIFIC_SORT_OPTIONS: { value: ArticleSortBy, label: string }[] = [
        { value: 'category', label: 'Category' },
        { value: 'isPublished', label: 'Status' },
    ];

    export interface FilterValues {
        searchTerm: string;
        selectedCategory: ArticleCategoryFilter;
        tagsFilter: string;
        publishedStatusFilter?: PublishedStatusFilter; // Optional for non-admin
        sortBy: ArticleSortBy;
        sortDirection: ArticleSortDirection;
    }

    interface FilterControlsProps {
        isAdminPage: boolean;
        filters: FilterValues;
        onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
        onCategoryChange: (e: ChangeEvent<HTMLSelectElement>) => void;
        onTagsChange: (e: ChangeEvent<HTMLInputElement>) => void;
        onTagsApply: () => void;
        onPublishedStatusChange?: (e: ChangeEvent<HTMLSelectElement>) => void; // Optional for non-admin
        onSortByChange: (e: ChangeEvent<HTMLSelectElement>) => void;
        onToggleSortDirection: () => void;
    }

    const FilterControls: React.FC<FilterControlsProps> = ({
        isAdminPage,
        filters,
        onSearchChange,
        onCategoryChange,
        onTagsChange,
        onTagsApply,
        onPublishedStatusChange,
        onSortByChange,
        onToggleSortDirection,
    }) => {
        const sortByOptions = isAdminPage
            ? [...BASE_SORT_BY_OPTIONS, ...ADMIN_SPECIFIC_SORT_OPTIONS]
            : BASE_SORT_BY_OPTIONS;

        return (
            <Card className="p-3 mb-4 shadow-sm">
                <Row className="g-3 align-items-end">
                    {/* Search Term */}
                    <Col md={isAdminPage ? 3 : 4} sm={12}> {/* Adjust width based on admin page */}
                        <Form.Group controlId="filterControlSearch">
                            <Form.Label>Search</Form.Label>
                            <InputGroup>
                                <InputGroup.Text><Search /></InputGroup.Text>
                                <Form.Control
                                    type="search"
                                    placeholder="Title or body..."
                                    value={filters.searchTerm}
                                    onChange={onSearchChange}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>

                    {/* Category Filter */}
                    <Col md={2} sm={6}>
                        <Form.Group controlId="filterControlCategory">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                                value={filters.selectedCategory}
                                onChange={onCategoryChange}
                            >
                                <option value="">All Categories</option>
                                {CATEGORY_OPTIONS.filter(c => c).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Published Status Filter (Admin Only) */}
                    {isAdminPage && onPublishedStatusChange && (
                        <Col md={2} sm={6}>
                            <Form.Group controlId="filterControlPublishedStatus">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={filters.publishedStatusFilter || 'all'}
                                    onChange={onPublishedStatusChange}
                                >
                                    {PUBLISHED_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    )}

                    {/* Tags Filter */}
                    <Col md={isAdminPage ? 2 : 3} sm={isAdminPage ? 6 : 12}>
                         <Form.Group controlId="filterControlTags">
                            <Form.Label>Tags</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g., react,node"
                                    value={filters.tagsFilter}
                                    onChange={onTagsChange}
                                />
                                <Button variant="outline-secondary" onClick={onTagsApply}><FunnelFill /></Button>
                            </InputGroup>
                        </Form.Group>
                    </Col>

                    {/* Sort Options */}
                    <Col md={isAdminPage ? 3 : 3} sm={isAdminPage ? 6 : 12}>
                        <Form.Group controlId="filterControlSort">
                            <Form.Label>Sort By</Form.Label>
                            <InputGroup>
                                <Form.Select value={filters.sortBy} onChange={onSortByChange} size="sm">
                                    {sortByOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </Form.Select>
                                <Button
                                    variant="outline-secondary"
                                    onClick={onToggleSortDirection}
                                    size="sm"
                                    title={`Sort ${filters.sortDirection === 'ASC' ? 'Descending' : 'Ascending'}`}
                                >
                                    {filters.sortDirection === 'ASC' ? <SortUp /> : <SortDown />}
                                </Button>
                            </InputGroup>
                        </Form.Group>
                    </Col>
                </Row>
            </Card>
        );
    };

    export default FilterControls;
    