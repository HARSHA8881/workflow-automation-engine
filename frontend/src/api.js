const BASE = 'https://workflow-automation-engine-si7z.onrender.com/api';

/**
 * Get the stored JWT token.
 */
function getToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Core request function — automatically attaches JWT if present.
 */
const req = async (method, path, body) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (res.status === 401) {
    // Token expired or invalid — clear storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.dispatchEvent(new Event('auth-expired'));
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
};

export const api = {
  // ─── Auth ──────────────────────────────────────────────────
  signup: (d) => req('POST', '/auth/signup', d),
  login:  (d) => req('POST', '/auth/login',  d),
  getMe:  ()  => req('GET',  '/auth/me'),

  // ─── Employees ────────────────────────────────────────────
  getEmployees:    (p = {}) => req('GET', `/employees?${new URLSearchParams(p)}`),
  getEmployee:     (id)     => req('GET', `/employees/${id}`),
  createEmployee:  (d)      => req('POST', '/employees', d),
  updateEmployee:  (id, d)  => req('PATCH', `/employees/${id}`, d),
  deleteEmployee:  (id)     => req('DELETE', `/employees/${id}`),

  // ─── Attendance ───────────────────────────────────────────
  getAttendance:        (p = {}) => req('GET', `/attendance?${new URLSearchParams(p)}`),
  markAttendance:       (d)      => req('POST', '/attendance', d),
  getAttendanceSummary: (id, p = {}) => req('GET', `/attendance/summary/${id}?${new URLSearchParams(p)}`),

  // ─── Leaves ───────────────────────────────────────────────
  getLeaves:       (p = {}) => req('GET', `/leaves?${new URLSearchParams(p)}`),
  requestLeave:    (d)      => req('POST', '/leaves', d),
  updateLeave:     (id, s)  => req('PATCH', `/leaves/${id}/status`, { status: s }),

  // ─── Rules ────────────────────────────────────────────────
  getRules:        ()       => req('GET', '/rules'),
  getActions:      ()       => req('GET', '/rules/actions'),
  createRule:      (d)      => req('POST', '/rules', d),
  updateRule:      (id, d)  => req('PATCH', `/rules/${id}`, d),
  deleteRule:      (id)     => req('DELETE', `/rules/${id}`),
  toggleRule:      (id)     => req('POST', `/rules/${id}/toggle`),

  // ─── Events ───────────────────────────────────────────────
  getEvents:       (p = {}) => req('GET', `/events?${new URLSearchParams(p)}`),
  getEventTypes:   ()       => req('GET', '/events/types'),
  triggerEvent:    (d)      => req('POST', '/events/trigger', d),

  // ─── Action Logs ──────────────────────────────────────────
  getActionLogs:   (p = {}) => req('GET', `/action-logs?${new URLSearchParams(p)}`),
  getLogStats:     ()       => req('GET', '/action-logs/stats'),

  // ─── Salary ───────────────────────────────────────────────
  getAllSalaries:  (p = {}) => req('GET', `/salary?${new URLSearchParams(p)}`),
  getSalary:       (id, p = {}) => req('GET', `/salary/${id}?${new URLSearchParams(p)}`),
};
