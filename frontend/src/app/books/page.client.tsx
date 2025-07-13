// src/app/book/page.client.tsx
'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { fetchBooks } from '@/api/book/bookApi';

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  summary: string;
  imageUrl?: string;
  purchaseLink?: string;
}

export default function BookListClient() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [featuredBook, setFeaturedBook] = useState<Book | null>(null);

 useEffect(() => {
  (async () => {
    try {
      const data = await fetchBooks();
      setBooks(data);

      // pick a random book, or null if none
      if (data.length > 0) {
        const idx = Math.floor(Math.random() * data.length);
        // assert non-undefined since length > 0
        setFeaturedBook(data[idx]!);
      } else {
        setFeaturedBook(null);
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
  })();
}, []);


  const filteredBooks = books.filter(
    (book) =>
      (selectedCategory === 'All' || book.category === selectedCategory) &&
      (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <h1 className="mb-6 text-center text-3xl font-bold text-green-400">
        📚 Book Recommendations
      </h1>

      {/* Always show Back link immediately under the heading */}
      <div className="mb-6 text-center">
        <a href="/dashboard" className="text-lg text-green-400 hover:underline">
          ← Back to Dashboard
        </a>
      </div>

      {featuredBook && (
        <div className="mb-8 rounded-lg bg-gray-900 p-6 text-center shadow-lg">
          <h2 className="text-2xl font-semibold text-yellow-400">📖 Book of the Day</h2>
          <p className="mt-2 text-lg text-green-300">
            {featuredBook.title} by {featuredBook.author}
          </p>
          <p className="mb-2 text-gray-400">{featuredBook.summary}</p>
          {featuredBook.imageUrl && (
            <img
              src={featuredBook.imageUrl}
              alt={featuredBook.title}
              className="mx-auto mb-2 h-auto w-40 rounded-lg"
            />
          )}
          {featuredBook.purchaseLink && (
            <a
              href={featuredBook.purchaseLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-green-400 hover:underline"
            >
              Buy on Amazon →
            </a>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <input
          type="text"
          placeholder="🔎 Search books..."
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-lg border border-gray-600 bg-gray-900 p-3 text-white"
        />
        <select
          value={selectedCategory}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-gray-600 bg-gray-900 p-3 text-white"
        >
          <option value="All">📂 All Categories</option>
          <option value="Productivity">⚡ Productivity</option>
          <option value="Fitness">💪 Fitness</option>
          <option value="Self-Improvement">📈 Self-Improvement</option>
          <option value="Business">📊 Business</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBooks.length === 0 ? (
          <p className="w-full text-center text-gray-400">No books found.</p>
        ) : (
          filteredBooks.map((book) => (
            <div
              key={book.id}
              className="transform rounded-lg bg-gray-900 p-4 shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              {book.imageUrl && (
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="mb-3 h-40 w-full rounded-lg object-cover"
                />
              )}
              <h2 className="text-xl font-bold text-green-300">{book.title}</h2>
              <p className="mb-2 text-sm text-gray-400">by {book.author}</p>
              <p className="mb-3 text-gray-300">{book.summary}</p>
              <span className="mb-3 inline-block rounded-full bg-green-700 px-3 py-1 text-xs font-bold text-white">
                {book.category}
              </span>
              {book.purchaseLink && (
                <a
                  href={book.purchaseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-green-400 hover:underline"
                >
                  Buy on Amazon →
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
