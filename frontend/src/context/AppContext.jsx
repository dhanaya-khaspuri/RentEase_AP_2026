import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialData } from '../data/initialData';
import { api } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('rentease_data_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state, using initialData', e);
      }
    }
    return initialData;
  });

  const [activePropertyId, setActivePropertyId] = useState(() => {
    return data.properties[0]?.id || "prop_1";
  });

  // Current view role: 'tenant' | 'owner' | 'admin'
  const [currentRole, setCurrentRole] = useState(() => data.currentUser?.role || 'owner');

  // Backend connection status
  const [backendConnected, setBackendConnected] = useState(false);

  // Active modal controls
  const [receiptModalData, setReceiptModalData] = useState(null);
  const [paymentModalData, setPaymentModalData] = useState(null);

  // Hydrate from live backend if available
  useEffect(() => {
    const checkAndSyncBackend = async () => {
      try {
        const health = await api.checkHealth();
        if (health && health.status === 'healthy') {
          setBackendConnected(true);

          // Fetch initial collections
          const [propsRes, roomsRes, tenantsRes, paymentsRes, complaintsRes, noticesRes] = await Promise.allSettled([
            api.getProperties(),
            api.getRooms(),
            api.getTenants(),
            api.getPayments(),
            api.getComplaints(),
            api.getNotices()
          ]);

          setData(prev => ({
            ...prev,
            properties: propsRes.status === 'fulfilled' && propsRes.value?.data ? propsRes.value.data : prev.properties,
            rooms: roomsRes.status === 'fulfilled' && roomsRes.value?.data ? roomsRes.value.data : prev.rooms,
            payments: paymentsRes.status === 'fulfilled' && paymentsRes.value?.data ? paymentsRes.value.data : prev.payments,
            complaints: complaintsRes.status === 'fulfilled' && complaintsRes.value?.data ? complaintsRes.value.data : prev.complaints,
            notices: noticesRes.status === 'fulfilled' && noticesRes.value?.data ? noticesRes.value.data : prev.notices,
          }));
        } else {
          setBackendConnected(false);
        }
      } catch (err) {
        setBackendConnected(false);
      }
    };

    checkAndSyncBackend();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('rentease_data_v1', JSON.stringify(data));
  }, [data]);

  // Role Switcher
  const switchRole = (newRole) => {
    setCurrentRole(newRole);
    let targetUser;
    if (newRole === 'owner') {
      targetUser = data.users.find(u => u.role === 'owner') || data.users[0];
    } else if (newRole === 'tenant') {
      targetUser = data.users.find(u => u.role === 'tenant') || data.users[1];
    } else if (newRole === 'admin') {
      targetUser = data.users.find(u => u.role === 'admin') || data.users[4];
    }
    if (targetUser) {
      setData(prev => ({
        ...prev,
        currentUser: {
          ...targetUser,
          role: newRole
        }
      }));
    }
  };

  // Property Handlers
  const addProperty = async (newProp) => {
    const propId = `prop_${Date.now()}`;
    const property = {
      id: propId,
      ownerId: data.currentUser.id,
      name: newProp.name,
      location: newProp.location,
      totalRooms: Number(newProp.totalRooms) || 10,
      type: newProp.type || "Co-living",
      amenities: newProp.amenities || ["Wi-Fi", "Housekeeping", "Power Backup"],
      managerPhone: newProp.managerPhone || "+91 98000 00000",
      image: newProp.image || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
    };

    setData(prev => ({
      ...prev,
      properties: [...prev.properties, property]
    }));
    setActivePropertyId(propId);

    // Sync to backend
    if (backendConnected) {
      try {
        await api.createProperty(property);
      } catch (e) {
        console.warn('Backend sync failed, saved locally', e);
      }
    }

    return property;
  };

  // Room Handlers
  const addRoom = async (roomData) => {
    const roomId = `room_${Date.now()}`;
    const newRoom = {
      id: roomId,
      propertyId: roomData.propertyId || activePropertyId,
      roomNumber: roomData.roomNumber,
      floor: Number(roomData.floor) || 1,
      capacity: Number(roomData.capacity) || 2,
      occupied: 0,
      rent: Number(roomData.rent) || 8000,
      type: roomData.type || "Double Sharing",
      hasAC: Boolean(roomData.hasAC),
      hasAttachedBath: Boolean(roomData.hasAttachedBath),
      tenantIds: []
    };

    setData(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));

    // Sync to backend
    if (backendConnected) {
      try {
        await api.createRoom(newRoom);
      } catch (e) {
        console.warn('Backend sync failed, saved locally', e);
      }
    }

    return newRoom;
  };

  // Tenant Handlers
  const addTenant = async (tenantData) => {
    const tenantId = `usr_tenant_${Date.now()}`;
    const newTenant = {
      id: tenantId,
      name: tenantData.name,
      role: "tenant",
      email: tenantData.email,
      phone: tenantData.phone,
      status: "active",
      propertyId: tenantData.propertyId,
      roomId: tenantData.roomId,
      joinedDate: tenantData.joinedDate || new Date().toISOString().split('T')[0],
      leaseEnd: tenantData.leaseEnd || "2025-06-30",
      monthlyRent: Number(tenantData.monthlyRent) || 8000,
      deposit: Number(tenantData.deposit) || 16000
    };

    // Update room occupancy
    setData(prev => {
      const updatedRooms = prev.rooms.map(r => {
        if (r.id === tenantData.roomId) {
          return {
            ...r,
            occupied: Math.min(r.capacity, r.occupied + 1),
            tenantIds: [...(r.tenantIds || []), tenantId]
          };
        }
        return r;
      });

      // Generate initial rent pending entry
      const initialPayment = {
        id: `pay_${Date.now()}`,
        tenantId: tenantId,
        tenantName: newTenant.name,
        propertyId: newTenant.propertyId,
        propertyName: prev.properties.find(p => p.id === newTenant.propertyId)?.name || "PG Property",
        roomNumber: prev.rooms.find(r => r.id === newTenant.roomId)?.roomNumber || "N/A",
        month: "Current Month",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: newTenant.monthlyRent,
        status: "Pending",
        paymentDate: null,
        paymentMethod: null,
        transactionId: null,
        receiptUrl: null,
        notes: "First month bill"
      };

      return {
        ...prev,
        users: [...prev.users, newTenant],
        rooms: updatedRooms,
        payments: [initialPayment, ...prev.payments]
      };
    });

    // Sync to backend
    if (backendConnected) {
      try {
        await api.createTenant(newTenant);
      } catch (e) {
        console.warn('Backend sync failed, saved locally', e);
      }
    }

    return newTenant;
  };

  const removeTenant = async (tenantId) => {
    setData(prev => {
      const targetTenant = prev.users.find(u => u.id === tenantId);
      const updatedRooms = prev.rooms.map(r => {
        if (targetTenant && r.id === targetTenant.roomId) {
          return {
            ...r,
            occupied: Math.max(0, r.occupied - 1),
            tenantIds: (r.tenantIds || []).filter(id => id !== tenantId)
          };
        }
        return r;
      });

      return {
        ...prev,
        users: prev.users.filter(u => u.id !== tenantId),
        rooms: updatedRooms
      };
    });

    if (backendConnected) {
      try {
        await api.removeTenant(tenantId);
      } catch (e) {
        console.warn('Backend remove failed', e);
      }
    }
  };

  const reassignTenantRoom = (tenantId, newRoomId) => {
    setData(prev => {
      const tenant = prev.users.find(u => u.id === tenantId);
      if (!tenant) return prev;
      const oldRoomId = tenant.roomId;

      const updatedRooms = prev.rooms.map(r => {
        if (r.id === oldRoomId) {
          return {
            ...r,
            occupied: Math.max(0, r.occupied - 1),
            tenantIds: (r.tenantIds || []).filter(id => id !== tenantId)
          };
        }
        if (r.id === newRoomId) {
          return {
            ...r,
            occupied: Math.min(r.capacity, r.occupied + 1),
            tenantIds: [...(r.tenantIds || []), tenantId]
          };
        }
        return r;
      });

      const updatedUsers = prev.users.map(u => {
        if (u.id === tenantId) {
          return { ...u, roomId: newRoomId };
        }
        return u;
      });

      return {
        ...prev,
        rooms: updatedRooms,
        users: updatedUsers
      };
    });
  };

  // Payment Handlers (Mock UPI, Card, Cash)
  const processPayment = async ({ paymentId, method, transactionId, notes }) => {
    const txn = transactionId || `TXN_${method.toUpperCase()}_${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

    let completedPayment = null;

    setData(prev => {
      const updatedPayments = prev.payments.map(p => {
        if (p.id === paymentId) {
          completedPayment = {
            ...p,
            status: "Paid",
            paymentMethod: method,
            transactionId: txn,
            paymentDate: formattedDate,
            notes: notes || `Paid via ${method}`
          };
          return completedPayment;
        }
        return p;
      });

      return {
        ...prev,
        payments: updatedPayments
      };
    });

    if (backendConnected) {
      try {
        await api.processCheckout({ paymentId, paymentMethod: method, notes });
      } catch (e) {
        console.warn('Backend payment checkout failed, saved locally', e);
      }
    }

    return completedPayment;
  };

  // Complaint Handlers
  const raiseComplaint = async (complaintData) => {
    const compId = `cmp_${Date.now()}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

    const newComplaint = {
      id: compId,
      tenantId: data.currentUser.id,
      tenantName: data.currentUser.name,
      propertyId: complaintData.propertyId || activePropertyId,
      propertyName: data.properties.find(p => p.id === (complaintData.propertyId || activePropertyId))?.name || "PG Property",
      roomNumber: complaintData.roomNumber || "101",
      category: complaintData.category || "General",
      title: complaintData.title,
      description: complaintData.description,
      priority: complaintData.priority || "Medium",
      status: "Pending", // Pending -> Assigned -> In Progress -> Resolved
      assignedTo: null,
      assignedPhone: null,
      createdAt: formattedDate,
      updatedAt: formattedDate,
      resolutionNotes: null
    };

    setData(prev => ({
      ...prev,
      complaints: [newComplaint, ...prev.complaints]
    }));

    if (backendConnected) {
      try {
        await api.createComplaint(newComplaint);
      } catch (e) {
        console.warn('Backend sync failed, saved locally', e);
      }
    }

    return newComplaint;
  };

  const updateComplaintStatus = async (complaintId, nextStatus, assignedTo, resolutionNotes) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

    setData(prev => ({
      ...prev,
      complaints: prev.complaints.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: nextStatus,
            assignedTo: assignedTo !== undefined ? assignedTo : c.assignedTo,
            resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : c.resolutionNotes,
            updatedAt: formattedDate
          };
        }
        return c;
      })
    }));

    if (backendConnected) {
      try {
        await api.updateComplaintStatus(complaintId, nextStatus, assignedTo, resolutionNotes);
      } catch (e) {
        console.warn('Backend update failed, saved locally', e);
      }
    }
  };

  // Notice Handlers
  const publishNotice = async (noticeData) => {
    const noticeId = `not_${Date.now()}`;
    const newNotice = {
      id: noticeId,
      propertyId: noticeData.propertyId || activePropertyId,
      propertyName: data.properties.find(p => p.id === (noticeData.propertyId || activePropertyId))?.name || "All Properties",
      title: noticeData.title,
      category: noticeData.category || "General",
      content: noticeData.content,
      author: data.currentUser.name || "Owner",
      priority: noticeData.priority || "Normal",
      date: new Date().toISOString().split('T')[0],
      isPinned: Boolean(noticeData.isPinned)
    };

    setData(prev => ({
      ...prev,
      notices: [newNotice, ...prev.notices]
    }));

    if (backendConnected) {
      try {
        await api.createNotice(newNotice);
      } catch (e) {
        console.warn('Backend sync failed, saved locally', e);
      }
    }

    return newNotice;
  };

  const deleteNotice = async (noticeId) => {
    setData(prev => ({
      ...prev,
      notices: prev.notices.filter(n => n.id !== noticeId)
    }));

    if (backendConnected) {
      try {
        await api.deleteNotice(noticeId);
      } catch (e) {
        console.warn('Backend delete failed, saved locally', e);
      }
    }
  };

  // Admin User Status Toggle
  const toggleUserStatus = (userId) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            status: u.status === 'blocked' ? 'active' : 'blocked'
          };
        }
        return u;
      })
    }));
  };

  const resetToDefault = () => {
    localStorage.removeItem('rentease_data_v1');
    setData(initialData);
    setActivePropertyId(initialData.properties[0]?.id || "prop_1");
    setCurrentRole(initialData.currentUser?.role || 'owner');
  };

  return (
    <AppContext.Provider
      value={{
        data,
        currentRole,
        switchRole,
        activePropertyId,
        setActivePropertyId,
        backendConnected,
        addProperty,
        addRoom,
        addTenant,
        removeTenant,
        reassignTenantRoom,
        processPayment,
        raiseComplaint,
        updateComplaintStatus,
        publishNotice,
        deleteNotice,
        toggleUserStatus,
        resetToDefault,
        receiptModalData,
        setReceiptModalData,
        paymentModalData,
        setPaymentModalData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
