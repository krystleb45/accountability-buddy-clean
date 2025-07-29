// src/components/Activities/ActivityList.tsx
import React, { ReactElement } from 'react';
import ActivityItem, { Activity } from './ActivityItem';

export interface ActivityListProps {
  activities: Activity[];
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ActivityList({
  activities,
  onViewDetails,
  onEdit,
  onDelete,
}: ActivityListProps): ReactElement {
  if (activities.length === 0) {
    return (
      <div className="rounded-lg bg-gray-800 p-6 text-center text-gray-400 shadow-lg">
        No activities found. Start by adding one!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
