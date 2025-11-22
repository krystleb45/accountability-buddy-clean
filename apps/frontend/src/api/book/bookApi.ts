/**
 * Book data model
 */
interface Book {
  id: number
  title: string
  author: string
  category: string
  summary: string
  imageUrl?: string
  purchaseLink?: string
}

/**
 * The envelope shape your Express `sendResponse` uses
 */
interface Envelope<T> {
  success: boolean
  message: string
  data: T
}

/**
 * Fetch all books via the Next.js proxy → Express /books
 */
export async function fetchBooks(): Promise<Book[]> {
  try {
    // This will go to `/backend-api/books`, and Next will rewrite that to `${BACKEND_URL}/books`
    const res = await fetch("/backend-api/books", { cache: "no-store" })
    if (!res.ok) {
      console.error("Books fetch failed:", await res.text())
      return []
    }
    const envelope = (await res.json()) as Envelope<Book[]>
    if (!envelope.success) {
      console.error("Books API returned error:", envelope.message)
      return []
    }
    return envelope.data
  } catch (err) {
    console.error("❌ [bookApi::fetchBooks]", err)
    return []
  }
}
