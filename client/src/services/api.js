const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Custom fetch wrapper with robust error & JSON parsing handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        data = { message: text };
      }
    } else {
      data = {};
    }

    if (!response.ok) {
      const errMsg = (data && data.message) ? data.message : `Request failed with status ${response.status}`;
      throw new Error(errMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${url}:`, error.message);
    throw error;
  }
}

export const api = {
  // Health & System Summary & Financials
  getHealth: () => request('/health'),
  getAnalyticsSummary: () => request('/analytics/summary'),
  getFinancials: () => request('/analytics/financials'),
  createExpense: (data) => request('/analytics/expenses', { method: 'POST', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/analytics/expenses/${id}`, { method: 'DELETE' }),
  seedDatabase: () => request('/seed', { method: 'POST' }),

  // Authentication & Users
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users${query ? `?${query}` : ''}`);
  },
  provisionUser: (userData) =>
    request('/users/provision', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  deleteUser: (id) =>
    request(`/users/${id}`, {
      method: 'DELETE',
    }),
  verifyStudent: (studentId) => request(`/users/verify/${studentId}`),
  updateUser: (id, data) =>
    request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Halls & Rooms Matrix
  getHalls: () => request('/halls'),
  getHallById: (id) => request(`/halls/${id}`),
  getHallFloorMatrix: (hallId) => request(`/halls/${hallId}/matrix`),
  getRooms: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/rooms${query ? `?${query}` : ''}`);
  },
  createRoom: (data) =>
    request('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRoom: (id, data) =>
    request(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteRoom: (id) =>
    request(`/rooms/${id}`, {
      method: 'DELETE',
    }),
  addBed: (roomId, data = {}) =>
    request(`/rooms/${roomId}/beds`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  removeBed: (roomId, bedLabel) =>
    request(`/rooms/${roomId}/beds/${encodeURIComponent(bedLabel)}`, {
      method: 'DELETE',
    }),
  transferStudentRoom: (data) =>
    request('/rooms/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createRoomTransferRequest: (data) =>
    request('/rooms/transfer-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createRoomTransferRequest: (data) =>
    request('/rooms/transfer-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getRoomTransferRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/rooms/transfer-requests${query ? `?${query}` : ''}`);
  },
  reviewRoomTransferRequest: (id, data) =>
    request(`/rooms/transfer-requests/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Seat Applications & Tracking
  submitApplication: (applicationData) =>
    request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    }),
  getApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/applications${query ? `?${query}` : ''}`);
  },
  trackApplication: (refOrId) => request(`/applications/track/${refOrId}`),
  approveAllocation: (id, data = {}) =>
    request(`/applications/${id}/approve-allocation`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  revokeAllocation: (id) =>
    request(`/applications/${id}/revoke-allocation`, {
      method: 'PUT',
    }),
  deleteApplication: (id) =>
    request(`/applications/${id}`, {
      method: 'DELETE',
    }),
  updateApplicationStatus: (id, data) =>
    request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // AI Roommate Matcher & Smart Seat Allocation
  evaluateRoommateMatch: (traits) =>
    request('/roommate-matcher/evaluate', {
      method: 'POST',
      body: JSON.stringify(traits),
    }),
  smartAssignSeat: (data) =>
    request('/roommate-matcher/smart-assign', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getRoommateCandidates: () => request('/roommate-matcher/candidates'),

  // Maintenance Tickets & Complaints (4-Tier Lifecycle: Student -> Tutor -> Provost -> Staff)
  getComplaints: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/complaints${query ? `?${query}` : ''}`);
  },
  createComplaint: (complaintData) =>
    request('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    }),
  verifyComplaint: (id, verificationData) =>
    request(`/complaints/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify(verificationData),
    }),
  assignComplaint: (id, assignmentData) =>
    request(`/complaints/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    }),
  updateComplaintStatus: (id, statusData) =>
    request(`/complaints/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    }),
  updateComplaint: (id, data) =>
    request(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Gate Pass & Leave Requests
  getGatePasses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/gatepass${query ? `?${query}` : ''}`);
  },
  createGatePass: (gatePassData) =>
    request('/gatepass', {
      method: 'POST',
      body: JSON.stringify(gatePassData),
    }),
  updateGatePassStatus: (id, data) =>
    request(`/gatepass/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Dining & Mess Operations
  getMessMenu: () => request('/mess/menu'),
  getMealBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/mess/bookings${query ? `?${query}` : ''}`);
  },
  applyMeal: (bookingData) =>
    request('/mess/apply', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),
  approveMealBooking: (id, data = {}) =>
    request(`/mess/bookings/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  rejectMealBooking: (id, data = {}) =>
    request(`/mess/bookings/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getStudentMealSummary: (studentId) => request(`/mess/student-summary/${studentId}`),
  bookMeal: (bookingData) =>
    request('/mess/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),
  getMessStats: () => request('/mess/stats'),

  // Bazar Requisitions, Inventory Stock & Daily Headcount Report
  getBazarRequisitions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/bazar/requisitions${query ? `?${query}` : ''}`);
  },
  createBazarRequisition: (data) =>
    request('/bazar/requisitions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  approveBazarRequisition: (id, data = {}) =>
    request(`/bazar/requisitions/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  rejectBazarRequisition: (id, data = {}) =>
    request(`/bazar/requisitions/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  purchaseBazarRequisition: (id, data = {}) =>
    request(`/bazar/requisitions/${id}/purchase`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getBazarStock: () => request('/bazar/stock'),
  updateBazarStock: (id, data = {}) =>
    request(`/bazar/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getDailyBazarMealReport: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/bazar/daily-report${query ? `?${query}` : ''}`);
  },
  getMonthlyBazarReport: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/bazar/monthly-report${query ? `?${query}` : ''}`);
  },

  // Official Circulars & Notices
  getNotices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notices${query ? `?${query}` : ''}`);
  },
  createNotice: (noticeData) =>
    request('/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData),
    }),

  // SSLCommerz Payments & Financial Invoices
  getPayments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payments${query ? `?${query}` : ''}`);
  },
  getPaymentById: (id) => request(`/payments/${id}`),
  initSSLCommerzPayment: (data) =>
    request('/payments/sslcommerz/init', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  completeSSLCommerzPayment: (data) =>
    request('/payments/sslcommerz/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createInvoice: (data) =>
    request('/payments/create-invoice', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Legacy Items CRUD
  getItems: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'All') {
        query.append(key, value);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/items${queryString}`);
  },
  getItemById: (id) => request(`/items/${id}`),
  createItem: (itemData) =>
    request('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    }),
  updateItem: (id, itemData) =>
    request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    }),
  deleteItem: (id) =>
    request(`/items/${id}`, {
      method: 'DELETE',
    }),
  seedItems: () =>
    request('/items/seed', {
      method: 'POST',
    }),
};
