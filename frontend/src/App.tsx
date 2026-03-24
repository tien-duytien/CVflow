/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  Settings, 
  Globe, 
  User, 
  ChevronRight,
  LogOut,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard, GlassButton, GlassInput, GlassChip } from './components/GlassUI';
import { NavItem, UserRole, CVData } from './types';
import {
  apiLogin,
  apiFetchCv,
  apiSaveCv,
  apiGetLookup,
  apiRegister,
  apiFetchAllCvs,
  apiSearchCvs,
  apiFetchAdminUsers,
  apiFetchAdminLookup,
  apiCreateAdminLookup,
  apiUpdateAdminLookup,
  apiDeleteAdminLookup,
  type CvSearchParams,
  type AdminUser,
  type AdminLookupType,
  type AdminLookupItem,
} from './api';

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cv', label: 'My CV', icon: FileText },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'admin', label: 'Admin', icon: Settings },
];

function getNavItemsForRole(role: UserRole): NavItem[] {
  if (role === 'seeker') {
    return NAV_ITEMS.filter((item) => item.id !== 'search' && item.id !== 'admin');
  }
  if (role === 'employer') {
    return NAV_ITEMS.filter((item) => item.id !== 'cv' && item.id !== 'admin');
  }
  return NAV_ITEMS.filter((item) => item.id === 'admin');
}

function getDefaultTabForRole(role: UserRole): string {
  const roleItems = getNavItemsForRole(role);
  return roleItems[0]?.id ?? 'dashboard';
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState<UserRole>('seeker');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const roleNavItems = useMemo(() => getNavItemsForRole(role), [role]);

  const emptyCvData: CVData = {
    personal: { fullName: '', email: '', phone: '', bio: '', dateOfBirth: '', gender: '' },
    address: { country: '', city: '', district: '', streetAddress: '', postalCode: '' },
    education: [],
    work: [],
    skills: [],
    certificates: [],
  };
  const [cvData, setCvData] = useState<CVData>(emptyCvData);
  const handleDiscardCv = useCallback(async () => {
    if (currentUserId == null) return;
    try {
      const cvRes = await apiFetchCv(currentUserId);
      if (cvRes.hasCv) {
        setCategoryId(cvRes.categoryId ?? 1);
        setCvData({
          personal: cvRes.personal,
          address: {
            country: cvRes.address.country ?? '',
            city: cvRes.address.city ?? '',
            district: cvRes.address.district ?? '',
            streetAddress: cvRes.address.streetAddress ?? '',
            postalCode: cvRes.address.postalCode ?? '',
            countryId: cvRes.address.countryId ?? null,
            cityId: cvRes.address.cityId ?? null,
            districtId: cvRes.address.districtId ?? null,
          },
          education: cvRes.education ?? [],
          work: cvRes.work ?? [],
          skills: cvRes.skills ?? [],
          certificates: cvRes.certificates ?? [],
        });
      } else {
        setCvData(emptyCvData);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUserId]);

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await apiLogin(email, password);
      if (res.user) {
        const nextRole = res.user.role as UserRole;
        setCurrentUserId(res.user.userId);
        setRole(nextRole);
        setActiveTab(getDefaultTabForRole(nextRole));
        setIsLoggedIn(true);
        const cvRes = await apiFetchCv(res.user.userId);
        if (cvRes.hasCv) {
          setCategoryId(cvRes.categoryId ?? 1);
          setCvData({
            personal: cvRes.personal,
            address: {
              country: cvRes.address.country ?? '',
              city: cvRes.address.city ?? '',
              district: cvRes.address.district ?? '',
              streetAddress: cvRes.address.streetAddress ?? '',
              postalCode: cvRes.address.postalCode ?? '',
              countryId: cvRes.address.countryId ?? null,
              cityId: cvRes.address.cityId ?? null,
              districtId: cvRes.address.districtId ?? null,
            },
            education: cvRes.education ?? [],
            work: cvRes.work ?? [],
            skills: cvRes.skills ?? [],
            certificates: cvRes.certificates ?? [],
          });
        }
      }
    } catch (e) {
      console.error(e);
      alert('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const isActiveTabAllowed = roleNavItems.some((item) => item.id === activeTab);
    if (!isActiveTabAllowed) {
      setActiveTab(getDefaultTabForRole(role));
    }
  }, [activeTab, isLoggedIn, role, roleNavItems]);

  if (!isLoggedIn) {
    return <AuthView onLogin={handleLogin} isLoading={isLoading} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      {/* Left Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-[280px] h-full glass border-r border-[#E2E8F0] flex flex-col z-20"
      >
        <div className="h-[80px] flex items-center px-8 border-b border-[#E2E8F0]">
          <span className="text-[28px] font-[600] tracking-tighter text-[#6366F1] drop-shadow-sm">CVFlow</span>
        </div>
        
        <nav className="flex-1 py-10 px-6 flex flex-col gap-3">
          {roleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={16} strokeWidth={1.5} />
            <span className="text-[12px] font-light">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Bar */}
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
                {cvData.personal.fullName || ''}
              </span>
              <div className="px-3 py-1 rounded-full bg-[#6366F1]/15 text-[#6366F1] text-[11px] font-bold uppercase tracking-wider">
                {role === 'seeker' ? 'Job Seeker' : role}
              </div>
            </div>
            <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-white shadow-md overflow-hidden">
              <img src="https://picsum.photos/seed/alex/100/100" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              role === 'employer' ? (
                <EmployerDashboardView key="dashboard-employer" />
              ) : (
                <DashboardView key="dashboard" role={role} data={cvData} />
              )
            )}
            {activeTab === 'cv' && (
              <CVEditView
                key="cv"
                data={cvData}
                setData={setCvData}
                userId={currentUserId ?? 1}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                onDiscard={handleDiscardCv}
              />
            )}
            {activeTab === 'search' && (
              role === 'employer' ? (
                <EmployerSearchView key="search-employer" />
              ) : (
                <SearchView key="search" />
              )
            )}
            {activeTab === 'admin' && <AdminView key="admin" />}
          </AnimatePresence>
        </div>
      </main>

      {/* Confetti Overlay */}
      {showConfetti && <ConfettiEffect onComplete={() => setShowConfetti(false)} />}
    </div>
  );
}

// --- Sub-Views ---

function AuthView({ onLogin, isLoading }: { onLogin: (email: string, password: string) => void; isLoading: boolean }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isCreating, setIsCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'seeker' | 'employer'>('seeker');

  const handleCreateAccount = async () => {
    try {
      setIsCreating(true);
      await apiRegister(email, password, role);
      alert('Account created. Please sign in.');
      setMode('signin');
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to create account');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 blur-[120px] rounded-full" />

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="w-[480px] p-12 flex flex-col gap-8" elevation="high">
            <div className="flex flex-col gap-3">
              <h1 className="text-[36px] font-[300] tracking-tight text-slate-900">
                {mode === 'signin' ? 'Welcome back' : 'Create Account'}
              </h1>
              <p className="text-[16px] font-normal text-slate-500">
                {mode === 'signin' 
                  ? 'Enter your credentials to access CVFlow' 
                  : 'Join CVFlow to start your journey'}
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <GlassInput
                label="Email Address"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              {mode === 'signup' && (
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] text-slate-600 font-medium tracking-wide">Role</label>
                  <select
                    className="h-[48px] px-5 rounded-[10px] bg-white/10 border border-[#E2E8F0] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all duration-200 text-[16px] font-normal"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'seeker' | 'employer')}
                  >
                    <option value="seeker">Job Seeker</option>
                    <option value="employer">Employer</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <GlassInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="h-[6px] w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    className="h-full bg-emerald-500"
                  />
                </div>
                <span className="text-[12px] text-emerald-600 font-semibold uppercase tracking-wider">Strong Password</span>
              </div>
            </div>

            <GlassButton 
              onClick={mode === 'signin' ? () => onLogin(email, password) : handleCreateAccount} 
              disabled={isLoading || isCreating} 
              className="w-full"
            >
              {(isLoading || isCreating) ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                mode === 'signin' ? 'Sign In' : 'Sign Up'
              )}
            </GlassButton>

            <div className="flex items-center justify-center gap-2 text-[14px] font-normal text-slate-500">
              <span>
                {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
              </span>
              <button 
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-[#6366F1] font-semibold hover:underline"
              >
                {mode === 'signin' ? 'Create one' : 'Sign in'}
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const DashboardView: React.FC<{ role: UserRole; data: CVData }> = ({ role, data }) => {
  const fullName = data.personal.fullName || 'Your Name';
  const profile = data.personal.bio || 'Add a short professional summary to your profile.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto py-12"
    >
      <GlassCard className="p-10 bg-white">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-8 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-[36px] font-[300] tracking-tight text-slate-900">
                {fullName}
              </h1>
              <p className="mt-4 text-[14px] font-normal text-slate-600 max-w-xl leading-relaxed">
                {profile}
              </p>
            </div>
            <div className="text-right text-[13px] text-slate-600 space-y-1">
              {data.personal.email && <div>{data.personal.email}</div>}
              {data.personal.phone && <div>{data.personal.phone}</div>}
              {data.address.city && data.address.country && (
                <div>
                  {data.address.city}, {data.address.country}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[2.3fr,1.1fr] gap-10">
            {/* Left column: Experience / Education / Projects */}
            <div className="flex flex-col gap-8">
              {/* Experience */}
              {data.work.length > 0 && (
                <section className="flex flex-col gap-4">
                  <h2 className="uppercase text-[13px] tracking-[0.2em] text-[#2563EB] font-semibold">
                    Experience
                  </h2>
                  <div className="space-y-5">
                    {data.work.map((w) => (
                      <div key={w.id} className="flex flex-col gap-1">
                        <div className="text-[16px] font-semibold text-slate-900">
                          {w.jobTitle || 'Job Role'}
                          {w.companyName && (
                            <span className="text-slate-500"> | {w.companyName}</span>
                          )}
                        </div>
                        <div className="text-[13px] text-slate-500">
                          {w.startYear || 'Month 20XX'} –{' '}
                          {w.isPresent ? 'Present' : w.endYear || 'Month 20XX'}
                        </div>
                        {w.description && (
                          <p className="mt-1 text-[16px] text-slate-600 leading-relaxed">
                            {w.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {data.education.length > 0 && (
                <section className="flex flex-col gap-4">
                  <h2 className="uppercase text-[13px] tracking-[0.2em] text-[#2563EB] font-semibold">
                    Education
                  </h2>
                  <div className="space-y-4">
                    {data.education.map((e) => (
                      <div key={e.id} className="flex flex-col gap-1">
                        <div className="text-[16px] font-semibold text-slate-900">
                          {e.degreeLevel || 'Degree Name'}
                          {e.major && (
                            <span className="text-slate-500"> ({e.major})</span>
                          )}
                          {e.institutions && (
                            <span className="text-slate-500">
                              {' '}
                              | {e.institutions}
                            </span>
                          )}
                        </div>
                        <div className="text-[13px] text-slate-500">
                          {e.startYear || 'Month 20XX'} – {e.endYear || 'Month 20XX'}
                        </div>
                        {e.description && (
                          <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">
                            {e.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reference line */}
              <section className="pt-4 border-t border-slate-200 mt-2">
                <p className="text-[14px] text-slate-500">
                  <span className="uppercase tracking-[0.2em] text-slate-400">
                    Reference
                  </span>{' '}
                  – References available upon request.
                </p>
              </section>
            </div>

            {/* Right column: Skills / Certificates / Languages */}
            <div className="flex flex-col gap-8">
              {/* Skills */}
              {data.skills.length > 0 && (
                <section className="flex flex-col gap-3">
                  <h3 className="uppercase text-[13px] tracking-[0.2em] text-[#2563EB] font-semibold">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[14px] text-slate-700">
                    {data.skills.map((s) => (
                      <span key={s.id} className="underline decoration-slate-300">
                        {s.skill || 'Skill'}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Certificates */}
              {data.certificates.length > 0 && (
                <section className="flex flex-col gap-3">
                  <h3 className="uppercase text-[13px] tracking-[0.2em] text-[#2563EB] font-semibold">
                    Certificates
                  </h3>
                  <div className="space-y-3 text-[14px] text-slate-700">
                    {data.certificates.map((c) => (
                      <div key={c.id}>
                        <div className="font-semibold text-[14px]">
                          {c.certificate || 'Course Name'}
                        </div>
                        <div className="text-slate-500">
                          <p>{c.description || 'IELTS 9.0'}</p>
                          {c.issuedYear || 'Month 20XX'}
                          {c.issuingOrganization && (
                            <> – {c.issuingOrganization}</>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

const EmployerDashboardView: React.FC = () => {
  const [cvs, setCvs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCv, setSelectedCv] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const res = await apiFetchAllCvs();
        if (isMounted && Array.isArray(res)) {
          setCvs(res.filter((item) => item && item.hasCv));
        }
      } catch (e) {
        console.error('Failed to load CV list', e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const getPrimaryTitle = (cv: any) => {
    if (cv.work && cv.work.length > 0) {
      const last = cv.work[cv.work.length - 1];
      if (last.jobTitle) return last.jobTitle;
    }
    if (cv.categoryName) return cv.categoryName;
    return 'Professional';
  };

  const getSkills = (cv: any) => {
    if (!cv.skills) return [];
    return cv.skills.slice(0, 3).map((s: any) => s.skill || '').filter(Boolean);
  };

  const getLocation = (cv: any) => {
    if (cv.address && cv.address.city && cv.address.country) {
      return `${cv.address.city}, ${cv.address.country}`;
    }
    if (cv.address && (cv.address.city || cv.address.country)) {
      return cv.address.city || cv.address.country;
    }
    return 'Location not specified';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto flex flex-col gap-10"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-[32px] font-[300] tracking-tight text-slate-900">
            Browse all candidates
          </h2>
          <p className="text-[14px] text-slate-500">
            Discover CVs created in the system and open full profiles in-place.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
          Loading CVs...
        </div>
      ) : cvs.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
          No CVs available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cvs.map((cv) => {
            const skills = getSkills(cv);
            const fullName = cv.personal?.fullName || 'Unnamed Candidate';
            const title = getPrimaryTitle(cv);
            const location = getLocation(cv);
            return (
              <GlassCard
                key={cv.cvId ?? fullName}
                className="p-6 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/${encodeURIComponent(
                        String(cv.userId ?? fullName),
                      )}/100/100`}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[18px] font-semibold text-slate-900">
                      {fullName}
                    </span>
                    <span className="text-[14px] font-normal text-slate-500">
                      {title}
                    </span>
                  </div>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="text-[11px] px-3 py-1 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                  <span className="text-[14px] font-normal text-slate-500">
                    {location}
                  </span>
                  <button
                    onClick={() => setSelectedCv(cv)}
                    className="text-[#6366F1] text-[14px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    View Profile <ChevronRight size={16} />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedCv && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedCv(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              className="relative max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <GlassCard className="p-6 bg-olive-50 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[18px] font-semibold text-slate-900">
                    Candidate profile
                  </h3>
                  <button
                    onClick={() => setSelectedCv(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="border-t border-slate-200 pt-6">
                  <DashboardView role="seeker" data={selectedCv as CVData} />
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const EmployerSearchView: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState<'recent' | 'alpha' | 'experience'>('recent');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [countryId, setCountryId] = useState<number | undefined>(undefined);
  const [cityId, setCityId] = useState<number | undefined>(undefined);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [minProficiencyId, setMinProficiencyId] = useState<number | undefined>(undefined);
  const [degreeLevelId, setDegreeLevelId] = useState<number | undefined>(undefined);
  const [institutionId, setInstitutionId] = useState<number | undefined>(undefined);

  const [lookups, setLookups] = useState<{
    categories: LookupItem[];
    countries: LookupItem[];
    cities: LookupItem[];
    skills: LookupItem[];
    proficiencyLevels: LookupItem[];
    degreeLevels: LookupItem[];
    institutions: LookupItem[];
  }>({
    categories: [],
    countries: [],
    cities: [],
    skills: [],
    proficiencyLevels: [],
    degreeLevels: [],
    institutions: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [selectedCv, setSelectedCv] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [categories, countries, skills, proficiencyLevels, degreeLevels, institutions] = await Promise.all([
          apiGetLookup('categories'),
          apiGetLookup('countries'),
          apiGetLookup('skills'),
          apiGetLookup('proficiency-levels'),
          apiGetLookup('degree-levels'),
          apiGetLookup('institutions'),
        ]);
        setLookups({
          categories: categories as LookupItem[],
          countries: countries as LookupItem[],
          cities: [],
          skills: skills as LookupItem[],
          proficiencyLevels: proficiencyLevels as LookupItem[],
          degreeLevels: degreeLevels as LookupItem[],
          institutions: institutions as LookupItem[],
        });
      } catch (e) {
        console.error('Failed to load search lookups', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!countryId) {
      setLookups(prev => ({ ...prev, cities: [] }));
      setCityId(undefined);
      return;
    }
    apiGetLookup('cities', { countryId }).then((cities: any) => {
      setLookups(prev => ({ ...prev, cities }));
    }).catch(() => {});
  }, [countryId]);

  const getPrimaryTitle = (cv: any) => {
    if (cv.work && cv.work.length > 0) {
      const last = cv.work[cv.work.length - 1];
      if (last.jobTitle) return last.jobTitle;
    }
    if (cv.categoryName) return cv.categoryName;
    return 'Professional';
  };

  const getSkills = (cv: any) => {
    if (!cv.skills) return [];
    return cv.skills.slice(0, 3).map((s: any) => s.skill || '').filter(Boolean);
  };

  const getLocation = (cv: any) => {
    if (cv.address && cv.address.city && cv.address.country) {
      return `${cv.address.city}, ${cv.address.country}`;
    }
    if (cv.address && (cv.address.city || cv.address.country)) {
      return cv.address.city || cv.address.country;
    }
    return 'Location not specified';
  };

  const handleToggleSkill = (id: number) => {
    setSelectedSkillIds(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id],
    );
  };

  const handleSearch = async () => {
    const params: CvSearchParams = {};
    if (keyword.trim() !== '') params.q = keyword.trim();
    params.sort = sort;
    if (categoryId) params.categoryId = categoryId;
    if (countryId) params.countryId = countryId;
    if (cityId) params.cityId = cityId;
    if (selectedSkillIds.length > 0) params.skillIds = selectedSkillIds;
    if (minProficiencyId) params.minProficiencyId = minProficiencyId;
    if (degreeLevelId) params.degreeLevelId = degreeLevelId;
    if (institutionId) params.institutionId = institutionId;

    try {
      setIsLoading(true);
      setError(null);
      const res = await apiSearchCvs(params);
      if (res && Array.isArray(res.results)) {
        setResults(res.results);
      } else if (Array.isArray(res)) {
        setResults(res);
      } else {
        setResults([]);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to search CVs.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setKeyword('');
    setSort('recent');
    setCategoryId(undefined);
    setCountryId(undefined);
    setCityId(undefined);
    setSelectedSkillIds([]);
    setMinProficiencyId(undefined);
    setDegreeLevelId(undefined);
    setInstitutionId(undefined);
    setResults([]);
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto flex flex-col gap-10"
    >
      <div className="flex flex-col gap-6">
        <h2 className="text-[32px] font-[300] tracking-tight text-slate-900">
          Advanced candidate search
        </h2>
        <GlassCard className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassInput
              label="Keyword"
              placeholder="Name, summary, description..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <label className="text-[14px] text-slate-600 font-medium tracking-wide">
                Sort by
              </label>
              <select
                className={SELECT_CLASS}
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
              >
                <option value="recent">Most recently updated</option>
                <option value="alpha">Alphabetical order</option>
                <option value="experience">Approx. work experience</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] text-slate-600 font-medium tracking-wide">
                Category
              </label>
              <select
                className={SELECT_CLASS}
                value={categoryId ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setCategoryId(v === '' ? undefined : Number(v));
                }}
              >
                <option value="">Any category</option>
                {lookups.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] text-slate-600 font-medium tracking-wide">
                Degree level
              </label>
              <select
                className={SELECT_CLASS}
                value={degreeLevelId ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setDegreeLevelId(v === '' ? undefined : Number(v));
                }}
              >
                <option value="">Any degree level</option>
                {lookups.degreeLevels.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] text-slate-600 font-medium tracking-wide">
                Institution
              </label>
              <select
                className={SELECT_CLASS}
                value={institutionId ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setInstitutionId(v === '' ? undefined : Number(v));
                }}
              >
                <option value="">Any institution</option>
                {lookups.institutions.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] text-slate-600 font-medium tracking-wide">
                Country
              </label>
              <select
                className={SELECT_CLASS}
                value={countryId ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  const id = v === '' ? undefined : Number(v);
                  setCountryId(id);
                  setCityId(undefined);
                }}
              >
                <option value="">Any country</option>
                {lookups.countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] text-slate-600 font-medium tracking-wide">
                City
              </label>
              <select
                className={SELECT_CLASS}
                value={cityId ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setCityId(v === '' ? undefined : Number(v));
                }}
              >
                <option value="">Any city</option>
                {lookups.cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] text-slate-600 font-medium tracking-wide">
                Minimum proficiency
              </label>
              <select
                className={SELECT_CLASS}
                value={minProficiencyId ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setMinProficiencyId(v === '' ? undefined : Number(v));
                }}
              >
                <option value="">Any level</option>
                {lookups.proficiencyLevels.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-slate-600 font-medium tracking-wide">
              Skills (match all selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {lookups.skills.slice(0, 15).map((s) => {
                const active = selectedSkillIds.includes(s.id);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => handleToggleSkill(s.id)}
                    className={`px-3 py-1 rounded-full text-[12px] font-medium border ${
                      active
                        ? 'bg-[#6366F1] text-white border-[#6366F1]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#6366F1]/60'
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center gap-4 pt-2">
            <span className="text-[12px] text-slate-500">
              
            </span>
            <div className="flex gap-3">
              <GlassButton variant="outline" onClick={handleClear}>
                Clear
              </GlassButton>
              <GlassButton onClick={handleSearch} disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>

      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      {results.length === 0 && !isLoading ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-500">
          Adjust filters and run a search to see matching CVs.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((cv) => {
            const skills = getSkills(cv);
            const fullName = cv.personal?.fullName || 'Unnamed Candidate';
            const title = getPrimaryTitle(cv);
            const location = getLocation(cv);
            return (
              <GlassCard
                key={cv.cvId ?? fullName}
                className="p-6 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/${encodeURIComponent(
                        String(cv.userId ?? fullName),
                      )}/100/100`}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[18px] font-semibold text-slate-900">
                      {fullName}
                    </span>
                    <span className="text-[14px] font-normal text-slate-500">
                      {title}
                    </span>
                  </div>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="text-[11px] px-3 py-1 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                  <span className="text-[14px] font-normal text-slate-500">
                    {location}
                  </span>
                  <button
                    onClick={() => setSelectedCv(cv)}
                    className="text-[#6366F1] text-[14px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    View Profile <ChevronRight size={16} />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedCv && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedCv(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              className="relative max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <GlassCard className="p-6 bg-slate-50 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[18px] font-semibold text-slate-900">
                    Candidate profile
                  </h3>
                  <button
                    onClick={() => setSelectedCv(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="border-t border-slate-200 pt-6">
                  <DashboardView role="seeker" data={selectedCv as CVData} />
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SELECT_CLASS =
  'h-[48px] px-5 rounded-[10px] bg-white/10 border border-[#E2E8F0] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all duration-200 text-[16px] font-normal w-full';
const TEXTAREA_CLASS =
  'min-h-[100px] p-5 rounded-[10px] bg-white/10 border border-[#E2E8F0] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all duration-200 text-[16px] font-normal placeholder:text-slate-400 resize-none w-full';

type LookupItem = { id: number; name: string };

const CVEditView: React.FC<{
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
  userId: number;
  categoryId: number;
  onDiscard: () => void;
  setCategoryId: React.Dispatch<React.SetStateAction<number>>;
}> = ({ data, setData, userId, categoryId, onDiscard, setCategoryId }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const tabs = ['personal', 'address', 'education', 'work', 'skills', 'certificates'];
  const [isSaving, setIsSaving] = useState(false);
  const [lookups, setLookups] = useState<{
    countries: LookupItem[];
    cities: LookupItem[];
    districts: LookupItem[];
    degreeLevels: LookupItem[];
    majors: LookupItem[];
    institutions: LookupItem[];
    jobTitles: LookupItem[];
    employmentTypes: LookupItem[];
    industries: LookupItem[];
    skills: LookupItem[];
    proficiencyLevels: LookupItem[];
    certificates: LookupItem[];
    issuingOrgs: LookupItem[];
    categories: LookupItem[];
  }>({
    countries: [], cities: [], districts: [],
    degreeLevels: [], majors: [], institutions: [],
    jobTitles: [], employmentTypes: [], industries: [],
    skills: [], proficiencyLevels: [], certificates: [], issuingOrgs: [],
    categories: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const [countries, degreeLevels, majors, institutions, jobTitles, employmentTypes, industries, skills, proficiencyLevels, certificates, issuingOrgs, categories] = await Promise.all([
          apiGetLookup('countries'),
          apiGetLookup('degree-levels'),
          apiGetLookup('majors'),
          apiGetLookup('institutions'),
          apiGetLookup('job-titles'),
          apiGetLookup('employment-types'),
          apiGetLookup('industries'),
          apiGetLookup('skills'),
          apiGetLookup('proficiency-levels'),
          apiGetLookup('certificates'),
          apiGetLookup('issuing-orgs'),
          apiGetLookup('categories'),
        ]);
        setLookups(prev => ({
          ...prev,
          countries: countries as LookupItem[],
          degreeLevels: degreeLevels as LookupItem[],
          majors: majors as LookupItem[],
          institutions: institutions as LookupItem[],
          jobTitles: jobTitles as LookupItem[],
          employmentTypes: employmentTypes as LookupItem[],
          industries: industries as LookupItem[],
          skills: skills as LookupItem[],
          proficiencyLevels: proficiencyLevels as LookupItem[],
          certificates: certificates as LookupItem[],
          issuingOrgs: issuingOrgs as LookupItem[],
          categories: categories as LookupItem[],
        }));
      } catch (e) {
        console.error('Failed to load lookups', e);
      }
    })();
  }, []);

  useEffect(() => {
    const id = data.address.countryId;
    if (id == null) {
      setLookups(prev => ({ ...prev, cities: [], districts: [] }));
      return;
    }
    apiGetLookup('cities', { countryId: id }).then((cities: any) => {
      setLookups(prev => ({ ...prev, cities, districts: [] }));
    }).catch(() => {});
  }, [data.address.countryId]);

  useEffect(() => {
    const id = data.address.cityId;
    if (id == null) {
      setLookups(prev => ({ ...prev, districts: [] }));
      return;
    }
    apiGetLookup('districts', { cityId: id }).then((districts: any) => {
      setLookups(prev => ({ ...prev, districts }));
    }).catch(() => {});
  }, [data.address.cityId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiSaveCv({
        userId,
        categoryId,
        personal: data.personal,
        address: {
          countryId: data.address.countryId ?? null,
          cityId: data.address.cityId ?? null,
          districtId: data.address.districtId ?? null,
          streetAddress: data.address.streetAddress,
          postalCode: data.address.postalCode,
        },
        education: data.education
          .filter(e => e.institutionId != null && e.degreeLevelId != null && e.majorId != null)
          .map(e => ({
            institutionId: e.institutionId!,
            degreeLevelId: e.degreeLevelId!,
            majorId: e.majorId!,
            startYear: e.startYear,
            endYear: e.endYear,
            description: e.description ?? '',
          })),
        work: data.work
          .filter(w => w.companyName.trim() !== '' && w.jobTitleId != null && w.employmentTypeId != null && w.industryId != null)
          .map(w => ({
            companyName: w.companyName,
            jobTitleId: w.jobTitleId!,
            employmentTypeId: w.employmentTypeId!,
            industryId: w.industryId!,
            startYear: w.startYear,
            endYear: w.endYear,
            isPresent: w.isPresent,
            description: w.description ?? '',
          })),
        skills: data.skills.slice(0, 5).filter(s => s.skillId != null && s.proficiencyId != null).map(s => ({
          skillId: s.skillId!,
          proficiencyId: s.proficiencyId!,
        })),
        certificates: data.certificates.filter(c => c.certificateId != null && c.issuingOrgId != null).map(c => ({
          certificateId: c.certificateId!,
          issuingOrgId: c.issuingOrgId!,
          issuedYear: c.issuedYear,
          description: c.description ?? '',
        })),
      });
      alert('CV saved');
    } catch (e) {
      console.error(e);
      alert('Failed to save CV');
    } finally {
      setIsSaving(false);
    }
  };

  const TabFooter = () => (
    <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-slate-100">
      <GlassButton variant="outline" className="w-[120px]">Cancel</GlassButton>
      <GlassButton className="w-[120px]" onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </GlassButton>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto flex flex-col gap-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[28px] font-[300] tracking-tight text-slate-900">Edit your CV</h2>
      </div>

      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 text-[14px] font-medium tracking-wide capitalize transition-all relative whitespace-nowrap ${
              activeTab === tab ? 'text-[#6366F1]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="cv-tab-active"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#6366F1]"
              />
            )}
          </button>
        ))}
      </div>

      <GlassCard className="p-10">
        <AnimatePresence mode="wait">
          {activeTab === 'personal' && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] text-slate-600 font-medium tracking-wide">Category</label>
                  <select
                    className={SELECT_CLASS}
                    value={categoryId}
                    onChange={(e) => {
                      const v = e.target.value;
                      const id = v === '' ? 1 : Number(v);
                      setCategoryId(id);
                    }}
                  >
                    <option value="">Select Category</option>
                    {(lookups.categories ?? []).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <GlassInput
                  label="Full Name"
                  placeholder="Your full name"
                  value={data.personal.fullName}
                  onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, fullName: e.target.value } }))}
                />
                <GlassInput
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  value={data.personal.email}
                  onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, email: e.target.value } }))}
                />
                <GlassInput
                  label="Phone"
                  placeholder="+1 (555) 000-0000"
                  value={data.personal.phone}
                  onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, phone: e.target.value } }))}
                />
                <GlassInput
                  label="Date of Birth"
                  type="date"
                  value={data.personal.dateOfBirth}
                  onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, dateOfBirth: e.target.value } }))}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] text-slate-600 font-medium tracking-wide">Gender</label>
                  <select
                    className={SELECT_CLASS}
                    value={data.personal.gender}
                    onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, gender: e.target.value as 'male' | 'female' | '' } }))}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="col-span-2 flex flex-col gap-2">
                  <label className="text-[14px] text-slate-600 font-medium tracking-wide">Bio</label>
                  <textarea
                    className={TEXTAREA_CLASS + ' min-h-[160px]'}
                    placeholder="Tell us about yourself..."
                    value={data.personal.bio}
                    onChange={(e) => setData(prev => ({ ...prev, personal: { ...prev.personal, bio: e.target.value } }))}
                  />
                </div>
              </div>
              <TabFooter />
            </motion.div>
          )}

          {activeTab === 'address' && (
            <motion.div
              key="address"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] text-slate-600 font-medium tracking-wide">Country</label>
                  <select
                    className={SELECT_CLASS}
                    value={data.address.countryId ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      const id = v === '' ? null : Number(v);
                      const name = id == null ? '' : (lookups.countries.find(c => c.id === id)?.name ?? '');
                      setData(prev => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          countryId: id,
                          country: name,
                          cityId: null,
                          city: '',
                          districtId: null,
                          district: '',
                        },
                      }));
                    }}
                  >
                    <option value="">Select Country</option>
                    {lookups.countries.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] text-slate-600 font-medium tracking-wide">City</label>
                  <select
                    className={SELECT_CLASS}
                    value={data.address.cityId ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      const id = v === '' ? null : Number(v);
                      const name = id == null ? '' : (lookups.cities.find(c => c.id === id)?.name ?? '');
                      setData(prev => ({
                        ...prev,
                        address: { ...prev.address, cityId: id, city: name, districtId: null, district: '' },
                      }));
                    }}
                  >
                    <option value="">Select City</option>
                    {lookups.cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] text-slate-600 font-medium tracking-wide">District</label>
                  <select
                    className={SELECT_CLASS}
                    value={data.address.districtId ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      const id = v === '' ? null : Number(v);
                      const name = id == null ? '' : (lookups.districts.find(d => d.id === id)?.name ?? '');
                      setData(prev => ({ ...prev, address: { ...prev.address, districtId: id, district: name } }));
                    }}
                  >
                    <option value="">Select District</option>
                    {lookups.districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <GlassInput
                  label="Street Address"
                  placeholder="123 Main St"
                  value={data.address.streetAddress}
                  onChange={(e) => setData(prev => ({ ...prev, address: { ...prev.address, streetAddress: e.target.value } }))}
                />
                <GlassInput
                  label="Postal Code"
                  placeholder="94105"
                  value={data.address.postalCode}
                  onChange={(e) => setData(prev => ({ ...prev, address: { ...prev.address, postalCode: e.target.value } }))}
                />
              </div>
              <TabFooter />
            </motion.div>
          )}

          {activeTab === 'education' && (
            <motion.div
              key="education"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <div className="flex flex-col gap-8">
                {data.education.map((edu, idx) => (
                  <div key={edu.id} className="grid grid-cols-2 gap-8 p-6 rounded-xl border border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Institution</label>
                      <select
                        className={SELECT_CLASS}
                        value={edu.institutionId ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          const id = v === '' ? undefined : Number(v);
                          const name = id == null ? '' : (lookups.institutions.find(i => i.id === id)?.name ?? '');
                          setData(prev => ({
                            ...prev,
                            education: prev.education.map((item, i) =>
                              i === idx ? { ...item, institutionId: id, institutions: name } : item
                            ),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.institutions.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Degree Level</label>
                      <select
                        className={SELECT_CLASS}
                        value={edu.degreeLevelId ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          const id = v === '' ? undefined : Number(v);
                          const name = id == null ? '' : (lookups.degreeLevels.find(d => d.id === id)?.name ?? '');
                          setData(prev => ({
                            ...prev,
                            education: prev.education.map((item, i) =>
                              i === idx ? { ...item, degreeLevelId: id, degreeLevel: name } : item
                            ),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.degreeLevels.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Major</label>
                      <select
                        className={SELECT_CLASS}
                        value={edu.majorId ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          const id = v === '' ? undefined : Number(v);
                          const name = id == null ? '' : (lookups.majors.find(m => m.id === id)?.name ?? '');
                          setData(prev => ({
                            ...prev,
                            education: prev.education.map((item, i) =>
                              i === idx ? { ...item, majorId: id, major: name } : item
                            ),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.majors.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <GlassInput
                      label="Start Year"
                      placeholder="2018"
                      value={edu.startYear}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        education: prev.education.map((item, i) => i === idx ? { ...item, startYear: e.target.value } : item),
                      }))}
                    />
                    <GlassInput
                      label="End Year"
                      placeholder="2022"
                      value={edu.endYear}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        education: prev.education.map((item, i) => i === idx ? { ...item, endYear: e.target.value } : item),
                      }))}
                    />
                    <div className="col-span-2 flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Description</label>
                      <textarea
                        className={TEXTAREA_CLASS}
                        placeholder="Optional"
                        value={edu.description ?? ''}
                        onChange={(e) => setData(prev => ({
                          ...prev,
                          education: prev.education.map((item, i) => i === idx ? { ...item, description: e.target.value } : item),
                        }))}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button type="button" onClick={() => setData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }))} className="text-red-500 text-sm hover:underline flex items-center gap-1">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setData(prev => ({
                    ...prev,
                    education: [...prev.education, {
                      id: `new-${Date.now()}`,
                      institutions: '',
                      degreeLevel: '',
                      startYear: '',
                      endYear: '',
                    }],
                  }))}
                  className="flex items-center gap-2 text-[#6366F1] text-[14px] font-medium hover:underline w-fit"
                >
                  <Plus size={16} /> Add education
                </button>
              </div>
              <TabFooter />
            </motion.div>
          )}

          {activeTab === 'work' && (
            <motion.div
              key="work"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <div className="flex flex-col gap-8">
                {data.work.map((w, idx) => (
                  <div key={w.id} className="grid grid-cols-2 gap-8 p-6 rounded-xl border border-slate-100 bg-slate-50/30">
                    <GlassInput
                      label="Company Name"
                      placeholder="Company"
                      value={w.companyName}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        work: prev.work.map((item, i) => i === idx ? { ...item, companyName: e.target.value } : item),
                      }))}
                    />
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Job Title</label>
                      <select
                        className={SELECT_CLASS}
                        value={w.jobTitleId ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          const id = v === '' ? undefined : Number(v);
                          const name = id == null ? '' : (lookups.jobTitles.find(j => j.id === id)?.name ?? '');
                          setData(prev => ({
                            ...prev,
                            work: prev.work.map((item, i) => i === idx ? { ...item, jobTitleId: id, jobTitle: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.jobTitles.map(j => (
                          <option key={j.id} value={j.id}>{j.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Employment Type</label>
                      <select
                        className={SELECT_CLASS}
                        value={w.employmentTypeId ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          const id = v === '' ? undefined : Number(v);
                          const name = id == null ? '' : (lookups.employmentTypes.find(e => e.id === id)?.name ?? '');
                          setData(prev => ({
                            ...prev,
                            work: prev.work.map((item, i) => i === idx ? { ...item, employmentTypeId: id, employmentType: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.employmentTypes.map(e => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Industry</label>
                      <select
                        className={SELECT_CLASS}
                        value={w.industryId ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          const id = v === '' ? undefined : Number(v);
                          const name = id == null ? '' : (lookups.industries.find(i => i.id === id)?.name ?? '');
                          setData(prev => ({
                            ...prev,
                            work: prev.work.map((item, i) => i === idx ? { ...item, industryId: id, industry: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.industries.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                    </div>
                    <GlassInput
                      label="Start Year"
                      placeholder="2022"
                      value={w.startYear}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        work: prev.work.map((item, i) => i === idx ? { ...item, startYear: e.target.value } : item),
                      }))}
                    />
                    <GlassInput
                      label="End Year"
                      placeholder="2024"
                      value={w.endYear}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        work: prev.work.map((item, i) => i === idx ? { ...item, endYear: e.target.value } : item),
                      }))}
                    />
                    <div className="flex flex-col gap-2 col-span-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Currently working here?</label>
                      <div className="flex gap-4 h-[48px] items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`isPresent-${idx}`}
                            checked={w.isPresent}
                            onChange={() => setData(prev => ({
                              ...prev,
                              work: prev.work.map((item, i) => i === idx ? { ...item, isPresent: true } : item),
                            }))}
                            className="accent-[#6366F1]"
                          />
                          <span className="text-[14px]">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`isPresent-${idx}`}
                            checked={!w.isPresent}
                            onChange={() => setData(prev => ({
                              ...prev,
                              work: prev.work.map((item, i) => i === idx ? { ...item, isPresent: false } : item),
                            }))}
                            className="accent-[#6366F1]"
                          />
                          <span className="text-[14px]">No</span>
                        </label>
                      </div>
                    </div>
                    <div className="col-span-2 flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Description</label>
                      <textarea
                        className={TEXTAREA_CLASS}
                        placeholder="Optional"
                        value={w.description ?? ''}
                        onChange={(e) => setData(prev => ({
                          ...prev,
                          work: prev.work.map((item, i) => i === idx ? { ...item, description: e.target.value } : item),
                        }))}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button type="button" onClick={() => setData(prev => ({ ...prev, work: prev.work.filter((_, i) => i !== idx) }))} className="text-red-500 text-sm hover:underline flex items-center gap-1">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setData(prev => ({
                    ...prev,
                    work: [...prev.work, {
                      id: `new-${Date.now()}`,
                      companyName: '',
                      jobTitle: '',
                      employmentType: '',
                      industry: '',
                      startYear: '',
                      endYear: '',
                      isPresent: false,
                    }],
                  }))}
                  className="flex items-center gap-2 text-[#6366F1] text-[14px] font-medium hover:underline w-fit"
                >
                  <Plus size={16} /> Add work experience
                </button>
              </div>
              <TabFooter />
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <div className="flex flex-col gap-8">
                {data.skills.map((s, idx) => (
                  <div key={s.id} className="grid grid-cols-2 gap-8 p-6 rounded-xl border border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Skill</label>
                      <select
                        className={SELECT_CLASS}
                        value={s.skillId ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          const id = v === '' ? undefined : Number(v);
                          const name = id == null ? '' : (lookups.skills.find(sk => sk.id === id)?.name ?? '');
                          setData(prev => ({
                            ...prev,
                            skills: prev.skills.map((item, i) => i === idx ? { ...item, skillId: id, skill: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.skills.map(sk => (
                          <option key={sk.id} value={sk.id}>{sk.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Proficiency</label>
                      <select
                        className={SELECT_CLASS}
                        value={s.proficiencyId ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          const id = v === '' ? undefined : Number(v);
                          const name = id == null ? '' : (lookups.proficiencyLevels.find(p => p.id === id)?.name ?? '');
                          setData(prev => ({
                            ...prev,
                            skills: prev.skills.map((item, i) => i === idx ? { ...item, proficiencyId: id, proficiency: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.proficiencyLevels.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button type="button" onClick={() => setData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))} className="text-red-500 text-sm hover:underline flex items-center gap-1">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
                {data.skills.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setData(prev => ({
                      ...prev,
                      skills: [...prev.skills, { id: `new-${Date.now()}`, skill: '', proficiency: '' }],
                    }))}
                    className="flex items-center gap-2 text-[#6366F1] text-[14px] font-medium hover:underline w-fit"
                  >
                    <Plus size={16} /> Add skill (max 5)
                  </button>
                )}
              </div>
              <TabFooter />
            </motion.div>
          )}

          {activeTab === 'certificates' && (
            <motion.div
              key="certificates"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <div className="flex flex-col gap-8">
                {data.certificates.map((c, idx) => (
                  <div key={c.id} className="grid grid-cols-2 gap-8 p-6 rounded-xl border border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Certificate</label>
                      <select
                        className={SELECT_CLASS}
                        value={c.certificateId ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          const id = v === '' ? undefined : Number(v);
                          const name = id == null ? '' : (lookups.certificates.find(cert => cert.id === id)?.name ?? '');
                          setData(prev => ({
                            ...prev,
                            certificates: prev.certificates.map((item, i) => i === idx ? { ...item, certificateId: id, certificate: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.certificates.map(cert => (
                          <option key={cert.id} value={cert.id}>{cert.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Issuing Organization</label>
                      <select
                        className={SELECT_CLASS}
                        value={c.issuingOrgId ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          const id = v === '' ? undefined : Number(v);
                          const name = id == null ? '' : (lookups.issuingOrgs.find(o => o.id === id)?.name ?? '');
                          setData(prev => ({
                            ...prev,
                            certificates: prev.certificates.map((item, i) => i === idx ? { ...item, issuingOrgId: id, issuingOrganization: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.issuingOrgs.map(o => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </div>
                    <GlassInput
                      label="Issued Year"
                      placeholder="2023"
                      value={c.issuedYear}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        certificates: prev.certificates.map((item, i) => i === idx ? { ...item, issuedYear: e.target.value } : item),
                      }))}
                    />
                    <div className="col-span-2 flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Description</label>
                      <textarea
                        className={TEXTAREA_CLASS}
                        placeholder="Optional"
                        value={c.description}
                        onChange={(e) => setData(prev => ({
                          ...prev,
                          certificates: prev.certificates.map((item, i) => i === idx ? { ...item, description: e.target.value } : item),
                        }))}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button type="button" onClick={() => setData(prev => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== idx) }))} className="text-red-500 text-sm hover:underline flex items-center gap-1">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setData(prev => ({
                    ...prev,
                    certificates: [...prev.certificates, {
                      id: `new-${Date.now()}`,
                      certificate: '',
                      issuingOrganization: '',
                      issuedYear: '',
                      description: '',
                    }],
                  }))}
                  className="flex items-center gap-2 text-[#6366F1] text-[14px] font-medium hover:underline w-fit"
                >
                  <Plus size={16} /> Add certificate
                </button>
              </div>
              <TabFooter />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
};

const SearchView: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto flex flex-col gap-12"
    >
      <div className="flex flex-col gap-10 items-center text-center">
        <h2 className="text-[56px] font-[300] tracking-tight text-slate-900">Find your next talent.</h2>
        <div className="w-full max-w-3xl relative">
          <input 
            type="text" 
            placeholder="Search by name, skills, or location..." 
            className="w-full h-[72px] px-10 rounded-full glass border-[#E2E8F0] focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 outline-none transition-all duration-300 text-[20px] font-normal shadow-xl"
          />
          <div className="absolute right-5 top-3.5">
            <GlassButton className="h-[44px] rounded-full px-10">Search</GlassButton>
          </div>
        </div>
        
        <div className="flex gap-4 flex-wrap justify-center">
          {['Remote', 'Full-time', 'Senior', 'React', 'Design'].map(tag => (
            <div key={tag} className="px-6 py-2 rounded-full bg-white border border-slate-200 text-[14px] font-medium text-slate-600 hover:border-[#6366F1] hover:text-[#6366F1] cursor-pointer transition-all shadow-sm">
              {tag}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GlassCard key={i} className="p-6 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
                <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col">
                <span className="text-[18px] font-semibold text-slate-900">Jordan Smith</span>
                <span className="text-[14px] font-normal text-slate-500">Senior Product Designer</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['Figma', 'React', 'UI/UX'].map(skill => (
                <span key={skill} className="text-[11px] px-3 py-1 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider font-bold">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-slate-100">
              <span className="text-[14px] font-normal text-slate-500">San Francisco, CA</span>
              <button className="text-[#6366F1] text-[14px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                View Profile <ChevronRight size={16} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
}

const LOOKUP_OPTIONS: Array<{ value: AdminLookupType; label: string }> = [
  { value: 'skills', label: 'Skills' },
  { value: 'categories', label: 'CV Categories' },
  { value: 'degree-levels', label: 'Degrees' },
  { value: 'majors', label: 'Majors' },
  { value: 'industries', label: 'Industries' },
  { value: 'employment-types', label: 'Employment Types' },
  { value: 'certificates', label: 'Certificates' },
  { value: 'countries', label: 'Locations - Countries' },
  { value: 'cities', label: 'Locations - Cities' },
  { value: 'districts', label: 'Locations - Districts' },
];

const AdminView: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    employers: 0,
    seekers: 0,
    activeCvs: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'seeker' | 'employer' | 'admin'>('all');
  const [lookupType, setLookupType] = useState<AdminLookupType>('skills');
  const [lookupItems, setLookupItems] = useState<AdminLookupItem[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [newLookupName, setNewLookupName] = useState('');
  const [countryItems, setCountryItems] = useState<AdminLookupItem[]>([]);
  const [cityItems, setCityItems] = useState<AdminLookupItem[]>([]);
  const [lookupParentId, setLookupParentId] = useState<number | undefined>(undefined);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingParentId, setEditingParentId] = useState<number | undefined>(undefined);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiFetchAdminUsers({
        q: searchTerm.trim() === '' ? undefined : searchTerm,
        role: roleFilter === 'all' ? undefined : roleFilter,
      });
      setUsers(Array.isArray(res.users) ? res.users : []);
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (e) {
      console.error('Failed to load admin users', e);
      setError('Failed to load users from database.');
      setUsers([]);
      setSummary({
        totalUsers: 0,
        activeUsers: 0,
        admins: 0,
        employers: 0,
        seekers: 0,
        activeCvs: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadLocationParents = useCallback(async () => {
    try {
      const [countriesRes, citiesRes] = await Promise.all([
        apiFetchAdminLookup('countries'),
        apiFetchAdminLookup('cities'),
      ]);
      setCountryItems(Array.isArray(countriesRes.items) ? countriesRes.items : []);
      setCityItems(Array.isArray(citiesRes.items) ? citiesRes.items : []);
    } catch (e) {
      console.error('Failed to load location parents', e);
    }
  }, []);

  useEffect(() => {
    loadLocationParents();
  }, [loadLocationParents]);

  useEffect(() => {
    if (lookupType === 'cities' && countryItems.length > 0 && !lookupParentId) {
      setLookupParentId(countryItems[0].id);
      return;
    }
    if (lookupType === 'districts' && cityItems.length > 0 && !lookupParentId) {
      setLookupParentId(cityItems[0].id);
      return;
    }
    if (lookupType !== 'cities' && lookupType !== 'districts') {
      setLookupParentId(undefined);
    }
  }, [lookupType, countryItems, cityItems, lookupParentId]);

  const loadLookupItems = useCallback(async () => {
    try {
      setLookupLoading(true);
      setLookupError(null);
      const needsParent = lookupType === 'cities' || lookupType === 'districts';
      if (needsParent && !lookupParentId) {
        setLookupItems([]);
        return;
      }
      const res = await apiFetchAdminLookup(
        lookupType,
        needsParent && lookupParentId ? { parentId: lookupParentId } : undefined,
      );
      setLookupItems(Array.isArray(res.items) ? res.items : []);
    } catch (e: any) {
      console.error('Failed to load lookup entries', e);
      setLookupError(e?.message || 'Failed to load lookup entries');
      setLookupItems([]);
    } finally {
      setLookupLoading(false);
    }
  }, [lookupType, lookupParentId]);

  useEffect(() => {
    loadLookupItems();
  }, [loadLookupItems]);

  const formatRole = (role: string) => {
    if (role === 'seeker') return 'Job Seeker';
    if (role === 'employer') return 'Employer';
    if (role === 'admin') return 'Admin';
    return role;
  };

  const formatDate = (value: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  const getParentOptions = () => {
    if (lookupType === 'cities') return countryItems;
    if (lookupType === 'districts') return cityItems;
    return [];
  };

  const getParentLabel = () => {
    if (lookupType === 'cities') return 'Country';
    if (lookupType === 'districts') return 'City';
    return 'Parent';
  };

  const createLookup = async () => {
    const name = newLookupName.trim();
    if (name === '') return;
    const needsParent = lookupType === 'cities' || lookupType === 'districts';
    if (needsParent && !lookupParentId) {
      setLookupError(`${getParentLabel()} is required`);
      return;
    }
    try {
      setLookupError(null);
      await apiCreateAdminLookup({
        type: lookupType,
        name,
        parentId: needsParent ? lookupParentId : undefined,
      });
      setNewLookupName('');
      await loadLookupItems();
      if (lookupType === 'countries' || lookupType === 'cities') {
        await loadLocationParents();
      }
    } catch (e: any) {
      setLookupError(e?.message || 'Failed to create value');
    }
  };

  const startEditLookup = (item: AdminLookupItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setEditingParentId(item.parentId ?? lookupParentId);
  };

  const cancelEditLookup = () => {
    setEditingId(null);
    setEditingName('');
    setEditingParentId(undefined);
  };

  const saveEditLookup = async () => {
    if (editingId == null) return;
    const name = editingName.trim();
    if (name === '') return;
    const needsParent = lookupType === 'cities' || lookupType === 'districts';
    if (needsParent && !editingParentId) {
      setLookupError(`${getParentLabel()} is required`);
      return;
    }
    try {
      setLookupError(null);
      await apiUpdateAdminLookup({
        type: lookupType,
        id: editingId,
        name,
        parentId: needsParent ? editingParentId : undefined,
      });
      cancelEditLookup();
      await loadLookupItems();
      if (lookupType === 'countries' || lookupType === 'cities') {
        await loadLocationParents();
      }
    } catch (e: any) {
      setLookupError(e?.message || 'Failed to update value');
    }
  };

  const deleteLookup = async (id: number) => {
    const ok = window.confirm('Delete this lookup value?');
    if (!ok) return;
    try {
      setLookupError(null);
      await apiDeleteAdminLookup({ type: lookupType, id });
      await loadLookupItems();
      if (lookupType === 'countries' || lookupType === 'cities') {
        await loadLocationParents();
      }
    } catch (e: any) {
      setLookupError(e?.message || 'Failed to delete value');
    }
  };

  const parentOptions = getParentOptions();
  const parentLabel = getParentLabel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto flex flex-col gap-12"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[28px] font-[300] tracking-tight text-slate-900">User Management</h2>
        <div className="flex gap-3">
          <GlassButton variant="outline" onClick={loadUsers} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </GlassButton>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8">
        {[
          { label: 'Total Users', value: summary.totalUsers },
          { label: 'Active Users', value: summary.activeUsers },
          { label: 'Users With CV', value: summary.activeCvs },
          { label: 'Employers', value: summary.employers },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-8 flex flex-col gap-3">
            <span className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-4">
              <span className="text-[32px] font-[300] text-slate-900">{stat.value}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between gap-4">
          <span className="text-[16px] font-semibold text-slate-900">Registered Users</span>
          <div className="flex gap-3 items-center">
            <div className="h-[40px] px-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Search size={16} className="text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name/email..."
                className="bg-transparent border-none outline-none text-[14px] font-normal w-[220px]"
              />
            </div>
            <select
              className="h-[40px] px-3 rounded-lg bg-slate-50 border border-slate-200 text-[14px] text-slate-700 outline-none"
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as 'all' | 'seeker' | 'employer' | 'admin')
              }
            >
              <option value="all">All roles</option>
              <option value="seeker">Job Seeker</option>
              <option value="employer">Employer</option>
              <option value="admin">Admin</option>
            </select>
            <GlassButton onClick={loadUsers} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Apply'}
            </GlassButton>
          </div>
        </div>

        {error ? (
          <div className="px-8 py-6 text-sm text-red-500">{error}</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-8 py-5 text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-8 py-5 text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-5 text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-8 text-center text-sm text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isActive = user.isActive === null ? true : user.isActive;
                  return (
                    <tr key={user.userId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold">
                            {(user.name || user.email || 'U').slice(0, 1).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[15px] font-medium text-slate-800">
                              {user.name || 'Unnamed User'}
                            </span>
                            <span className="text-[12px] text-slate-500">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[14px] font-normal text-slate-600">
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          <span className="text-[14px] font-medium text-slate-700">
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[14px] font-normal text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between gap-4">
          <span className="text-[16px] font-semibold text-slate-900">Lookup Management</span>
          <div className="flex gap-3 items-center">
            <select
              className="h-[40px] px-3 rounded-lg bg-slate-50 border border-slate-200 text-[14px] text-slate-700 outline-none min-w-[240px]"
              value={lookupType}
              onChange={(e) => {
                setLookupType(e.target.value as AdminLookupType);
                setEditingId(null);
                setLookupError(null);
              }}
            >
              {LOOKUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {(lookupType === 'cities' || lookupType === 'districts') && (
              <select
                className="h-[40px] px-3 rounded-lg bg-slate-50 border border-slate-200 text-[14px] text-slate-700 outline-none min-w-[180px]"
                value={lookupParentId ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setLookupParentId(v === '' ? undefined : Number(v));
                }}
              >
                <option value="">Select {parentLabel}</option>
                {parentOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
            <GlassButton variant="outline" onClick={loadLookupItems} disabled={lookupLoading}>
              {lookupLoading ? 'Refreshing...' : 'Refresh'}
            </GlassButton>
          </div>
        </div>

        <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
          <input
            type="text"
            value={newLookupName}
            onChange={(e) => setNewLookupName(e.target.value)}
            placeholder="New value name"
            className="h-[40px] px-4 rounded-lg bg-slate-50 border border-slate-200 outline-none text-[14px] w-[280px]"
          />
          <GlassButton onClick={createLookup}>Add</GlassButton>
        </div>

        {lookupError && <div className="px-8 py-4 text-sm text-red-500">{lookupError}</div>}

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                Name
              </th>
              {(lookupType === 'cities' || lookupType === 'districts') && (
                <th className="px-8 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                  {parentLabel}
                </th>
              )}
              <th className="px-8 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!lookupLoading && lookupItems.length === 0 ? (
              <tr>
                <td
                  colSpan={lookupType === 'cities' || lookupType === 'districts' ? 3 : 2}
                  className="px-8 py-8 text-center text-sm text-slate-500"
                >
                  No values found.
                </td>
              </tr>
            ) : (
              lookupItems.map((item) => {
                const parentName =
                  parentOptions.find((p) => p.id === item.parentId)?.name ?? '-';
                const isEditing = editingId === item.id;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="h-[36px] px-3 rounded-lg bg-white border border-slate-200 outline-none text-[14px] w-[280px]"
                        />
                      ) : (
                        <span className="text-[14px] text-slate-700">{item.name}</span>
                      )}
                    </td>
                    {(lookupType === 'cities' || lookupType === 'districts') && (
                      <td className="px-8 py-4">
                        {isEditing ? (
                          <select
                            className="h-[36px] px-3 rounded-lg bg-white border border-slate-200 outline-none text-[14px] min-w-[180px]"
                            value={editingParentId ?? ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setEditingParentId(v === '' ? undefined : Number(v));
                            }}
                          >
                            <option value="">Select {parentLabel}</option>
                            {parentOptions.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[14px] text-slate-500">{parentName}</span>
                        )}
                      </td>
                    )}
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="text-emerald-600 hover:underline text-sm"
                              onClick={saveEditLookup}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="text-slate-500 hover:underline text-sm"
                              onClick={cancelEditLookup}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="text-[#6366F1] hover:underline text-sm"
                              onClick={() => startEditLookup(item)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-red-500 hover:underline text-sm"
                              onClick={() => deleteLookup(item.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </GlassCard>
    </motion.div>
  );
}

function ConfettiEffect({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 0,
            rotate: 0 
          }}
          animate={{ 
            x: (Math.random() - 0.5) * 1000, 
            y: (Math.random() - 0.5) * 1000,
            scale: [0, 1, 0],
            rotate: Math.random() * 360 
          }}
          transition={{ 
            duration: 2 + Math.random(), 
            ease: "easeOut" 
          }}
          className="absolute w-2 h-2 rounded-sm bg-[#6366F1]"
          style={{ 
            backgroundColor: i % 2 === 0 ? '#6366F1' : '#A5B4FC',
            opacity: 0.6
          }}
        />
      ))}
    </div>
  );
}
