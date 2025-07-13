'use client';

import React from 'react';
import { Card, CardContent, CardHeader, Typography, Button } from '@mui/material';
import styles from './Recommendations.module.css';

export interface GroupRecommendation {
  id: string;
  name: string;
  description: string;
  membersCount: number;
}

interface GroupRecommendationsProps {
  recommendations: GroupRecommendation[];
  onJoinGroup: (groupId: string) => void;
}

const GroupRecommendations: React.FC<GroupRecommendationsProps> = ({
  recommendations,
  onJoinGroup,
}) => {
  return (
    <section className={styles.groupContainer ?? ''} aria-labelledby="group-recommendations-header">
      <Typography
        component="h2"
        variant="h4"
        gutterBottom
        id="group-recommendations-header"
        className={styles.heading ?? ''}
      >
        Recommended Groups
      </Typography>

      {recommendations.length > 0 ? (
        <ul className={styles.groupGrid ?? ''}>
          {recommendations.map((group) => (
            <li key={group.id} className={styles.groupItem ?? ''}>
              <Card
                component="div"
                role="region"
                aria-labelledby={`group-title-${group.id}`}
                className={styles.groupCard ?? ''}
              >
                <CardHeader
                  id={`group-title-${group.id}`}
                  title={group.name}
                  subheader={`${group.membersCount} members`}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    {group.description}
                  </Typography>
                  <Button
                    component="button"
                    variant="contained"
                    color="primary"
                    onClick={() => onJoinGroup(group.id)}
                    aria-label={`Join ${group.name}`}
                    className={styles.joinButton ?? ''}
                  >
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Typography variant="body1" color="textSecondary" className={styles.emptyMessage ?? ''}>
          No recommended groups available at the moment.
        </Typography>
      )}
    </section>
  );
};

export default GroupRecommendations;
