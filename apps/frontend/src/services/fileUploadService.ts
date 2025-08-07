// src/services/fileUploadService.ts
import axios from "axios"

import { http } from "@/lib/http"

export interface UploadResponse {
  url: string
  fileName: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

function handleError<T>(
  fn: string,
  error: unknown,
  fallback: ApiResponse<T>,
): ApiResponse<T> {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [fileUploadService::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [fileUploadService::${fn}]`, error)
  }
  return fallback
}

const FileUploadService = {
  /** POST /files/upload */
  async uploadFile(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const resp = await http.post<ApiResponse<UploadResponse>>(
        "/files/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      return resp.data
    } catch (err) {
      return handleError("uploadFile", err, {
        success: false,
        message: "Failed to upload file.",
        data: { url: "", fileName: "" },
      })
    }
  },

  /** DELETE /files/:fileName */
  async deleteFile(fileName: string): Promise<ApiResponse<null>> {
    if (!fileName) {
      return { success: false, message: "File name is required to delete." }
    }
    try {
      const resp = await http.delete<ApiResponse<null>>(
        `/files/${encodeURIComponent(fileName)}`,
      )
      return resp.data
    } catch (err) {
      return handleError("deleteFile", err, {
        success: false,
        message: "Failed to delete file.",
      })
    }
  },
}

export default FileUploadService
