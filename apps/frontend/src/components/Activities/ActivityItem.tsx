// src/components/Activities/ActivityItem.tsx
import React, { ReactElement } from 'react';

export interface Activity {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO date string
  status: 'pending' | 'in-progress' | 'completed';
}

interface ActivityItemProps {
  activity: Activity;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusClasses: Record<Activity['status'], string> = {
  'pending': 'bg-yellow-500 text-black',
  'in-progress': 'bg-blue-500 text-white',
  'completed': 'bg-green-500 text-black',
};

export default function ActivityItem({
  activity,
  onViewDetails,
  onEdit,
  onDelete,
}: ActivityItemProps): ReactElement {
  return (
    <div className="mb-4 transform rounded-lg bg-gray-800 p-6 shadow-lg transition hover:scale-105">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-kelly-green">{activity.title}</h3>
        <span
          className={`rounded-lg px-3 py-1 text-sm font-medium ${statusClasses[activity.status]}`}
        >
          {activity.status.replace('-', ' ')}
        </span>
      </div>

      <p className="mt-2 text-gray-300">{activity.description}</p>

      <p className="mt-2 text-sm text-gray-400">
        Created on:{' '}
        <strong>
          {new Date(activity.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </strong>
      </p>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          className="rounded-lg bg-kelly-green px-4 py-2 text-black transition hover:bg-opacity-80"
          onClick={() => onViewDetails(activity.id)}
        >
          View
        </button>
        <button
          type="button"
          className="rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-400"
          onClick={() => onEdit(activity.id)}
        >
          Edit
        </button>
        <button
          type="button"
          className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-400"
          onClick={() => onDelete(activity.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
