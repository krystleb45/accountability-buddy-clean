import { Router } from "express"
import z from "zod"

import { protect } from "../middleware/auth-middleware.js"
import { requireAdmin } from "../middleware/require-admin.js"
import validate from "../middleware/validation-middleware.js"
import { Blog } from "../models/Blog.js"
import sendResponse from "../utils/sendResponse.js"
import { FileUploadService } from "../services/file-upload-service.js"

const router = Router()

// ─── ADMIN ROUTES (must be before /:slug) ─────────────────────

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1).max(300, "Excerpt must be under 300 characters"),
  coverImage: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  tags: z.array(z.string()).default([]),
  slug: z.string().optional(),
})

/**
 * GET /api/blog/admin/all
 * Get all blog posts including drafts (admin only)
 */
router.get("/admin/all", protect, requireAdmin, async (req, res) => {
  const posts = await Blog.find()
    .populate("author", "username")
    .sort({ createdAt: -1 })
    .exec()

  sendResponse(res, 200, true, "All blog posts fetched", { posts })
})

/**
 * GET /api/blog/admin/:id
 * Get a single blog post by ID for editing (admin only)
 */
router.get("/admin/:id", protect, requireAdmin, async (req, res) => {
  const post = await Blog.findById(req.params.id)
    .populate("author", "username")
    .exec()

  if (!post) {
    return sendResponse(res, 404, false, "Blog post not found", null)
  }

  sendResponse(res, 200, true, "Blog post fetched", { post })
})

/**
 * POST /api/blog/admin
 * Create a new blog post (admin only)
 */
router.post(
  "/admin",
  protect,
  requireAdmin,
  validate({ bodySchema: blogSchema }),
  async (req, res) => {
    const { title, content, excerpt, coverImage, status, tags, slug } = req.body

    const post = new Blog({
      title,
      content,
      excerpt,
      coverImage,
      status,
      tags,
      slug: slug || undefined,
      author: req.user._id,
    })

    await post.save()

    sendResponse(res, 201, true, "Blog post created", { post })
  }
)

/**
 * PUT /api/blog/admin/:id
 * Update a blog post (admin only)
 */
router.put(
  "/admin/:id",
  protect,
  requireAdmin,
  validate({ bodySchema: blogSchema.partial() }),
  async (req, res) => {
    const post = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )

    if (!post) {
      return sendResponse(res, 404, false, "Blog post not found", null)
    }

    sendResponse(res, 200, true, "Blog post updated", { post })
  }
)

/**
 * DELETE /api/blog/admin/:id
 * Delete a blog post (admin only)
 */
router.delete("/admin/:id", protect, requireAdmin, async (req, res) => {
  const post = await Blog.findByIdAndDelete(req.params.id)

  if (!post) {
    return sendResponse(res, 404, false, "Blog post not found", null)
  }

  sendResponse(res, 200, true, "Blog post deleted")
})

/**
 * POST /api/blog/admin/:id/cover
 * Upload cover image for a blog post (admin only)
 */
router.post(
  "/admin/:id/cover",
  protect,
  requireAdmin,
  FileUploadService.multerUpload.single("cover"),
  async (req, res) => {
    if (!req.file) {
      return sendResponse(res, 400, false, "No file uploaded", null)
    }

    const result = await FileUploadService.uploadToS3({
      buffer: req.file.buffer,
      name: `blog/${req.params.id}-${Date.now()}.${req.file.mimetype.split("/")[1]}`,
      mimetype: req.file.mimetype,
    })

    const post = await Blog.findByIdAndUpdate(
      req.params.id,
      { coverImage: result.key },
      { new: true }
    )

    if (!post) {
      return sendResponse(res, 404, false, "Blog post not found", null)
    }

    sendResponse(res, 200, true, "Cover image uploaded", { 
      post,
      coverUrl: await FileUploadService.generateSignedUrl(result.key)
    })
  }
)

// ─── LIKE & COMMENT ROUTES (must be before /:slug) ────────────

/**
 * POST /api/blog/like/:id
 * Like a blog post
 */
router.post("/like/:id", protect, async (req, res) => {
  const post = await Blog.findById(req.params.id)

  if (!post) {
    return sendResponse(res, 404, false, "Blog post not found", null)
  }

  const userId = req.user._id
  if (!post.likes.some((id) => id.equals(userId))) {
    post.likes.push(userId)
    await post.save()
  }

  sendResponse(res, 200, true, "Blog post liked", { post })
})

/**
 * POST /api/blog/unlike/:id
 * Unlike a blog post
 */
router.post("/unlike/:id", protect, async (req, res) => {
  const post = await Blog.findById(req.params.id)

  if (!post) {
    return sendResponse(res, 404, false, "Blog post not found", null)
  }

  const userId = req.user._id
  post.likes = post.likes.filter((id) => !id.equals(userId))
  await post.save()

  sendResponse(res, 200, true, "Blog post unliked", { post })
})

/**
 * POST /api/blog/comment/:id
 * Add a comment to a blog post
 */
router.post("/comment/:id", protect, async (req, res) => {
  const { text } = req.body

  if (!text?.trim()) {
    return sendResponse(res, 400, false, "Comment text is required", null)
  }

  const post = await Blog.findById(req.params.id)

  if (!post) {
    return sendResponse(res, 404, false, "Blog post not found", null)
  }

  post.comments.push({
    user: req.user._id,
    text: text.trim(),
    createdAt: new Date(),
  })
  await post.save()

  // Re-fetch with populated comments
  const updatedPost = await Blog.findById(req.params.id)
    .populate("comments.user", "username profileImage")
    .exec()

  sendResponse(res, 201, true, "Comment added", { post: updatedPost })
})

/**
 * DELETE /api/blog/comment/:id/:commentId
 * Delete a comment from a blog post
 */
router.delete("/comment/:id/:commentId", protect, async (req, res) => {
  const post = await Blog.findById(req.params.id)

  if (!post) {
    return sendResponse(res, 404, false, "Blog post not found", null)
  }

  const commentIndex = post.comments.findIndex(
    (c) => c._id.toString() === req.params.commentId
  )

  if (commentIndex === -1) {
    return sendResponse(res, 404, false, "Comment not found", null)
  }

  // Only allow comment owner or admin to delete
  const comment = post.comments[commentIndex]
  if (!comment.user.equals(req.user._id) && req.user.role !== "admin") {
    return sendResponse(res, 403, false, "Not authorized to delete this comment", null)
  }

  post.comments.splice(commentIndex, 1)
  await post.save()

  sendResponse(res, 200, true, "Comment deleted", { post })
})

// ─── PUBLIC ROUTES ────────────────────────────────────────────

/**
 * GET /api/blog
 * Get all published blog posts (public)
 */
router.get("/", async (req, res) => {
  const posts = await Blog.find({ status: "published" })
    .populate("author", "username profileImage")
    .sort({ publishedAt: -1 })
    .exec()

  sendResponse(res, 200, true, "Blog posts fetched", { posts })
})

/**
 * GET /api/blog/:slug
 * Get a single blog post by slug (public)
 */
router.get("/:slug", async (req, res) => {
  const post = await Blog.findOne({ 
    slug: req.params.slug,
    status: "published" 
  })
    .populate("author", "username profileImage")
    .populate("comments.user", "username profileImage")
    .exec()

  if (!post) {
    return sendResponse(res, 404, false, "Blog post not found", null)
  }

  sendResponse(res, 200, true, "Blog post fetched", { post })
})

export default router