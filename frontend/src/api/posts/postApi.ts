// src/posts/postApi.ts

import axios from 'axios'; // for axios.isAxiosError type-guard
import { http } from '@/utils/http';

// ---------------------
// Type Definitions
// ---------------------

/** A comment on a post */
export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

/** A user-generated post */
export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: Comment[];
}

// ---------------------
// Error Handling
// ---------------------

function handleError(error: unknown, functionName: string): never {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message ?? 'An unknown API error occurred.';
    console.error(`API Error in ${functionName}:`, msg);
    throw new Error(msg);
  } else if (error instanceof Error) {
    console.error(`Error in ${functionName}:`, error.message);
    throw error;
  } else {
    console.error(`Unknown error in ${functionName}:`, error);
    throw new Error('An unknown error occurred.');
  }
}

// ---------------------
// API Methods
// ---------------------

/** GET /posts */
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const response = await http.get<Post[]>('/posts');
    return response.data;
  } catch (error) {
    handleError(error, 'fetchPosts');
    return []; // unreachable, but satisfies TS
  }
};

/** GET /posts/:postId */
export const fetchPostById = async (postId: string): Promise<Post | null> => {
  try {
    const response = await http.get<Post>(`/posts/${encodeURIComponent(postId)}`);
    return response.data;
  } catch (error) {
    handleError(error, 'fetchPostById');
    return null;
  }
};

/** POST /posts */
export const createPost = async (postData: Partial<Post>): Promise<Post | null> => {
  try {
    const response = await http.post<Post>('/posts', postData);
    return response.data;
  } catch (error) {
    handleError(error, 'createPost');
    return null;
  }
};

/** PUT /posts/:postId */
export const updatePost = async (postId: string, postData: Partial<Post>): Promise<Post | null> => {
  try {
    const response = await http.put<Post>(`/posts/${encodeURIComponent(postId)}`, postData);
    return response.data;
  } catch (error) {
    handleError(error, 'updatePost');
    return null;
  }
};

/** DELETE /posts/:postId */
export const deletePost = async (postId: string): Promise<{ message: string } | null> => {
  try {
    const response = await http.delete<{ message: string }>(`/posts/${encodeURIComponent(postId)}`);
    return response.data;
  } catch (error) {
    handleError(error, 'deletePost');
    return null;
  }
};

/** POST /posts/:postId/like */
export const likePost = async (postId: string): Promise<Post | null> => {
  try {
    const response = await http.post<Post>(`/posts/${encodeURIComponent(postId)}/like`);
    return response.data;
  } catch (error) {
    handleError(error, 'likePost');
    return null;
  }
};

/** POST /posts/:postId/comment */
export const commentOnPost = async (
  postId: string,
  commentData: { content: string },
): Promise<Comment | null> => {
  try {
    const response = await http.post<Comment>(
      `/posts/${encodeURIComponent(postId)}/comment`,
      commentData,
    );
    return response.data;
  } catch (error) {
    handleError(error, 'commentOnPost');
    return null;
  }
};
