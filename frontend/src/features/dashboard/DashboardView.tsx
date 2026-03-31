import { motion } from 'motion/react';
import { GlassCard } from '../../components/GlassUI';
import { UserRole, CVData } from '../../types';

interface DashboardViewProps {
  role: UserRole;
  data: CVData;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ role, data }) => {
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
            <div className="flex flex-col gap-8">
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

              <section className="pt-4 border-t border-slate-200 mt-2">
                <p className="text-[14px] text-slate-500">
                  <span className="uppercase tracking-[0.2em] text-slate-400">
                    Reference
                  </span>{' '}
                  – References available upon request.
                </p>
              </section>
            </div>

            <div className="flex flex-col gap-8">
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
};
