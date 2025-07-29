// src/components/Activities/Post.tsx
import React from 'react';

interface PostProps {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string; // already formatted, e.g. "9/1/2023, 2:34 PM"
}

const Post: React.FC<PostProps> = ({ id, title, content, author, timestamp }) => {
  return (
    <div
      id={`post-${id}`}
      className="mb-4 transform rounded-lg bg-gray-800 p-6 shadow-lg transition hover:scale-105"
    >
      <h2 className="text-xl font-bold text-kelly-green">{title}</h2>
      <p className="mt-2 text-gray-300">{content}</p>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <span className="font-semibold">By: {author}</span>
        <span>{timestamp}</span>
      </div>
    </div>
  );
};

export default Post;
