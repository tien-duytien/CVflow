import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  activeTab: string;
  role: string;
}

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  cv: 'My CV',
  search: 'Search',
  admin: 'Admin Panel',
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ activeTab, role }) => {
  const roleLabel = role === 'seeker' ? 'Job Seeker' : role === 'employer' ? 'Employer' : 'Administrator';
  const tabLabel = TAB_LABELS[activeTab] || activeTab;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-slate-500 px-6 md:px-12 pt-4 pb-0">
      <Home size={14} className="text-slate-400" />
      <ChevronRight size={12} className="text-slate-300" />
      <span className="text-slate-400">{roleLabel}</span>
      <ChevronRight size={12} className="text-slate-300" />
      <span className="text-[#6366F1] font-medium">{tabLabel}</span>
    </nav>
  );
};
