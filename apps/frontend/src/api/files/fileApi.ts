// src/files/fileApi.ts

import type { AxiosProgressEvent, AxiosRequestConfig } from "axios"

import axios from "axios"

import { http } from "@/utils/http"

export interface FileApiResponse {
  success: boolean
  message: string
  fileUrl?: string
}

/**
 * Upload a file to the server.
 * @param file              The File to upload.
 * @param onUploadProgress  Optional callback for progress events.
 */
export async function uploadFile(
  file: File,
  onUploadProgress?: (progress: AxiosProgressEvent) => void,
): Promise<FileApiResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const config: AxiosRequestConfig = {
    headers: { "Content-Type": "multipart/form-data" },
    ...(onUploadProgress ? { onUploadProgress } : {}),
  }

  try {
    const response = await http.post<FileApiResponse>(
      "/files/upload",
      formData,
      config,
    )
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ [fileApi::uploadFile]",
        error.response?.data || error.message,
      )
      return {
        success: false,
        message: (error.response?.data as any)?.message || error.message,
      }
    }
    console.error("❌ [fileApi::uploadFile]", error)
    return { success: false, message: "An unknown error occurred." }
  }
}

/**
 * Delete an uploaded file by name.
 * @param fileName  The server key or filename to delete.
 */
export async function deleteFile(fileName: string): Promise<boolean> {
  if (!fileName) {
    console.error("❌ [fileApi::deleteFile] fileName is required.")
    return false
  }
  try {
    await http.delete(`/files/${encodeURIComponent(fileName)}`)
    return true
  } catch (error) {
    console.error("❌ [fileApi::deleteFile]", error)
    return false
  }
}

export default { uploadFile, deleteFile }
