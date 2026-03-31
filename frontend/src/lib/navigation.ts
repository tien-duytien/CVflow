import { LayoutDashboard, FileText, Search, Settings } from 'lucide-react';
import { NavItem, UserRole } from '../types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cv', label: 'My CV', icon: FileText },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'admin', label: 'Admin', icon: Settings },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  if (role === 'seeker') {
    return NAV_ITEMS.filter((item) => item.id !== 'search' && item.id !== 'admin');
  }
  if (role === 'employer') {
    return NAV_ITEMS.filter((item) => item.id !== 'cv' && item.id !== 'admin');
  }
  return NAV_ITEMS.filter((item) => item.id === 'admin');
}

export function getDefaultTabForRole(role: UserRole): string {
  const roleItems = getNavItemsForRole(role);
  return roleItems[0]?.id ?? 'dashboard';
}
