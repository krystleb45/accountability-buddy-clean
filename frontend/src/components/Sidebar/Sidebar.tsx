// src/components/Sidebar/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isVisible: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <aside className={styles.sidebar} role="navigation" aria-label="Sidebar Navigation">
      <ul className={styles.list}>
        <li className={styles.item}>
          <NavLink
            to="/"
            className={({ isActive }) => [styles.link, isActive ? styles.active : ''].join(' ')}
            aria-label="Dashboard"
          >
            Dashboard
          </NavLink>
        </li>
        <li className={styles.item}>
          <NavLink
            to="/goals"
            className={({ isActive }) => [styles.link, isActive ? styles.active : ''].join(' ')}
            aria-label="Goals"
          >
            Goals
          </NavLink>
        </li>
        <li className={styles.item}>
          <NavLink
            to="/collaborations"
            className={({ isActive }) => [styles.link, isActive ? styles.active : ''].join(' ')}
            aria-label="Collaborations"
          >
            Collaborations
          </NavLink>
        </li>
        <li className={styles.item}>
          <NavLink
            to="/profile"
            className={({ isActive }) => [styles.link, isActive ? styles.active : ''].join(' ')}
            aria-label="Profile"
          >
            Profile
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
