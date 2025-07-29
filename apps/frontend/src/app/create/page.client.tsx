// src/app/create/page.client.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function CreateForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: actually call your API to create a goal
    setSuccess(true);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-4xl"
      >
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-kelly-green">Create New Goal</h1>
          <p className="text-lg text-gray-400">
            Set your sights on success by creating and tracking your goals.
          </p>
        </header>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-lg rounded-lg bg-gray-900 p-8 shadow-lg"
        >
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-center text-green-400"
            >
              Your goal has been successfully created!
            </motion.div>
          )}

          <div className="mb-4">
            <label htmlFor="title" className="mb-2 block font-medium text-gray-300">
              Goal Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border bg-gray-800 p-3 text-white focus:outline-none focus:ring-2 focus:ring-kelly-green"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="mb-2 block font-medium text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-lg border bg-gray-800 p-3 text-white focus:outline-none focus:ring-2 focus:ring-kelly-green"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full rounded-lg bg-kelly-green px-4 py-3 text-black transition hover:bg-opacity-80"
          >
            Create Goal
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
