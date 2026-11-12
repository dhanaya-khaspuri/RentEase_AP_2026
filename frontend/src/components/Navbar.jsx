import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  User, 
  RotateCcw, 
  Bell, 
  ChevronDown,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const Navbar = () => {
  const { currentRole, switchRole, data, activePropertyId, setActivePropertyId, resetToDefault, backendConnected } = useApp();
  const currentUser = data.currentUser;

  const currentProperty = data.properties.find(p => p.id === activePropertyId) || data.properties[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-brand-700 bg-clip-text text-transparent">
                  RentEase
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  v1.0 (Live Demo)
                </span>
                {backendConnected ? (
                  <span className="hidden lg:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>API: Connected (:5001)</span>
                  </span>
                ) : (
                  <span className="hidden lg:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                    <span>Standalone Mock</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Smart PG & Rental Property Operating System
              </p>
            </div>
          </div>

          {/* Quick Interactive Role Switcher - Perfect for Teacher Presentations */}
          <div className="flex items-center space-x-2 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 hidden lg:inline">
              Role:
            </span>

            <button
              onClick={() => switchRole('tenant')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'tenant'
                  ? 'bg-white text-brand-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Switch to Tenant View"
            >
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>🧑 Tenant</span>
            </button>

            <button
              onClick={() => switchRole('owner')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'owner'
                  ? 'bg-white text-brand-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Switch to Owner View"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>🧑💼 Owner</span>
            </button>

            <button
              onClick={() => switchRole('admin')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'admin'
                  ? 'bg-white text-brand-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Switch to Admin View"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>🛡️ Admin</span>
            </button>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Property Selector for Owner */}
            {currentRole === 'owner' && (
              <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                <span className="text-slate-400">PG:</span>
                <select
                  value={activePropertyId}
                  onChange={(e) => setActivePropertyId(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer pr-2"
                >
                  {data.properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.location.split(',')[0]})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (window.confirm("Reset all data to default demo state?")) {
                  resetToDefault();
                }
              }}
              title="Reset Demo Data"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 text-brand-700 font-bold text-xs flex items-center justify-center">
                {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-slate-500 capitalize">
                  {currentRole === 'owner' ? 'PG Owner' : currentRole === 'tenant' ? 'Verified Tenant' : 'Super Admin'}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
