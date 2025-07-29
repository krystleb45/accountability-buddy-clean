// src/components/Activities/AddActivityForm.tsx
'use client';

import React, { ReactElement, useState, useCallback } from 'react';

export type ActivityStatus = 'pending' | 'in-progress' | 'completed';

export interface AddActivityFormData {
  title: string;
  description: string;
  status: ActivityStatus;
}

export interface AddActivityFormProps {
  /** Called with validated form data */
  onSubmit: (data: AddActivityFormData) => void;
  /** Optional cancel handler */
  onCancel?: () => void;
}

export default function AddActivityForm({
  onSubmit,
  onCancel,
}: AddActivityFormProps): ReactElement {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<ActivityStatus>('pending');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();
      if (!trimmedTitle || !trimmedDescription) {
        setError('Title and Description are required.');
        return;
      }
      setError(null);
      onSubmit({ title: trimmedTitle, description: trimmedDescription, status });
      // reset
      setTitle('');
      setDescription('');
      setStatus('pending');
    },
    [title, description, status, onSubmit],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-lg rounded-lg bg-gray-900 p-6 text-white shadow-lg"
    >
      <h2 className="mb-4 text-2xl font-semibold text-kelly-green">Add New Activity</h2>

      {error && (
        <p className="mb-3 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <div className="mb-4">
        <label htmlFor="title" className="mb-1 block text-gray-400">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter activity title"
          className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white focus:border-kelly-green focus:outline-none"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="mb-1 block text-gray-400">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter activity description"
          className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white focus:border-kelly-green focus:outline-none"
          rows={3}
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="status" className="mb-1 block text-gray-400">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ActivityStatus)}
          className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white focus:border-kelly-green focus:outline-none"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="submit"
          className="rounded-lg bg-kelly-green px-4 py-2 font-bold text-black transition hover:bg-opacity-80"
        >
          Add Activity
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
