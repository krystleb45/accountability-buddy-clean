// src/config/notifications/notificationConfig.ts

// ——————————————————————————————————————————————
// Types
// ——————————————————————————————————————————————

interface NotificationType {
  duration: number;
  style: {
    backgroundColor: string;
    color: string;
  };
  icon: string;
}

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

interface NotificationConfig {
  defaultDuration: number;
  position: Position;
  types: Record<string, NotificationType>;

  /** Return the config for a given type, or a fallback if unknown */
  getConfig(this: NotificationConfig, type: string): NotificationType;

  /**
   * Globally override the default duration and/or position.
   * Only accepts valid positions.
   */
  setGlobalConfig(
    this: NotificationConfig,
    config: { duration?: number; position?: Position },
  ): void;
}

// ——————————————————————————————————————————————
// Implementation
// ——————————————————————————————————————————————

const notificationConfig: NotificationConfig = {
  defaultDuration: 5000,
  position: 'top-right',

  types: {
    success: {
      duration: 3000,
      style: { backgroundColor: '#4caf50', color: '#ffffff' },
      icon: '✔️',
    },
    error: {
      duration: 7000,
      style: { backgroundColor: '#f44336', color: '#ffffff' },
      icon: '❌',
    },
    info: {
      duration: 5000,
      style: { backgroundColor: '#2196f3', color: '#ffffff' },
      icon: 'ℹ️',
    },
    warning: {
      duration: 6000,
      style: { backgroundColor: '#ff9800', color: '#ffffff' },
      icon: '⚠️',
    },
  },

  getConfig(this: NotificationConfig, type: string): NotificationType {
    return (
      this.types[type] || {
        duration: this.defaultDuration,
        style: { backgroundColor: '#333', color: '#fff' },
        icon: '🔔',
      }
    );
  },

  setGlobalConfig(
    this: NotificationConfig,
    { duration, position }: { duration?: number; position?: Position },
  ): void {
    if (duration !== undefined) {
      this.defaultDuration = duration;
    }
    if (position !== undefined) {
      this.position = position;
    }
  },
};

export default notificationConfig;
