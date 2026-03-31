/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { UserRole, CVData } from './types';
import { apiLogin, apiFetchCv } from './api';
import { getNavItemsForRole, getDefaultTabForRole } from './lib/navigation';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ConfettiEffect } from './components/shared/ConfettiEffect';
import { AuthView } from './features/auth/AuthView';
import { DashboardView } from './features/dashboard/DashboardView';
import { EmployerDashboardView } from './features/dashboard/EmployerDashboardView';
import { CVEditView } from './features/cv-edit/CVEditView';
import { SearchView } from './features/search/SearchView';
import { EmployerSearchView } from './features/search/EmployerSearchView';
import { AdminView } from './features/admin/AdminView';

const EMPTY_CV_DATA: CVData = {
  personal: { fullName: '', email: '', phone: '', bio: '', dateOfBirth: '', gender: '' },
  address: { country: '', city: '', district: '', streetAddress: '', postalCode: '' },
  education: [],
  work: [],
  skills: [],
  certificates: [],
};

function parseCvResponse(cvRes: any): CVData {
  return {
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
  };
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

  const [cvData, setCvData] = useState<CVData>(EMPTY_CV_DATA);

  const handleDiscardCv = useCallback(async () => {
    if (currentUserId == null) return;
    try {
      const cvRes = await apiFetchCv(currentUserId);
      if (cvRes.hasCv) {
        setCategoryId(cvRes.categoryId ?? 1);
        setCvData(parseCvResponse(cvRes));
      } else {
        setCvData(EMPTY_CV_DATA);
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
          setCvData(parseCvResponse(cvRes));
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
      <Sidebar
        navItems={roleNavItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={() => setIsLoggedIn(false)}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <TopBar fullName={cvData.personal.fullName} role={role} />

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

      {showConfetti && <ConfettiEffect onComplete={() => setShowConfetti(false)} />}
    </div>
  );
}
