import { Globe, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#E2E8F0] bg-white/60 backdrop-blur-sm px-6 md:px-10 py-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[18px] font-[600] tracking-tighter text-[#6366F1]">CVFlow</span>
          <span className="text-[12px] text-slate-400 ml-2">&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-[13px] text-slate-500">
          <a href="#privacy" className="hover:text-[#6366F1] transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-[#6366F1] transition-colors">Terms of Service</a>
          <a href="#about" className="hover:text-[#6366F1] transition-colors">About Us</a>
          <a href="#contact" className="hover:text-[#6366F1] transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-4 text-slate-400">
          <a href="mailto:support@cvflow.com" className="hover:text-[#6366F1] transition-colors" aria-label="Email">
            <Mail size={16} />
          </a>
          <a href="tel:+1234567890" className="hover:text-[#6366F1] transition-colors" aria-label="Phone">
            <Phone size={16} />
          </a>
          <a href="https://cvflow.com" className="hover:text-[#6366F1] transition-colors" aria-label="Website">
            <Globe size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
};
