import React, { useState, useEffect } from 'react';
import { api } from './api';
import './index.css';

// --- Icons (Simple SVG strings or components for brevity) ---
const Icons = {
  Users: () => <span>👥</span>,
  Clock: () => <span>🕒</span>,
  Calendar: () => <span>📅</span>,
  Settings: () => <span>⚙️</span>,
  Activity: () => <span>⚡</span>,
  Briefcase: () => <span>💼</span>,
  Plus: () => <span>➕</span>,
  Play: () => <span>▶️</span>,
  Logout: () => <span>🚪</span>,
  Lock: () => <span>🔒</span>,
};

// ─── Auth Page (Login/Signup) ───────────────────────────────────────────────

function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let result;
      if (mode === 'signup') {
        result = await api.signup(form);
      } else {
        result = await api.login({ email: form.email, password: form.password });
      }
      // Save token and user
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('auth_user', JSON.stringify(result.user));
      onAuth(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">⚡</span>
            <h1>FlowForge</h1>
          </div>
          <p className="auth-subtitle">Event-Driven Workflow Automation</p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  name="name"
                  type="text"
                  className="form-control"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                name="email"
                type="email"
                className="form-control"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                className="form-control"
                placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
                value={form.password}
                onChange={handleChange}
                required
                minLength={mode === 'signup' ? 6 : undefined}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading
                ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="auth-footer">
            {mode === 'login' ? (
              <p>Don't have an account? <button className="auth-link" onClick={() => setMode('signup')}>Create one</button></p>
            ) : (
              <p>Already have an account? <button className="auth-link" onClick={() => setMode('login')}>Sign in</button></p>
            )}
          </div>
        </div>

        <p className="auth-branding">Smart HR Automation System</p>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ total: 0, successful: 0, failed: 0 });
  const [employees, setEmployees] = useState([]);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setAuthChecked(true);

    // Listen for auth expiry events from api.js
    const handleExpiry = () => {
      setUser(null);
    };
    window.addEventListener('auth-expired', handleExpiry);
    return () => window.removeEventListener('auth-expired', handleExpiry);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchStats();
    if (activeTab === 'dashboard') {
      api.getEmployees().then(setEmployees).catch(console.error);
    }
  }, [activeTab, user]);

  const fetchStats = async () => {
    try {
      const data = await api.getLogStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  // Wait for auth check before rendering
  if (!authChecked) return null;

  // Not logged in — show auth page
  if (!user) {
    return <AuthPage onAuth={setUser} />;
  }

  // Logged in — show dashboard
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Smart HR Automation System</h1>
        <div className="header-right">
          <div className="user-info">
            <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
            <span className="user-name">{user.name}</span>
            <span className="badge badge-info">{user.role}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            <Icons.Logout /> Logout
          </button>
        </div>
      </header>

      <div className="app-content">
        <nav className="sidebar">
          <NavItem id="dashboard" icon={<Icons.Activity />} label="Dashboard" active={activeTab} set={setActiveTab} />
          <NavItem id="employees" icon={<Icons.Users />} label="Employees" active={activeTab} set={setActiveTab} />
          <NavItem id="attendance" icon={<Icons.Clock />} label="Attendance" active={activeTab} set={setActiveTab} />
          <NavItem id="leaves" icon={<Icons.Calendar />} label="Leaves" active={activeTab} set={setActiveTab} />
          <NavItem id="salary" icon={<Icons.Briefcase />} label="Salary & Payroll" active={activeTab} set={setActiveTab} />
          <NavItem id="rules" icon={<Icons.Settings />} label="Automation Rules" active={activeTab} set={setActiveTab} />
          <NavItem id="events" icon={<Icons.Play />} label="Events & Logs" active={activeTab} set={setActiveTab} />
        </nav>

        <main className="main-content">
          {activeTab === 'dashboard' && <Dashboard stats={stats} employees={employees} />}
          {activeTab === 'employees' && <EmployeesTab />}
          {activeTab === 'attendance' && <AttendanceTab employees={employees} />}
          {activeTab === 'leaves' && <LeavesTab />}
          {activeTab === 'rules' && <RulesTab />}
          {activeTab === 'events' && <EventsTab employees={employees} />}
          {activeTab === 'salary' && <SalaryTab employees={employees} />}
        </main>
      </div>
    </div>
  );
}

function NavItem({ id, icon, label, active, set }) {
  return (
    <div className={`nav-item ${active === id ? 'active' : ''}`} onClick={() => set(id)}>
      {icon} {label}
    </div>
  );
}

// --- Dashboard Tab ---
function Dashboard({ stats, employees }) {
  return (
    <div>
      <div className="card-header"><h2 className="card-title">System Overview</h2></div>
      <div className="stats-grid">
        <StatCard icon={<Icons.Users />} title="Total Employees" value={employees.length} />
        <StatCard icon={<Icons.Activity />} title="Automation Runs" value={stats.total} />
        <StatCard icon={<Icons.Settings />} title="Successful Actions" value={stats.successful} color="var(--secondary)" />
        <StatCard icon={<Icons.Clock />} title="Failed Actions" value={stats.failed} color="var(--danger)" />
      </div>
      
      <div className="card">
        <h3 className="card-title">How it works</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem', lineHeight: '1.6' }}>
          This system operates on an <strong>Event-Driven Architecture</strong> using the pattern:
          <br /><br />
          <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', color: 'var(--primary)' }}>
            EVENT → CONDITION → ACTION
          </code>
          <br /><br />
          When an HR Event occurs (e.g., AttendanceMarked), the Rule Engine evaluates all active rules for that event type. 
          If a rule's condition is met, it executes the corresponding Action (e.g., DeductSalary).
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color = 'var(--primary)' }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ color, backgroundColor: `${color}20` }}>{icon}</div>
      <div className="stat-info">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
}

// --- Employees Tab ---
function EmployeesTab() {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { load() }, []);
  const load = () => api.getEmployees().then(setEmployees).catch(console.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    try {
      await api.createEmployee(data);
      setIsModalOpen(false);
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Employees Directory</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Icons.Plus /> Add Employee</button>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Base Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id}>
                <td>{e.name}<br/><small style={{color:'var(--text-muted)'}}>{e.email}</small></td>
                <td>{e.department}</td>
                <td>{e.role}</td>
                <td>${e.baseSalary}</td>
                <td><span className={`badge ${e.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{e.status}</span></td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={async () => {
                    if(window.confirm('Delete?')) { await api.deleteEmployee(e.id); load(); }
                  }}>Delete</button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No employees found</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="card-title">Add New Employee</h3>
              <button aria-label="Close modal" style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input name="name" required className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input name="email" type="email" required className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select name="department" required className="form-control">
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Factory">Factory</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input name="role" required className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Base Salary</label>
                  <input name="baseSalary" type="number" required className="form-control" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Rules Component (Complex) ---
function RulesTab() {
  const [rules, setRules] = useState([]);
  const [actions, setActions] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    Promise.all([
      api.getRules().catch(() => []),
      api.getActions().catch(() => ({ actions: [] })),
      api.getEventTypes().catch(() => ({ eventTypes: [] }))
    ]).then(([r, a, e]) => {
      setRules(r);
      setActions(a.actions || []);
      setEventTypes(e.eventTypes || []);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    
    // Parse actionConfig if provided
    try {
      if (data.actionConfigStr) {
        data.actionConfig = JSON.parse(data.actionConfigStr);
      }
      delete data.actionConfigStr;
      
      await api.createRule(data);
      setIsModalOpen(false);
      load();
    } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Automation Rules Engine</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Icons.Plus /> Create Rule</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Rule Name</th>
              <th>Workflow Logic (Event → Condition → Action)</th>
              <th>Status</th>
              <th>Executions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong><br/><small style={{color:'var(--text-muted)'}}>{r.description}</small></td>
                <td>
                  <div className="rule-builder" style={{ padding: '0.5rem', marginBottom: 0, fontSize: '0.875rem' }}>
                    <span className="badge badge-info">{r.eventType}</span>
                    <span className="rule-builder-arrow">→</span>
                    <span>{r.conditionField} <strong>{r.conditionOperator}</strong> {r.conditionValue}</span>
                    <span className="rule-builder-arrow">→</span>
                    <span className="badge badge-warning">{r.actionType}</span>
                  </div>
                </td>
                <td>
                  <button onClick={() => { api.toggleRule(r.id).then(load); }} className={`badge ${r.isActive ? 'badge-success' : 'badge-danger'}`} style={{cursor:'pointer', border:'none'}}>
                    {r.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </td>
                <td>{r._count?.actionLogs || 0}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={async () => {
                    if(window.confirm('Delete rule?')) { await api.deleteRule(r.id); load(); }
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 className="card-title">Create Automation Rule</h3>
              <button aria-label="Close modal" style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Rule Name</label>
                  <input name="name" required className="form-control" placeholder="e.g. Deduct Salary on Late Entry" />
                </div>
                
                <h4 style={{marginTop:'1.5rem', color:'var(--primary)'}}>1. When this EVENT happens...</h4>
                <div className="form-group">
                  <select name="eventType" required className="form-control">
                    <option value="">Select Event Type</option>
                    {eventTypes.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <h4 style={{marginTop:'1.5rem', color:'var(--primary)'}}>2. If this CONDITION is met...</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <input name="conditionField" required className="form-control" placeholder="Field (e.g. is_late)" />
                  </div>
                  <div className="form-group">
                    <select name="conditionOperator" required className="form-control">
                      <option value="eq">Equals (==)</option>
                      <option value="neq">Not Equals (!=)</option>
                      <option value="gt">Greater Than (&gt;)</option>
                      <option value="lt">Less Than (&lt;)</option>
                      <option value="gte">Greater or Equal (&gt;=)</option>
                      <option value="lte">Less or Equal (&lt;=)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <input name="conditionValue" type="number" step="any" required className="form-control" placeholder="Value (e.g. 1)" />
                  </div>
                </div>

                <h4 style={{marginTop:'1.5rem', color:'var(--primary)'}}>3. Then perform this ACTION...</h4>
                <div className="form-group">
                  <select name="actionType" required className="form-control">
                    <option value="">Select Action Type</option>
                    {actions.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Action Configuration (JSON, optional)</label>
                  <textarea name="actionConfigStr" className="form-control" rows="3" placeholder='{"percentage": 10, "message": "You were late!"}'></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Attendance Tab ---
function AttendanceTab({ employees }) {
  const [records, setRecords] = useState([]);
  useEffect(() => { load() }, []);
  const load = () => api.getAttendance().then(setRecords).catch(console.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    
    // Convert local time strings to actual datetime if provided
    if(!data.date) data.date = new Date().toISOString().split('T')[0];
    
    // Add dummy checkin checkout if present
    if(data.status === 'PRESENT') {
        const d = data.date;
        data.checkIn = `${d}T09:00:00Z`;
        data.checkOut = `${d}T17:00:00Z`;
    } else if (data.status === 'LATE') {
        const d = data.date;
        data.checkIn = `${d}T10:30:00Z`; // Late
        data.checkOut = `${d}T17:00:00Z`;
    }

    try {
      await api.markAttendance(data);
      e.target.reset();
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem' }}>
      <div className="card" style={{ height: 'fit-content' }}>
        <h3 className="card-title" style={{marginBottom: '1.5rem'}}>Mark Attendance</h3>
        <p style={{fontSize:'0.875rem', color:'var(--text-muted)', marginBottom:'1.5rem'}}>
          Marking attendance fires the <code>AttendanceMarked</code> event, triggering the rule engine automatically.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Employee</label>
            <select name="employeeId" required className="form-control">
              <option value="">Select Employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input name="date" type="date" required className="form-control" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" className="form-control">
              <option value="PRESENT">Present (On Time)</option>
              <option value="LATE">Late (Triggers is_late=1)</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Overtime Hours (Triggers overtime_hours)</label>
            <input name="overtime" type="number" step="0.5" defaultValue="0" className="form-control" />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Mark Attendance & Trigger Event</button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Overtime</th>
              <th>System Event</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.employee?.name}</td>
                <td><span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : r.status === 'LATE' ? 'badge-warning' : 'badge-danger'}`}>{r.status}</span></td>
                <td>{r.overtime} hrs</td>
                <td><span className="badge badge-info">Processed</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Leaves Tab (Simplified for brevity) ---
function LeavesTab() {
  return (
    <div className="card">
      <h2 className="card-title">Leave Management</h2>
      <p style={{color:'var(--text-muted)'}}>Leave module is active in Backend API. Run triggers via Postman or Events tab.</p>
    </div>
  );
}

// --- Events & Logs Tab ---
function EventsTab({employees}) {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
      api.getActionLogs().then(setLogs).catch(console.error);
  }, []);

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Automation Execution Logs</h2>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Triggered By Event</th>
              <th>Rule Evaluated</th>
              <th>Action Executed</th>
              <th>Result / Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td>{new Date(l.executedAt).toLocaleString()}</td>
                <td>
                  <div><span className="badge badge-info">{l.event?.type}</span></div>
                  <small style={{color:'var(--text-muted)'}}>{l.employee?.name || 'System'}</small>
                </td>
                <td>{l.rule?.name}</td>
                <td><span className="badge badge-warning">{l.actionType}</span></td>
                <td>
                  <span className={`badge ${l.status === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`}>{l.status}</span>
                  {l.result && <div style={{fontSize:'0.75rem', marginTop:'0.5rem', color:'var(--text-muted)', maxWidth:'250px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{JSON.stringify(l.result)}</div>}
                </td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'2rem'}}>No actions executed yet. Setup a rule and trigger an event!</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Salary & Payroll Tab ---
function SalaryTab({ employees }) {
  const [salaries, setSalaries] = useState([]);
  
  useEffect(() => {
    api.getAllSalaries().then(setSalaries).catch(console.error);
  }, []);

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Current Month Payroll Simulation</h2>
        <p style={{color:'var(--text-muted)'}}>Calculated dynamically based on Base Salary + Automated Rules (Deductions/Bonuses)</p>
      </div>
      
      <div className="stats-grid">
        {salaries.map(s => (
          <div key={s.id} className="card" style={{marginBottom: 0}}>
            <h3 style={{margin: '0 0 1rem 0', display:'flex', justifyContent:'space-between'}}>
              {s.name} <span className="badge badge-success">{s.department}</span>
            </h3>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
              <span style={{color:'var(--text-muted)'}}>Base Salary</span>
              <span>${s.baseSalary}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
              <span style={{color:'var(--danger)'}}>Total Deductions</span>
              <span style={{color:'var(--danger)'}}>-${s.totalDeductions}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem'}}>
              <span style={{color:'var(--secondary)'}}>Total Bonuses</span>
              <span style={{color:'var(--secondary)'}}>+${s.totalBonuses}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', paddingTop:'1rem', borderTop:'1px solid var(--border-color)', fontWeight:'bold', fontSize:'1.25rem'}}>
              <span>Net Pay</span>
              <span style={{color:'var(--primary)'}}>${s.netSalary}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
