import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2 } from 'lucide-react';
import { GlassCard, GlassButton, GlassInput } from '../../components/GlassUI';
import { CVData } from '../../types';
import { apiGetLookup, apiSaveCv } from '../../api';
import { SELECT_CLASS, TEXTAREA_CLASS, type LookupItem } from '../../lib/styles';

interface CVEditViewProps {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
  userId: number;
  categoryId: number;
  setCategoryId: React.Dispatch<React.SetStateAction<number>>;
  onDiscard: () => void;
}

export const CVEditView: React.FC<CVEditViewProps> = ({
  data,
  setData,
  userId,
  categoryId,
  onDiscard,
  setCategoryId,
}) => {
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
        setLookups((prev) => ({
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
      setLookups((prev) => ({ ...prev, cities: [], districts: [] }));
      return;
    }
    apiGetLookup('cities', { countryId: id })
      .then((cities: any) => {
        setLookups((prev) => ({ ...prev, cities, districts: [] }));
      })
      .catch(() => {});
  }, [data.address.countryId]);

  useEffect(() => {
    const id = data.address.cityId;
    if (id == null) {
      setLookups((prev) => ({ ...prev, districts: [] }));
      return;
    }
    apiGetLookup('districts', { cityId: id })
      .then((districts: any) => {
        setLookups((prev) => ({ ...prev, districts }));
      })
      .catch(() => {});
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
          .filter((e) => e.institutionId != null && e.degreeLevelId != null && e.majorId != null)
          .map((e) => ({
            institutionId: e.institutionId!,
            degreeLevelId: e.degreeLevelId!,
            majorId: e.majorId!,
            startYear: e.startYear,
            endYear: e.endYear,
            description: e.description ?? '',
          })),
        work: data.work
          .filter((w) => w.companyName.trim() !== '' && w.jobTitleId != null && w.employmentTypeId != null && w.industryId != null)
          .map((w) => ({
            companyName: w.companyName,
            jobTitleId: w.jobTitleId!,
            employmentTypeId: w.employmentTypeId!,
            industryId: w.industryId!,
            startYear: w.startYear,
            endYear: w.endYear,
            isPresent: w.isPresent,
            description: w.description ?? '',
          })),
        skills: data.skills
          .slice(0, 5)
          .filter((s) => s.skillId != null && s.proficiencyId != null)
          .map((s) => ({
            skillId: s.skillId!,
            proficiencyId: s.proficiencyId!,
          })),
        certificates: data.certificates
          .filter((c) => c.certificateId != null && c.issuingOrgId != null)
          .map((c) => ({
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
                  onChange={(e) => setData((prev) => ({ ...prev, personal: { ...prev.personal, fullName: e.target.value } }))}
                />
                <GlassInput
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  value={data.personal.email}
                  onChange={(e) => setData((prev) => ({ ...prev, personal: { ...prev.personal, email: e.target.value } }))}
                />
                <GlassInput
                  label="Phone"
                  placeholder="+1 (555) 000-0000"
                  value={data.personal.phone}
                  onChange={(e) => setData((prev) => ({ ...prev, personal: { ...prev.personal, phone: e.target.value } }))}
                />
                <GlassInput
                  label="Date of Birth"
                  type="date"
                  value={data.personal.dateOfBirth}
                  onChange={(e) => setData((prev) => ({ ...prev, personal: { ...prev.personal, dateOfBirth: e.target.value } }))}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] text-slate-600 font-medium tracking-wide">Gender</label>
                  <select
                    className={SELECT_CLASS}
                    value={data.personal.gender}
                    onChange={(e) => setData((prev) => ({ ...prev, personal: { ...prev.personal, gender: e.target.value as 'male' | 'female' | '' } }))}
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
                    onChange={(e) => setData((prev) => ({ ...prev, personal: { ...prev.personal, bio: e.target.value } }))}
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
                      const name = id == null ? '' : (lookups.countries.find((c) => c.id === id)?.name ?? '');
                      setData((prev) => ({
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
                    {lookups.countries.map((c) => (
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
                      const name = id == null ? '' : (lookups.cities.find((c) => c.id === id)?.name ?? '');
                      setData((prev) => ({
                        ...prev,
                        address: { ...prev.address, cityId: id, city: name, districtId: null, district: '' },
                      }));
                    }}
                  >
                    <option value="">Select City</option>
                    {lookups.cities.map((c) => (
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
                      const name = id == null ? '' : (lookups.districts.find((d) => d.id === id)?.name ?? '');
                      setData((prev) => ({ ...prev, address: { ...prev.address, districtId: id, district: name } }));
                    }}
                  >
                    <option value="">Select District</option>
                    {lookups.districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <GlassInput
                  label="Street Address"
                  placeholder="123 Main St"
                  value={data.address.streetAddress}
                  onChange={(e) => setData((prev) => ({ ...prev, address: { ...prev.address, streetAddress: e.target.value } }))}
                />
                <GlassInput
                  label="Postal Code"
                  placeholder="94105"
                  value={data.address.postalCode}
                  onChange={(e) => setData((prev) => ({ ...prev, address: { ...prev.address, postalCode: e.target.value } }))}
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
                          const name = id == null ? '' : (lookups.institutions.find((i) => i.id === id)?.name ?? '');
                          setData((prev) => ({
                            ...prev,
                            education: prev.education.map((item, i) =>
                              i === idx ? { ...item, institutionId: id, institutions: name } : item
                            ),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.institutions.map((i) => (
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
                          const name = id == null ? '' : (lookups.degreeLevels.find((d) => d.id === id)?.name ?? '');
                          setData((prev) => ({
                            ...prev,
                            education: prev.education.map((item, i) =>
                              i === idx ? { ...item, degreeLevelId: id, degreeLevel: name } : item
                            ),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.degreeLevels.map((d) => (
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
                          const name = id == null ? '' : (lookups.majors.find((m) => m.id === id)?.name ?? '');
                          setData((prev) => ({
                            ...prev,
                            education: prev.education.map((item, i) =>
                              i === idx ? { ...item, majorId: id, major: name } : item
                            ),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.majors.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <GlassInput
                      label="Start Year"
                      placeholder="2018"
                      value={edu.startYear}
                      onChange={(e) => setData((prev) => ({
                        ...prev,
                        education: prev.education.map((item, i) => i === idx ? { ...item, startYear: e.target.value } : item),
                      }))}
                    />
                    <GlassInput
                      label="End Year"
                      placeholder="2022"
                      value={edu.endYear}
                      onChange={(e) => setData((prev) => ({
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
                        onChange={(e) => setData((prev) => ({
                          ...prev,
                          education: prev.education.map((item, i) => i === idx ? { ...item, description: e.target.value } : item),
                        }))}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button type="button" onClick={() => setData((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }))} className="text-red-500 text-sm hover:underline flex items-center gap-1">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setData((prev) => ({
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
                      onChange={(e) => setData((prev) => ({
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
                          const name = id == null ? '' : (lookups.jobTitles.find((j) => j.id === id)?.name ?? '');
                          setData((prev) => ({
                            ...prev,
                            work: prev.work.map((item, i) => i === idx ? { ...item, jobTitleId: id, jobTitle: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.jobTitles.map((j) => (
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
                          const name = id == null ? '' : (lookups.employmentTypes.find((e) => e.id === id)?.name ?? '');
                          setData((prev) => ({
                            ...prev,
                            work: prev.work.map((item, i) => i === idx ? { ...item, employmentTypeId: id, employmentType: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.employmentTypes.map((e) => (
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
                          const name = id == null ? '' : (lookups.industries.find((i) => i.id === id)?.name ?? '');
                          setData((prev) => ({
                            ...prev,
                            work: prev.work.map((item, i) => i === idx ? { ...item, industryId: id, industry: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.industries.map((i) => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                    </div>
                    <GlassInput
                      label="Start Year"
                      placeholder="2022"
                      value={w.startYear}
                      onChange={(e) => setData((prev) => ({
                        ...prev,
                        work: prev.work.map((item, i) => i === idx ? { ...item, startYear: e.target.value } : item),
                      }))}
                    />
                    <GlassInput
                      label="End Year"
                      placeholder="2024"
                      value={w.endYear}
                      onChange={(e) => setData((prev) => ({
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
                            onChange={() => setData((prev) => ({
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
                            onChange={() => setData((prev) => ({
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
                        onChange={(e) => setData((prev) => ({
                          ...prev,
                          work: prev.work.map((item, i) => i === idx ? { ...item, description: e.target.value } : item),
                        }))}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button type="button" onClick={() => setData((prev) => ({ ...prev, work: prev.work.filter((_, i) => i !== idx) }))} className="text-red-500 text-sm hover:underline flex items-center gap-1">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setData((prev) => ({
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
                          const name = id == null ? '' : (lookups.skills.find((sk) => sk.id === id)?.name ?? '');
                          setData((prev) => ({
                            ...prev,
                            skills: prev.skills.map((item, i) => i === idx ? { ...item, skillId: id, skill: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.skills.map((sk) => (
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
                          const name = id == null ? '' : (lookups.proficiencyLevels.find((p) => p.id === id)?.name ?? '');
                          setData((prev) => ({
                            ...prev,
                            skills: prev.skills.map((item, i) => i === idx ? { ...item, proficiencyId: id, proficiency: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.proficiencyLevels.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button type="button" onClick={() => setData((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))} className="text-red-500 text-sm hover:underline flex items-center gap-1">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
                {data.skills.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setData((prev) => ({
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
                          const name = id == null ? '' : (lookups.certificates.find((cert) => cert.id === id)?.name ?? '');
                          setData((prev) => ({
                            ...prev,
                            certificates: prev.certificates.map((item, i) => i === idx ? { ...item, certificateId: id, certificate: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.certificates.map((cert) => (
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
                          const name = id == null ? '' : (lookups.issuingOrgs.find((o) => o.id === id)?.name ?? '');
                          setData((prev) => ({
                            ...prev,
                            certificates: prev.certificates.map((item, i) => i === idx ? { ...item, issuingOrgId: id, issuingOrganization: name } : item),
                          }));
                        }}
                      >
                        <option value="">Select</option>
                        {lookups.issuingOrgs.map((o) => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </div>
                    <GlassInput
                      label="Issued Year"
                      placeholder="2023"
                      value={c.issuedYear}
                      onChange={(e) => setData((prev) => ({
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
                        onChange={(e) => setData((prev) => ({
                          ...prev,
                          certificates: prev.certificates.map((item, i) => i === idx ? { ...item, description: e.target.value } : item),
                        }))}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button type="button" onClick={() => setData((prev) => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== idx) }))} className="text-red-500 text-sm hover:underline flex items-center gap-1">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setData((prev) => ({
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
