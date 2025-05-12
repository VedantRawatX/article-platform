    // File: src/services/apiService.ts

    // Base URL for the backend API, configurable via environment variables.
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

    // --- Reusable API Response Handler ---
    /**
     * Handles the response from a fetch request.
     * Parses JSON and throws an error for non-ok statuses.
     * Handles 204 No Content responses gracefully.
     * @param response - The Response object from a fetch call.
     * @returns A promise that resolves with the parsed JSON data or a success indicator for 204.
     */
    async function handleApiResponse(response: Response) {
      if (response.status === 204) { // Handle No Content response
        return { success: true, message: 'Operation successful.' }; // Or simply null
      }
      const data = await response.json(); // Try to parse JSON for all other cases
      if (!response.ok) {
        let errorMessage = `API request failed with status: ${response.status}`;
        // Attempt to extract a more specific error message from the response body
        if (typeof data === 'object' && data !== null && 'message' in data && data.message) {
          errorMessage = Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
        } else if (typeof data === 'object' && data !== null && 'error' in data && data.error) {
          errorMessage = String(data.error);
        }
        throw new Error(errorMessage);
      }
      return data;
    }

    // --- Authentication Related Types and Functions ---

    /**
     * Credentials for user login.
     */
    interface LoginCredentials {
      email: string;
      password: string;
    }

    /**
     * Data Transfer Object for user registration.
     * Matches the backend's RegisterUserDto.
     */
    export interface RegisterUserDto {
        email: string;
        password: string;
        firstName: string; // Mandatory
        lastName: string;  // Mandatory
    }

    /**
     * Represents the structure of a user object from the API.
     */
    export interface ApiUser {
      id: string;
      email: string;
      role: string;
      firstName?: string; // Optional as it might not always be present or needed everywhere
      lastName?: string;  // Optional
    }

    /**
     * Expected response structure after successful login or registration.
     */
    export interface LoginResponse {
      accessToken: string;
      user: ApiUser;
    }

    // --- NEW: Profile Management DTOs ---
    /**
     * Data Transfer Object for updating user profile information.
     * Matches the backend's UpdateProfileDto.
     */
    export interface UpdateUserProfileDto {
        firstName?: string;
        lastName?: string;
        email?: string;
    }

    /**
     * Data Transfer Object for changing user password.
     * Matches the backend's ChangePasswordDto.
     */
    export interface ChangeUserPasswordDto {
        currentPassword: string;
        newPassword: string;
    }
    // --- END NEW: Profile Management DTOs ---


    /**
     * Logs in a user.
     * @param credentials - User's email and password.
     * @returns A promise with access token and user data.
     */
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

    /**
     * Registers a new user.
     * @param userData - User registration data (email, password, names).
     * @returns A promise with access token and user data (same as login response).
     */
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

    /**
     * Fetches the profile of the currently authenticated user.
     * @param token - JWT authentication token.
     * @returns A promise with the user's profile data.
     */
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

    // --- NEW: Profile Management API Functions ---
    /**
     * Updates the current user's profile information.
     * @param profileData - The data to update (firstName, lastName, email).
     * @param token - The JWT authentication token.
     * @returns A promise that resolves with the updated user data.
     */
    export const updateUserProfile = async (profileData: UpdateUserProfileDto, token: string): Promise<ApiUser> => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });
            return await handleApiResponse(response) as ApiUser;
        } catch (error) {
            console.error('Error updating user profile:', error);
            if (error instanceof Error) throw error;
            throw new Error('An unknown error occurred while updating profile.');
        }
    };

    /**
     * Changes the current user's password.
     * @param passwordData - Contains currentPassword and newPassword.
     * @param token - The JWT authentication token.
     * @returns A promise that resolves with a success message object.
     */
    export const changeUserPassword = async (passwordData: ChangeUserPasswordDto, token: string): Promise<{ message: string }> => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(passwordData),
            });
            return await handleApiResponse(response) as { message: string };
        } catch (error) {
            console.error('Error changing password:', error);
            if (error instanceof Error) throw error;
            throw new Error('An unknown error occurred while changing password.');
        }
    };
    // --- END NEW: Profile Management API Functions ---


    // --- Article Related Types and Functions ---

    /**
     * Represents the structure of an article object from the API.
     */
    export interface Article {
      id: string;
      title: string;
      body: string;
      imageUrl?: string;
      category: string; // Should match ArticleCategory enum values from backend
      tags: string[];
      likes: number;
      isPublished: boolean;
      createdAt: string; // ISO 8601 date string
      updatedAt: string; // ISO 8601 date string
      currentUserHasLiked?: boolean;
      currentUserHasSaved?: boolean;
    }

    /**
     * Structure for paginated article responses.
     */
    export interface PaginatedArticles {
        data: Article[]; // Array of articles for the current page
        total: number;   // Total number of articles matching criteria
        page: number;    // Current page number
        limit: number;   // Number of items per page
        totalPages: number; // Total number of pages
    }

    /**
     * DTO for creating a new article.
     */
    export interface CreateArticleDto {
        title: string;
        body: string;
        imageUrl?: string;
        category: string; // Should match ArticleCategory enum values
        tags: string[];
        isPublished?: boolean;
    }

    /**
     * DTO for updating an existing article. All fields are optional.
     */
    export interface UpdateArticleDto {
        title?: string;
        body?: string;
        imageUrl?: string;
        category?: string; // Should match ArticleCategory enum values
        tags?: string[];
        isPublished?: boolean;
    }

    // Types for article sorting and filtering parameters
    export type ArticleSortBy = 'createdAt' | 'title' | 'likes' | 'updatedAt' | 'category' | 'isPublished';
    export type ArticleSortDirection = 'ASC' | 'DESC';
    export type ArticleCategoryFilter = 'Tech' | 'News' | 'General' | ''; // '' implies 'all'
    export type PublishedStatusFilter = 'true' | 'false' | 'all';


    /**
     * Fetches published articles with pagination, search, filter, and sort options.
     * @param token - Optional JWT for fetching user-specific like/save status on articles.
     */
    export const fetchPublishedArticles = async (
        page = 1, limit = 9, search?: string, category?: ArticleCategoryFilter,
        tags?: string, sortBy: ArticleSortBy = 'createdAt', sortDirection: ArticleSortDirection = 'DESC',
        token?: string | null // Optional token
    ): Promise<PaginatedArticles> => {
      try {
        const queryParams = new URLSearchParams({
            page: String(page), limit: String(limit), sortBy: sortBy, sortDirection: sortDirection,
        });
        if (search) queryParams.append('search', search);
        if (category) queryParams.append('category', category);
        if (tags) queryParams.append('tags', tags);

        const headers: HeadersInit = {};
        if (token) { headers['Authorization'] = `Bearer ${token}`; }

        const response = await fetch(`${API_BASE_URL}/articles?${queryParams.toString()}`, { headers });
        return await handleApiResponse(response) as PaginatedArticles;
      } catch (error) {
        console.error('Error fetching published articles:', error);
        if (error instanceof Error) throw error;
        throw new Error('An unknown error occurred while fetching published articles.');
      }
    };

    /**
     * Fetches a single article by its ID.
     * @param token - Optional JWT for fetching user-specific like/save status.
     */
    export const fetchArticleById = async (articleId: string, token?: string | null): Promise<Article> => {
      try {
        const headers: HeadersInit = {};
        if (token) { headers['Authorization'] = `Bearer ${token}`; }
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, { headers });
        return await handleApiResponse(response) as Article;
      } catch (error) {
        console.error(`Error fetching article ${articleId}:`, error);
        if (error instanceof Error) throw error;
        throw new Error(`An unknown error occurred while fetching article ${articleId}.`);
      }
    };

    /**
     * Toggles the like status of an article for the authenticated user.
     */
    export const likeArticle = async (articleId: string, token: string): Promise<Article> => {
      try {
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}/like`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        return await handleApiResponse(response) as Article;
      } catch (error) {
        console.error(`Error liking article ${articleId}:`, error);
        if (error instanceof Error) throw error;
        throw new Error(`An unknown error occurred while liking article ${articleId}.`);
      }
    };

    /**
     * Toggles the save status of an article for the authenticated user.
     */
    export const toggleSaveArticle = async (articleId: string, token: string): Promise<Article> => {
        try {
            const response = await fetch(`${API_BASE_URL}/articles/${articleId}/save`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            return await handleApiResponse(response) as Article;
        } catch (error) {
            console.error(`Error saving/unsaving article ${articleId}:`, error);
            if (error instanceof Error) throw error;
            throw new Error(`An unknown error occurred while saving/unsaving article ${articleId}.`);
        }
    };

    /**
     * Fetches articles saved by the authenticated user.
     */
    export const fetchSavedArticles = async (token: string, page = 1, limit = 10): Promise<PaginatedArticles> => {
        try {
            const queryParams = new URLSearchParams({ page: String(page), limit: String(limit) });
            const response = await fetch(`${API_BASE_URL}/articles/user/saved?${queryParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            return await handleApiResponse(response) as PaginatedArticles;
        } catch (error) {
            console.error('Error fetching saved articles:', error);
            if (error instanceof Error) throw error;
            throw new Error('An unknown error occurred while fetching saved articles.');
        }
    };

    // --- Admin Article Management Functions ---
    /**
     * Fetches all articles (including drafts) for admin view, with pagination and filters.
     */
    export const fetchAllArticlesAdmin = async (
        token: string, page = 1, limit = 10, search?: string, category?: ArticleCategoryFilter,
        tags?: string, publishedStatus?: PublishedStatusFilter, sortBy: ArticleSortBy = 'createdAt',
        sortDirection: ArticleSortDirection = 'DESC'
    ): Promise<PaginatedArticles> => {
        try {
            const queryParams = new URLSearchParams({
                page: String(page), limit: String(limit), sortBy: sortBy, sortDirection: sortDirection,
            });
            if (search) queryParams.append('search', search);
            if (category) queryParams.append('category', category);
            if (tags) queryParams.append('tags', tags);
            if (publishedStatus && publishedStatus !== 'all') { queryParams.append('publishedStatus', publishedStatus); }

            const response = await fetch(`${API_BASE_URL}/articles/all?${queryParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            return await handleApiResponse(response) as PaginatedArticles;
        } catch (error) {
            console.error('Error fetching all articles for admin:', error);
            if (error instanceof Error) throw error;
            throw new Error('An unknown error occurred while fetching all articles for admin.');
        }
    };

    /**
     * Creates a new article (admin).
     */
    export const createArticle = async (articleData: CreateArticleDto, token: string): Promise<Article> => {
        try {
            const response = await fetch(`${API_BASE_URL}/articles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify(articleData)
            });
            return await handleApiResponse(response) as Article;
        } catch (error) {
            console.error('Error creating article:', error);
            if (error instanceof Error) throw error;
            throw new Error('An unknown error occurred while creating the article.');
        }
    };

    /**
     * Updates an existing article (admin).
     */
    export const updateArticle = async (articleId: string, articleData: UpdateArticleDto, token: string): Promise<Article> => {
        try {
            const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify(articleData)
            });
            return await handleApiResponse(response) as Article;
        } catch (error) {
            console.error(`Error updating article ${articleId}:`, error);
            if (error instanceof Error) throw error;
            throw new Error(`An unknown error occurred while updating article ${articleId}.`);
        }
    };

    /**
     * Deletes an article (admin).
     */
    export const deleteArticle = async (articleId: string, token: string): Promise<null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await handleApiResponse(response) as null;
        } catch (error) {
            console.error(`Error deleting article ${articleId}:`, error);
            if (error instanceof Error) throw error;
            throw new Error(`An unknown error occurred while deleting article ${articleId}.`);
        }
    };
    