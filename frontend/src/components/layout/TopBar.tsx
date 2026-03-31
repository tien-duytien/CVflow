import { Globe, Search } from 'lucide-react';
import { UserRole } from '../../types';

interface TopBarProps {
  fullName: string;
  role: UserRole;
}

export const TopBar: React.FC<TopBarProps> = ({ fullName, role }) => {
  const roleLabel = role === 'seeker' ? 'Job Seeker' : role;

  return (
    <header className="h-[80px] glass border-b border-[#E2E8F0] flex items-center justify-between px-10 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <div className="p-2.5 rounded-full bg-slate-100 text-slate-500 hover:text-[#6366F1] transition-colors cursor-pointer">
          <Globe size={20} strokeWidth={2} />
        </div>
        <div className="h-[44px] w-[280px] rounded-full bg-slate-100/80 border border-[#E2E8F0] flex items-center px-5 gap-3 group focus-within:w-[360px] transition-all duration-300">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            placeholder="Quick search..."
            className="bg-transparent border-none outline-none text-[14px] font-normal w-full placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex flex-col items-end">
          <span className="text-[14px] font-semibold text-slate-800">
            {fullName || ''}
          </span>
          <div className="px-3 py-1 rounded-full bg-[#6366F1]/15 text-[#6366F1] text-[11px] font-bold uppercase tracking-wider">
            {roleLabel}
          </div>
        </div>
        <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-white shadow-md overflow-hidden">
          <img src="https://picsum.photos/seed/alex/100/100" alt="Avatar" referrerPolicy="no-referrer" />
        </div>
      </div>
    </header>
  );
};
