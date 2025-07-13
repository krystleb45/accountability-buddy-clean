// src/components/Navbar/NavbarItems.tsx
'use client';

import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './NavbarItems.module.css';

export interface NavbarItem {
  label: string;
  to: string;
  exact?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface NavbarItemsProps {
  items: NavbarItem[];
}

const NavbarItems: React.FC<NavbarItemsProps> = ({ items }): JSX.Element => {
  return (
    <ul className={styles.list} role="menubar">
      {items.map((item) => (
        <li key={item.to} className={styles.item} role="none">
          <NavLink
            to={item.to}
            end={Boolean(item.exact)}
            className={({ isActive }): string =>
              `${styles.link}${isActive ? ` ${styles.active}` : ''}`
            }
            onClick={item.onClick}
            role="menuitem"
            aria-label={item.label}
          >
            {item.icon && <span className={styles.icon}>{item.icon}</span>}
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default NavbarItems;
