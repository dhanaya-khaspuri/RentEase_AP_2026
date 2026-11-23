import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RaiseComplaintModal } from '../common/RaiseComplaintModal';
import { 
  Building2, 
  DoorOpen, 
  CreditCard, 
  AlertCircle, 
  Megaphone, 
  Receipt, 
  CheckCircle, 
  Clock, 
  Wrench, 
  ShieldCheck, 
  Wifi, 
  Calendar, 
  ArrowRight, 
  User,
  Plus,
  Pin
} from 'lucide-react';

export const TenantDashboard = () => {
  const { data, setPaymentModalData, setReceiptModalData } = useApp();
  const [showRaiseComplaint, setShowRaiseComplaint] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'rent' | 'complaints' | 'notices'

  // Current logged in tenant
  const currentTenant = data.currentUser.role === 'tenant' 
    ? data.currentUser 
    : data.users.find(u => u.role === 'tenant') || data.users[1];

  
  //  If tenant is blocked, stop everything and show blocked screen
  if (currentTenant.status === 'blocked') {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center p-10">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Account Blocked</h2>
        <p className="text-slate-500 text-sm max-w-sm">
          Your account has been blocked by the admin. 
          You cannot raise complaints, pay rent, or access any features. 
          Please contact your PG owner for help.
        </p>
      </div>
    );
  }

  // Assigned property and room
  const assignedProperty = data.properties.find(p => p.id === currentTenant.propertyId) || data.properties[0];
  const assignedRoom = data.rooms.find(r => r.id === currentTenant.roomId) || data.rooms[0];

  // Tenant's payments
  const tenantPayments = data.payments.filter(p => p.tenantId === currentTenant.id);
  const currentMonthBill = tenantPayments.find(p => p.status === 'Pending') || tenantPayments[0];

  // Tenant's complaints
  const tenantComplaints = data.complaints.filter(c => c.tenantId === currentTenant.id);

  // Property notices
  const propertyNotices = data.notices.filter(n => n.propertyId === assignedProperty.id || n.propertyId === 'all');

  const lifecycleStages = ['Pending', 'Assigned', 'In Progress', 'Resolved'];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold mb-3">
              <User className="w-3.5 h-3.5" />
              <span>Tenant Portal • {assignedProperty?.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentTenant.name}!
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm mt-1 max-w-xl">
              Assigned to <span className="font-bold text-white">Room #{assignedRoom?.roomNumber}</span> • {assignedRoom?.type} • Floor {assignedRoom?.floor}
            </p>
          </div>

          {/* Quick Pay / Raise Complaint actions */}
          <div className="flex flex-wrap gap-2.5">
            {currentMonthBill && currentMonthBill.status === 'Pending' && (
              <button
                onClick={() => setPaymentModalData({ payment: currentMonthBill, tenant: currentTenant })}
                className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all animate-pulse"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Rent (₹{currentMonthBill.amount.toLocaleString('en-IN')})</span>
              </button>
            )}

            <button
              onClick={() => setShowRaiseComplaint(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-xs transition-all border border-white/10"
            >
              <Wrench className="w-4 h-4" />
              <span>Raise Complaint</span>
            </button>
          </div>
        </div>

        {/* Tab selector */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-medium">
          {[
            { id: 'overview', label: '🏠 Room & Lease Details' },
            { id: 'rent', label: `💳 Rent & Payment History (${tenantPayments.length})` },
            { id: 'complaints', label: `🔧 Maintenance Complaints (${tenantComplaints.length})` },
            { id: 'notices', label: `📢 Property Notices (${propertyNotices.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: ROOM & LEASE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Room Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-extrabold text-lg border border-brand-100">
                  {assignedRoom?.roomNumber}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Room Accommodation</h3>
                  <p className="text-xs text-slate-500">{assignedRoom?.type} • Floor {assignedRoom?.floor}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Occupied
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Property:</span>
                <span className="font-semibold text-slate-900">{assignedProperty.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Monthly Rent:</span>
                <span className="font-bold text-brand-700">₹{currentTenant.monthlyRent.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Security Deposit:</span>
                <span className="font-semibold text-slate-900">₹{currentTenant.deposit?.toLocaleString('en-IN') || '16,000'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Air Conditioning (AC):</span>
                <span className="font-semibold text-slate-900">{assignedRoom?.hasAC ? 'Yes (Split AC)' : 'Non-AC'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Bathroom:</span>
                <span className="font-semibold text-slate-900">{assignedRoom?.hasAttachedBath ? 'Attached' : 'Common'}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-1">
                <Wifi className="w-4 h-4 text-brand-600" />
                <span>Wi-Fi Access Credentials</span>
              </div>
              <div className="text-xs text-slate-600">
                SSID: <span className="font-mono font-semibold">GreenValley_5G</span>
              </div>
              <div className="text-xs text-slate-600">
                Password: <span className="font-mono font-semibold">RentEase@2024</span>
              </div>
            </div>
          </div>

          {/* Lease Tenure & Manager Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Lease Agreement</h3>
                <p className="text-xs text-slate-500">Verified digital tenant contract</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Move-in Date:</span>
                <span className="font-semibold text-slate-900">{currentTenant.joinedDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Lease Expiry:</span>
                <span className="font-semibold text-slate-900">{currentTenant.leaseEnd}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Notice Period:</span>
                <span className="font-semibold text-slate-900">30 Days prior to departure</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">PG Manager Contact:</span>
                <span className="font-semibold text-brand-700">{assignedProperty.managerPhone}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>KYC & Police Verification</span>
              </div>
              <p className="text-xs text-emerald-700">
                Documents verified by owner. Tenant ID active on RentEase platform.
              </p>
            </div>
          </div>

          {/* Current Rent Status Highlight Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Cycle</span>
                  <h3 className="text-base font-bold text-slate-900">Rent Payment Due</h3>
                </div>
                {currentMonthBill?.status === 'Paid' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Paid & Cleared
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Payment Due
                  </span>
                )}
              </div>

              <div className="mt-5 text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-500">Payable Amount</div>
                <div className="text-3xl font-black text-slate-900 mt-1">
                  ₹{currentMonthBill ? currentMonthBill.amount.toLocaleString('en-IN') : '8,000'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Due on {currentMonthBill?.dueDate || '5th of this month'}
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100">
              {currentMonthBill?.status === 'Pending' ? (
                <button
                  onClick={() => setPaymentModalData({ payment: currentMonthBill, tenant: currentTenant })}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Now (UPI / Card / Cash)</span>
                </button>
              ) : (
                <button
                  onClick={() => currentMonthBill && setReceiptModalData(currentMonthBill)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Receipt className="w-4 h-4" />
                  <span>View & Download Receipt</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: RENT & PAYMENT HISTORY */}
      {activeTab === 'rent' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Rent Ledger & Receipts</h2>
              <p className="text-xs text-slate-500">Complete record of all rent transactions and downloadable digital tax receipts</p>
            </div>
            {currentMonthBill && currentMonthBill.status === 'Pending' && (
              <button
                onClick={() => setPaymentModalData({ payment: currentMonthBill, tenant: currentTenant })}
                className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-auto"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Current Rent</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Billing Month</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Due Date</th>
                  <th className="py-3 px-6">Payment Mode & Txn ID</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenantPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                      {p.month}
                    </td>
                    <td className="py-4 px-6 font-black text-slate-900">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{p.dueDate}</td>
                    <td className="py-4 px-6">
                      {p.status === 'Paid' ? (
                        <div>
                          <span className="font-bold text-slate-800">{p.paymentMethod}</span>
                          <span className="block font-mono text-[10px] text-slate-400">{p.transactionId}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Awaiting payment</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {p.status === 'Paid' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          <span>Paid</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {p.status === 'Paid' ? (
                        <button
                          onClick={() => setReceiptModalData(p)}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>View Invoice</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setPaymentModalData({ payment: p, tenant: currentTenant })}
                          className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 3: MAINTENANCE COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Maintenance Tickets & Status Tracker</h2>
              <p className="text-xs text-slate-500">Live complaint lifecycle: Pending ➔ Assigned ➔ In Progress ➔ Resolved</p>
            </div>
            <button
              onClick={() => setShowRaiseComplaint(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Raise New Ticket</span>
            </button>
          </div>

          <div className="p-6 space-y-5">
            {tenantComplaints.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No active complaints. Everything is running smoothly!
              </div>
            ) : (
              tenantComplaints.map(c => {
                const currentStageIndex = lifecycleStages.indexOf(c.status);
                return (
                  <div key={c.id} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800 uppercase">
                            {c.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {c.priority} Priority
                          </span>
                          <span className="text-xs text-slate-400">Created: {c.createdAt}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{c.title}</h4>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                        c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        c.status === 'Assigned' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/60">
                      "{c.description}"
                    </p>

                    {/* Progress Lifecycle Stepper */}
                    <div className="pt-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Resolution Progress
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {lifecycleStages.map((stage, idx) => {
                          const isCompletedOrCurrent = idx <= currentStageIndex;
                          const isCurrent = idx === currentStageIndex;
                          return (
                            <div
                              key={stage}
                              className={`p-2.5 rounded-xl text-center border transition-all ${
                                isCurrent
                                  ? 'bg-brand-600 text-white font-bold border-brand-600 shadow-xs'
                                  : isCompletedOrCurrent
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                                  : 'bg-white text-slate-400 border-slate-200'
                              }`}
                            >
                              <div className="text-[10px] uppercase font-bold tracking-wider">Step {idx + 1}</div>
                              <div className="text-xs mt-0.5">{stage}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Assigned Technician Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-2 border-t border-slate-200 text-slate-500 gap-1">
                      <div>
                        {c.assignedTo ? (
                          <span>🔧 Assigned Technician: <strong className="text-slate-800">{c.assignedTo}</strong></span>
                        ) : (
                          <span className="text-amber-600 font-medium">⏳ Awaiting owner assignment</span>
                        )}
                      </div>
                      {c.resolutionNotes && (
                        <div className="text-emerald-700 font-medium">
                          Notes: {c.resolutionNotes}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* Tab 4: NOTICES */}
      {activeTab === 'notices' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Property Announcements & Notice Board</h2>
            <p className="text-xs text-slate-500">Official updates published by your PG Owner and Administration</p>
          </div>

          <div className="space-y-4 pt-2">
            {propertyNotices.map(n => (
              <div
                key={n.id}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {n.isPinned && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800">
                        <Pin className="w-3 h-3 fill-brand-700" />
                        <span>PINNED</span>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                      {n.category}
                    </span>
                    <span className="text-xs text-slate-400">• {n.date}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">By {n.author}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{n.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raise Complaint Modal */}
      <RaiseComplaintModal
        isOpen={showRaiseComplaint}
        onClose={() => setShowRaiseComplaint(false)}
      />

    </div>
  );
};
