"use client"

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from "@mui/material"
import React from "react"

import styles from "./Recommendations.module.css"

export interface IndividualRecommendation {
  id: string
  name: string
  bio: string
  sharedGoals: string[]
}

interface IndividualRecommendationsProps {
  recommendations: IndividualRecommendation[]
  onConnect: (individualId: string) => void
}

const IndividualRecommendations: React.FC<IndividualRecommendationsProps> = ({
  recommendations,
  onConnect,
}) => {
  return (
    <section
      className={styles.individualRecommendationsContainer ?? ""}
      aria-labelledby="individual-recommendations-header"
    >
      <Typography
        component="h2"
        variant="h4"
        gutterBottom
        id="individual-recommendations-header"
        className={styles.header ?? ""}
      >
        Recommended Individuals
      </Typography>

      <div className={styles.recommendationsGrid ?? ""}>
        {recommendations.length > 0 ? (
          recommendations.map((individual) => (
            <Card
              key={individual.id}
              component="div"
              role="region"
              aria-labelledby={`individual-name-${individual.id}`}
              className={styles.individualCard ?? ""}
            >
              <CardHeader
                component="div"
                id={`individual-name-${individual.id}`}
                title={individual.name}
                subheader={`Shared Goals: ${individual.sharedGoals.length}`}
              />
              <CardContent>
                <Typography
                  component="p"
                  variant="body2"
                  color="textSecondary"
                  className={styles.bioText ?? ""}
                >
                  {individual.bio}
                </Typography>

                <Typography
                  component="div"
                  variant="body2"
                  color="textSecondary"
                  className={styles.sharedGoalsHeader ?? ""}
                >
                  Shared Goals:
                  <ul className={styles.sharedGoalsList ?? ""}>
                    {individual.sharedGoals.map((goal, idx) => (
                      <li key={idx} className={styles.sharedGoalItem ?? ""}>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </Typography>

                <Button
                  component="button"
                  variant="contained"
                  color="primary"
                  onClick={() => onConnect(individual.id)}
                  aria-label={`Connect with ${individual.name}`}
                  className={styles.connectButton ?? ""}
                >
                  Connect
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography
            component="p"
            variant="body1"
            color="textSecondary"
            className={styles.emptyMessage ?? ""}
          >
            No recommended individuals available at the moment.
          </Typography>
        )}
      </div>
    </section>
  )
}

export default IndividualRecommendations
