import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CVData } from '../../types';
import { apiFetchAllCvs } from '../../api';
import { getPrimaryTitle, getSkills, getLocation } from '../../lib/cv-helpers';
import { CvCard } from '../../components/shared/CvCard';
import { CvProfileModal } from '../../components/shared/CvProfileModal';

export const EmployerDashboardView: React.FC = () => {
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
          {cvs.map((cv) => (
            <CvCard
              key={cv.cvId ?? cv.personal?.fullName ?? cv.userId}
              fullName={cv.personal?.fullName || 'Unnamed Candidate'}
              title={getPrimaryTitle(cv)}
              location={getLocation(cv)}
              skills={getSkills(cv)}
              avatarSeed={String(cv.userId ?? cv.personal?.fullName ?? '')}
              onViewProfile={() => setSelectedCv(cv)}
            />
          ))}
        </div>
      )}

      <CvProfileModal
        cv={selectedCv as CVData | null}
        onClose={() => setSelectedCv(null)}
        cardClassName="bg-olive-50"
      />
    </motion.div>
  );
};
