// src/services/bookService.ts
import axios from 'axios';
import { http } from '@/utils/http';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  coverImage?: string;
  likes: number;
  comments: {
    id: string;
    user: string;
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const handleError = <T>(fn: string, error: unknown, fallback: T): T => {
  if (axios.isAxiosError(error)) {
    console.error(`? [bookService::${fn}]`, error.response?.data || error.message);
  } else {
    console.error(`? [bookService::${fn}]`, error);
  }
  return fallback;
};

const bookService = {
  /** POST /api/books */
  async add(
    title: string,
    author: string,
    category: string,
    description: string,
    coverImage?: string,
  ): Promise<ApiResponse<{ book: Book }>> {
    try {
      const res = await http.post<ApiResponse<{ book: Book }>>('/books', {
        title,
        author,
        category,
        description,
        coverImage,
      });
      return res.data;
    } catch (err) {
      return handleError('add', err, { success: false, message: 'Failed to add book' });
    }
  },

  /** GET /api/books */
  async list(): Promise<ApiResponse<{ books: Book[] }>> {
    try {
      const res = await http.get<ApiResponse<{ books: Book[] }>>('/books');
      return res.data;
    } catch (err) {
      const books = handleError('list', err, [] as Book[]);
      return {
        success: false,
        data: { books },
        message: 'Failed to fetch books',
      };
    }
  },

  /** GET /api/books/:id */
  async getById(id: string): Promise<ApiResponse<{ book: Book }>> {
    if (!id) return { success: false, message: 'Book ID is required' };
    try {
      const res = await http.get<ApiResponse<{ book: Book }>>(`/books/${id}`);
      return res.data;
    } catch (err) {
      return handleError('getById', err, { success: false, message: 'Failed to fetch book' });
    }
  },

  /** PUT /api/books/:id */
  async update(
    id: string,
    data: Partial<Pick<Book, 'title' | 'author' | 'category' | 'description' | 'coverImage'>>,
  ): Promise<ApiResponse<{ book: Book }>> {
    if (!id) return { success: false, message: 'Book ID is required' };
    try {
      const res = await http.put<ApiResponse<{ book: Book }>>(`/books/${id}`, data);
      return res.data;
    } catch (err) {
      return handleError('update', err, { success: false, message: 'Failed to update book' });
    }
  },

  /** DELETE /api/books/:id */
  async remove(id: string): Promise<ApiResponse<null>> {
    if (!id) return { success: false, message: 'Book ID is required' };
    try {
      const res = await http.delete<ApiResponse<null>>(`/books/${id}`);
      return res.data;
    } catch (err) {
      return handleError('remove', err, { success: false, message: 'Failed to delete book' });
    }
  },

  /** POST /api/books/:id/like */
  async like(id: string): Promise<ApiResponse<{ book: Book }>> {
    if (!id) return { success: false, message: 'Book ID is required' };
    try {
      const res = await http.post<ApiResponse<{ book: Book }>>(`/books/${id}/like`);
      return res.data;
    } catch (err) {
      return handleError('like', err, { success: false, message: 'Failed to like book' });
    }
  },

  /** POST /api/books/:id/unlike */
  async unlike(id: string): Promise<ApiResponse<{ book: Book }>> {
    if (!id) return { success: false, message: 'Book ID is required' };
    try {
      const res = await http.post<ApiResponse<{ book: Book }>>(`/books/${id}/unlike`);
      return res.data;
    } catch (err) {
      return handleError('unlike', err, { success: false, message: 'Failed to unlike book' });
    }
  },

  /** POST /api/books/:id/comment */
  async addComment(id: string, text: string): Promise<ApiResponse<{ book: Book }>> {
    if (!id || !text) return { success: false, message: 'Book ID and text are required' };
    try {
      const res = await http.post<ApiResponse<{ book: Book }>>(`/books/${id}/comment`, { text });
      return res.data;
    } catch (err) {
      return handleError('addComment', err, { success: false, message: 'Failed to comment' });
    }
  },

  /** DELETE /api/books/:id/comment/:commentId */
  async removeComment(id: string, commentId: string): Promise<ApiResponse<{ book: Book }>> {
    if (!id || !commentId) {
      return { success: false, message: 'Book ID and comment ID are required' };
    }
    try {
      const res = await http.delete<ApiResponse<{ book: Book }>>(
        `/books/${id}/comment/${commentId}`,
      );
      return res.data;
    } catch (err) {
      return handleError('removeComment', err, {
        success: false,
        message: 'Failed to remove comment',
      });
    }
  },
};

export default bookService;
