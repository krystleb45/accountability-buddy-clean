// src/context/data/APIContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { http } from '@/utils/http';
import { STATUS_CODES } from '@/constants/statusCodes';
import { RESPONSE_ERROR_MESSAGES } from '@/constants/responseMessages';

interface APIContextType {
  isLoading: boolean;
  apiError: string | null;
  callAPI: <T = unknown>(config: AxiosRequestConfig) => Promise<T>;
  clearApiError: () => void;
}

const APIContext = createContext<APIContextType | undefined>(undefined);

export const useAPI = (): APIContextType => {
  const ctx = useContext(APIContext);
  if (!ctx) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return ctx;
};

export const APIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const callAPI = useCallback(async <T,>(config: AxiosRequestConfig): Promise<T> => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await http.request<T>(config);
      return response.data;
    } catch (err: unknown) {
      // Start with a generic server-error message
      let message: string = RESPONSE_ERROR_MESSAGES.SERVER_ERROR;

      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        if (status === STATUS_CODES.UNAUTHORIZED) {
          message = RESPONSE_ERROR_MESSAGES.ACCESS_DENIED;
        } else if (status === STATUS_CODES.NOT_FOUND) {
          message = RESPONSE_ERROR_MESSAGES.RESOURCE_NOT_FOUND;
        }
      }

      setApiError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearApiError = useCallback(() => {
    setApiError(null);
  }, []);

  return (
    <APIContext.Provider value={{ isLoading, apiError, callAPI, clearApiError }}>
      {children}
    </APIContext.Provider>
  );
};

export default APIProvider;
