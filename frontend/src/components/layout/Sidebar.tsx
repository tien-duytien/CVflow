import { LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { NavItem } from '../../types';

interface SidebarProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, activeTab, onTabChange, onSignOut }) => {
  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-[280px] h-full glass border-r border-[#E2E8F0] flex flex-col z-20"
    >
      <div className="h-[80px] flex items-center px-8 border-b border-[#E2E8F0]">
        <span className="text-[28px] font-[600] tracking-tighter text-[#6366F1] drop-shadow-sm">CVFlow</span>
      </div>

      <nav className="flex-1 py-10 px-6 flex flex-col gap-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`relative flex items-center gap-4 px-5 py-4 rounded-[12px] transition-all duration-200 group ${
              activeTab === item.id ? 'text-[#6366F1] bg-[#6366F1]/5' : 'text-slate-600 hover:bg-slate-100/80'
            }`}
          >
            <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className="text-[14px] font-medium tracking-wide">{item.label}</span>
            {activeTab === item.id && (
              <motion.div
                layoutId="nav-active"
                className="absolute left-0 w-[3px] h-[20px] bg-[#6366F1] rounded-full"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[#E2E8F0]">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span className="text-[12px] font-light">Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
};
