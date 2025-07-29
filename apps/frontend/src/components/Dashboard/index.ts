// index.ts - Centralized exports for the Dashboard module

// Export components
export { default as Dashboard } from './Dashboard';
export { default as DashboardStatCard } from './DashboardStatCard';
export { default as PointsBalance } from './PointsBalance';
export { default as RewardsSection } from './RewardsSection';

// Export utilities
export * from '@/utils/DashboardUtils';

// Export styles
export { default as dashboardStyles } from './Dashboard.module.css';
