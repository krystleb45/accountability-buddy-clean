import z from "zod"

export function getFileSchema(fieldName: string) {
  return z
    .union([
      z
        .instanceof(File, { message: `${fieldName} is required` })
        // File should not be empty and max 5MB
        .refine(
          (file) => !file || file.size !== 0 || file.size <= 1024 * 1024 * 5,
          {
            message: "Max size exceeded",
          },
        ),
      z.string(), // to hold default image
    ])
    .refine((value) => value instanceof File || typeof value === "string", {
      message: `${fieldName} is required`,
    })
}
