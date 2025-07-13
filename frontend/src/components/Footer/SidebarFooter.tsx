'use client';

import React from 'react';
import { FaMoon, FaSignOutAlt } from 'react-icons/fa'; // Removed unused FaSun import
import styles from './SidebarFooter.module.css';

export interface SidebarFooterProps {
  /** Toggle between light and dark theme */
  onThemeToggle?: () => void;
  /** Handler for user logout */
  onLogout?: () => void;
}

/**
 * SidebarFooter provides theme toggle and logout controls.
 */
const SidebarFooter: React.FC<SidebarFooterProps> = ({ onThemeToggle, onLogout }) => (
  <div className={styles.sidebarFooter}>
    <button
      type="button"
      className={styles.footerButton}
      onClick={onThemeToggle}
      aria-label="Toggle theme"
    >
      {/* Use sun/moon icon based on next toggle state (user can determine) */}
      <FaMoon aria-hidden="true" />
    </button>

    <button type="button" className={styles.footerButton} onClick={onLogout} aria-label="Log out">
      <FaSignOutAlt aria-hidden="true" />
    </button>
  </div>
);

export default SidebarFooter;
