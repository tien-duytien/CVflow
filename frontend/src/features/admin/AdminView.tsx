import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { GlassCard, GlassButton } from '../../components/GlassUI';
import {
  apiFetchAdminUsers,
  apiFetchAdminLookup,
  apiCreateAdminLookup,
  apiUpdateAdminLookup,
  apiDeleteAdminLookup,
  type AdminUser,
  type AdminLookupType,
  type AdminLookupItem,
} from '../../api';

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

export const AdminView: React.FC = () => {
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
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
};
