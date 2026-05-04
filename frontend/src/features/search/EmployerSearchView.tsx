import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GlassCard, GlassButton, GlassInput } from '../../components/GlassUI';
import { CVData } from '../../types';
import { apiGetLookup, apiSearchCvs, type CvSearchParams } from '../../api';
import { SELECT_CLASS, type LookupItem } from '../../lib/styles';
import { getPrimaryTitle, getSkills, getLocation } from '../../lib/cv-helpers';
import { CvCard } from '../../components/shared/CvCard';
import { CvProfileModal } from '../../components/shared/CvProfileModal';

export const EmployerSearchView: React.FC = () => {
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
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const pageSize = 9;

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
      setLookups((prev) => ({ ...prev, cities: [] }));
      setCityId(undefined);
      return;
    }
    apiGetLookup('cities', { countryId })
      .then((cities: any) => {
        setLookups((prev) => ({ ...prev, cities }));
      })
      .catch(() => {});
  }, [countryId]);

  const handleToggleSkill = (id: number) => {
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const handleSearch = async (searchPage = 1) => {
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
    params.page = searchPage;
    params.pageSize = pageSize;

    try {
      setIsLoading(true);
      setError(null);
      const res = await apiSearchCvs(params);
      if (res && Array.isArray(res.results)) {
        setResults(res.results);
        setTotalResults(res.total ?? res.results.length);
      } else if (Array.isArray(res)) {
        setResults(res);
        setTotalResults(res.length);
      } else {
        setResults([]);
        setTotalResults(0);
      }
      setPage(searchPage);
    } catch (e) {
      console.error(e);
      setError('Failed to search CVs.');
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    handleSearch(p);
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
    setPage(1);
    setTotalResults(0);
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
              <GlassButton onClick={() => handleSearch(1)} disabled={isLoading}>
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
          {results.map((cv) => (
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

      {/* Pagination */}
      {results.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                acc.push('ellipsis');
              }
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">...</span>
              ) : (
                <button
                  key={item}
                  onClick={() => goToPage(item)}
                  className={`w-9 h-9 rounded-lg text-[13px] font-medium transition-colors ${
                    page === item
                      ? 'bg-[#6366F1] text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              ),
            )}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      <CvProfileModal
        cv={selectedCv as CVData | null}
        onClose={() => setSelectedCv(null)}
        cardClassName="bg-slate-50"
      />
    </motion.div>
  );
};
