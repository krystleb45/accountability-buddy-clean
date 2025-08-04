// src/settings/ResourceLinks/ResourceLinks.tsx
import React from "react"

import styles from "./ResourceLinks.module.css"

interface Resource {
  name: string
  url: string
  description?: string
}

interface ResourceLinksProps {
  resources?: Resource[]
}

const defaultResources: Resource[] = [
  {
    name: "Veterans Crisis Line",
    url: "https://www.veteranscrisisline.net",
    description: "Connect with crisis counselors 24/7.",
  },
  {
    name: "Military OneSource",
    url: "https://www.militaryonesource.mil",
    description:
      "Comprehensive resources for service members and their families.",
  },
  {
    name: "Wounded Warrior Project",
    url: "https://www.woundedwarriorproject.org",
    description: "Support for wounded veterans and service members.",
  },
  {
    name: "National Suicide Prevention Lifeline",
    url: "https://suicidepreventionlifeline.org",
    description: "24/7 confidential support for those in distress.",
  },
]

const ResourceLinks: React.FC<ResourceLinksProps> = ({
  resources = defaultResources,
}) => {
  return (
    <section
      className={styles.container}
      aria-labelledby="resource-links-heading"
      data-testid="resource-links"
    >
      <h2 id="resource-links-heading" className={styles.resourceHeader}>
        Helpful Resources
      </h2>

      <ul className={styles.resourceList}>
        {resources.map((resource) => (
          <li key={resource.url} className={styles.resourceItem}>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={styles.resourceLink}
              aria-label={`Visit ${resource.name}`}
            >
              {resource.name}
            </a>
            {resource.description && (
              <p className={styles.resourceDescription}>
                {resource.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ResourceLinks
