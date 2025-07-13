// Centralized types for all Toast components
export interface LevelUpToastProps {
  /** The new level to show in the message */
  level: number;
  /** Whether the toast is visible */
  show: boolean;
  /** Called when the toast should close itself (e.g. after timeout) */
  onClose: () => void;
}
