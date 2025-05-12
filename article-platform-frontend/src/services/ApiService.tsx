    // File: src/services/apiService.ts

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

    // --- Reusable Error Handling Function ---
    async function handleApiResponse(response: Response) {
      if (response.status === 204) {
        return null;
      }
      const data = await response.json();
      if (!response.ok) {
        let errorMessage = `API request failed with status: ${response.status}`;
        if (typeof data === 'object' && data !== null && 'message' in data && data.message) {
          errorMessage = Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
        } else if (typeof data === 'object' && data !== null && 'error' in data && data.error) {
          errorMessage = String(data.error);
        }
        throw new Error(errorMessage);
      }
      return data;
    }

    // --- Auth Related Types and Functions ---
    interface LoginCredentials {
      email: string;
      password: string;
    }

    export interface RegisterUserDto {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }

    export interface ApiUser {
      id: string;
      email: string;
      role: string;
      firstName?: string;
      lastName?: string;
    }

    export interface LoginResponse {
      accessToken: string;
      user: ApiUser;
    }

    export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        return await handleApiResponse(response) as LoginResponse;
      } catch (error) {
        console.error('Login API error:', error);
        if (error instanceof Error) throw error;
        throw new Error('An unknown error occurred during login.');
      }
    };

    export const registerUser = async (userData: RegisterUserDto): Promise<LoginResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            return await handleApiResponse(response) as LoginResponse;
        } catch (error) {
            console.error('Registration API error:', error);
            if (error instanceof Error) throw error;
            throw new Error('An unknown error occurred during registration.');
        }
    };

    export const fetchUserProfile = async (token: string): Promise<ApiUser> => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            return await handleApiResponse(response) as ApiUser;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            if (error instanceof Error) throw error;
            throw new Error('An unknown error occurred while fetching user profile.');
        }
    };

    // --- Article Related Types and Functions ---
    export interface Article {
      id: string;
      title: string;
      body: string;
      imageUrl?: string;
      category: string;
      tags: string[];
      likes: number;
      isPublished: boolean;
      createdAt: string;
      updatedAt: string;
      currentUserHasLiked?: boolean;
      currentUserHasSaved?: boolean; // Ensure this is present
    }

    export interface PaginatedArticles {
        data: Article[]; // This should ideally be ArticleResponse[] if lists need like/save status
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }

    export interface CreateArticleDto { /* ... */ }
    export interface UpdateArticleDto { /* ... */ }
    export type ArticleSortBy = 'createdAt' | 'title' | 'likes' | 'updatedAt' | 'category' | 'isPublished';
    export type ArticleSortDirection = 'ASC' | 'DESC';
    export type ArticleCategoryFilter = 'Tech' | 'News' | 'General' | '';
    export type PublishedStatusFilter = 'true' | 'false' | 'all';


    export const fetchPublishedArticles = async (
        page = 1, limit = 9, search?: string, category?: ArticleCategoryFilter,
        tags?: string, sortBy: ArticleSortBy = 'createdAt', sortDirection: ArticleSortDirection = 'DESC',
        token?: string | null // Optionally pass token to get like/save status on list items
    ): Promise<PaginatedArticles> => {
      try {
        const queryParams = new URLSearchParams({
            page: String(page), limit: String(limit), sortBy: sortBy, sortDirection: sortDirection,
        });
        if (search) queryParams.append('search', search);
        if (category) queryParams.append('category', category);
        if (tags) queryParams.append('tags', tags);

        const headers: HeadersInit = {};
        if (token) { // If token is provided, backend's findAllPublished might use it
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/articles?${queryParams.toString()}`, { headers });
        // Assuming backend returns PaginatedArticles where data is Article[] which might include like/save status
        return await handleApiResponse(response) as PaginatedArticles;
      } catch (error) {
        console.error('Error fetching published articles:', error);
        if (error instanceof Error) throw error;
        throw new Error('An unknown error occurred while fetching published articles.');
      }
    };

    export const fetchArticleById = async (articleId: string, token?: string | null): Promise<Article> => {
      try {
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, { headers });
        return await handleApiResponse(response) as Article; // Expects Article with currentUserHasLiked/Saved
      } catch (error) {
        console.error(`Error fetching article ${articleId}:`, error);
        if (error instanceof Error) throw error;
        throw new Error(`An unknown error occurred while fetching article ${articleId}.`);
      }
    };

    export const likeArticle = async (articleId: string, token: string): Promise<Article> => {
      try {
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}/like`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        return await handleApiResponse(response) as Article; // Expects Article with updated like/save status
      } catch (error) {
        // ... error handling ...
        console.error(`Error liking article ${articleId}:`, error);
        if (error instanceof Error) throw error;
        throw new Error(`An unknown error occurred while liking article ${articleId}.`);
      }
    };

    /**
     * Sends a request to save or unsave an article. Requires authentication.
     * Corresponds to POST /api/articles/:id/save
     * @param articleId - The ID of the article to save/unsave.
     * @param token - The JWT authentication token of the user.
     * @returns A promise that resolves with the updated article data (including save status).
     */
    export const toggleSaveArticle = async (articleId: string, token: string): Promise<Article> => {
        try {
            const response = await fetch(`${API_BASE_URL}/articles/${articleId}/save`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return await handleApiResponse(response) as Article; // Expects Article with updated like/save status
        } catch (error) {
            console.error(`Error saving/unsaving article ${articleId}:`, error);
            if (error instanceof Error) throw error;
            throw new Error(`An unknown error occurred while saving/unsaving article ${articleId}.`);
        }
    };

    /**
     * Fetches all articles saved by the currently authenticated user.
     * Corresponds to GET /api/articles/user/saved (or similar)
     * @param token - The JWT authentication token of the user.
     * @param page - Page number for pagination.
     * @param limit - Items per page.
     * @returns A promise that resolves with paginated saved articles.
     */
    export const fetchSavedArticles = async (token: string, page = 1, limit = 10): Promise<PaginatedArticles> => {
        try {
            const queryParams = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });
            const response = await fetch(`${API_BASE_URL}/articles/user/saved?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return await handleApiResponse(response) as PaginatedArticles;
        } catch (error) {
            console.error('Error fetching saved articles:', error);
            if (error instanceof Error) throw error;
            throw new Error('An unknown error occurred while fetching saved articles.');
        }
    };


    // --- Admin Article Management Functions ---
    // ... (fetchAllArticlesAdmin, createArticle, updateArticle, deleteArticle remain the same)
    export const fetchAllArticlesAdmin = async (token: string, page = 1, limit = 10, search?: string, category?: ArticleCategoryFilter, tags?: string, publishedStatus?: PublishedStatusFilter, sortBy: ArticleSortBy = 'createdAt', sortDirection: ArticleSortDirection = 'DESC'): Promise<PaginatedArticles> => {
        try {
            const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), sortBy: sortBy, sortDirection: sortDirection });
            if (search) queryParams.append('search', search);
            if (category) queryParams.append('category', category);
            if (tags) queryParams.append('tags', tags);
            if (publishedStatus && publishedStatus !== 'all') { queryParams.append('publishedStatus', publishedStatus); }
            const response = await fetch(`${API_BASE_URL}/articles/all?${queryParams.toString()}`, { headers: { 'Authorization': `Bearer ${token}` }});
            return await handleApiResponse(response) as PaginatedArticles;
        } catch (error) {
            console.error('Error fetching all articles for admin:', error);
            if (error instanceof Error) throw error;
            throw new Error('An unknown error occurred while fetching all articles for admin.');
        }
    };
    export const createArticle = async (articleData: CreateArticleDto, token: string): Promise<Article> => {
        try {
            const response = await fetch(`${API_BASE_URL}/articles`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}, body: JSON.stringify(articleData) });
            return await handleApiResponse(response) as Article;
        } catch (error) {
            console.error('Error creating article:', error);
            if (error instanceof Error) throw error;
            throw new Error('An unknown error occurred while creating the article.');
        }
    };
    export const updateArticle = async (articleId: string, articleData: UpdateArticleDto, token: string): Promise<Article> => {
        try {
            const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}, body: JSON.stringify(articleData) });
            return await handleApiResponse(response) as Article;
        } catch (error) {
            console.error(`Error updating article ${articleId}:`, error);
            if (error instanceof Error) throw error;
            throw new Error(`An unknown error occurred while updating article ${articleId}.`);
        }
    };
    export const deleteArticle = async (articleId: string, token: string): Promise<null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
            return await handleApiResponse(response) as null;
        } catch (error) {
            console.error(`Error deleting article ${articleId}:`, error);
            if (error instanceof Error) throw error;
            throw new Error(`An unknown error occurred while deleting article ${articleId}.`);
        }
    };
    