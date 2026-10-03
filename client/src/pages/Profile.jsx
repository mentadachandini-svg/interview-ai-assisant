import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Calendar,
  Sparkles
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    preferredRole: user?.preferredRole || 'Software Engineer',
    experienceLevel: user?.experienceLevel || 'Beginner',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (successMsg) setSuccessMsg('');
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await updateProfile(formData);
    setSaving(false);

    if (res.success) {
      setSuccessMsg('Your profile has been updated successfully!');
    } else {
      setErrorMsg(res.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
          <User className="w-3.5 h-3.5" />
          <span>FR3 • User Profile & Preferences</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Account & Interview Preferences
        </h1>
        <p className="text-sm text-slate-400">
          Manage your personal details and default mock interview targets.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-3xl shadow-glow">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>

          <div className="w-full pt-4 border-t border-slate-800 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Account Status:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Target Role:</span>
              <span className="font-semibold text-slate-200">{user?.preferredRole || 'Software Engineer'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Experience:</span>
              <span className="font-semibold text-slate-200">{user?.experienceLevel || 'Beginner'}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl glass-panel border border-white/5 space-y-6">
          <h3 className="text-lg font-bold text-white pb-3 border-b border-slate-800">
            Edit Profile Details
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            {/* Email Address (Disabled per FR3) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                  Email Address
                </label>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Locked per security rule (FR3)</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm opacity-60 cursor-not-allowed bg-slate-950/40 text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                To modify your primary login email, complete the security re-authentication protocol.
              </p>
            </div>

            {/* Target Role & Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                  Default Target Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <select
                    name="preferredRole"
                    value={formData.preferredRole}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm bg-slate-900 text-slate-200"
                  >
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Python Developer">Python Developer</option>
                    <option value="Java Developer">Java Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Data Analyst">Data Analyst</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                  Default Experience Level
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm bg-slate-900 text-slate-200"
                  >
                    <option value="Beginner">Beginner (Student / Fresher)</option>
                    <option value="Intermediate">Intermediate (1-3 Years)</option>
                    <option value="Advanced">Advanced (4+ Years)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
