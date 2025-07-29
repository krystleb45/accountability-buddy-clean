// src/components/Sidebar/index.ts

export { default as Sidebar } from './Sidebar';
export { default as SidebarItem } from './SidebarItem';
export { default as SidebarFooter } from '../Footer/SidebarFooter'; // adjust path if it remains in ../Footer

// 👉 Re-export your type definitions so you can import them elsewhere with:
//    import { SidebarProps, SidebarItemProps, SidebarFooterProps } from '@/components/Sidebar';
export * from '../../types/Sidebar.types';
