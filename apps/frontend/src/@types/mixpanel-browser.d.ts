/**
 * TypeScript type definitions for `mixpanel-browser`.
 * These definitions enhance type safety and IntelliSense when using Mixpanel's API.
 */

declare module 'mixpanel-browser' {
  interface Mixpanel {
    /**
     * Initializes the Mixpanel library with your project token and optional configuration.
     * @param token - The Mixpanel project token.
     * @param config - Optional configuration object.
     */
    init(token: string, config?: Partial<MixpanelConfig>): void;

    /**
     * Tracks an event with optional properties.
     * @param event - The name of the event to track.
     * @param properties - Optional properties associated with the event.
     */
    track(event: string, properties?: Record<string, unknown>): void;

    /**
     * Sets super properties that are included with all events.
     * @param properties - The super properties to set.
     */
    register(properties: Record<string, unknown>): void;

    /**
     * Sets a unique identifier for the user (distinct ID).
     * @param distinctId - The unique identifier for the user.
     */
    identify(distinctId: string): void;

    /**
     * Links an anonymous user to a registered user.
     * @param alias - The alias to link to the current user.
     * @param distinctId - Optional distinct ID of the current user.
     */
    alias(alias: string, distinctId?: string): void;

    /**
     * Resets the current user and clears super properties.
     */
    reset(): void;

    /**
     * Sets user profile properties.
     * @param properties - The properties to set on the user's profile.
     */
    people: {
      set(properties: Record<string, unknown>): void;
      increment(property: string, by?: number): void;
    };

    /**
     * Flushes queued events to the Mixpanel server.
     */
    flush(): void;

    /**
     * Gets the current distinct ID for the user.
     * @returns The current distinct ID.
     */
    get_distinct_id(): string;

    /**
     * Configures Mixpanel library settings.
     */
    config: MixpanelConfig;
  }

  interface MixpanelConfig {
    debug?: boolean; // Enable debug mode
    api_host?: string; // The API host URL
    track_pageview?: boolean; // Automatically track page views
    persistence?: 'cookie' | 'localStorage'; // Storage method
    disable_persistence?: boolean; // Disable persistence
    property_blacklist?: string[]; // List of properties to exclude
  }

  const mixpanel: Mixpanel;
  export default mixpanel;
}
