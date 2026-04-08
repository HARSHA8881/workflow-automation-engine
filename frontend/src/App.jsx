import React, { useState, useEffect } from 'react';
import { api } from './api';
import './index.css';

// --- Minimal SVG Icons for Engineering Aesthetic ---
const Icons = {
  Grid: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  Users: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Briefcase: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
  Settings: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Activity: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Play: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
  Logout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Lightning: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
};

// ─── Auth Page ───────────────────────────────────────────────────────────────

function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
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
      let result = mode === 'signup' 
        ? await api.signup(form) 
        : await api.login({ email: form.email, password: form.password });
      
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
          <div className="auth-logo"><Icons.Lightning /></div>
          <h1>FlowForge</h1>
          <p className="auth-subtitle">Event-Driven Automation Platform</p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
            <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(''); }}>Create Account</button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" type="text" className="form-control" placeholder="Jane Doe" value={form.name} onChange={handleChange} required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" className="form-control" placeholder="jane@company.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-control" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={mode==='signup'?6:0} />
            </div>

            {error && <div className="auth-error"><span style={{width:'16px', height:'16px'}}><Icons.Activity /></span> {error}</div>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? (mode === 'login' ? 'Authenticating...' : 'Provisioning...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="auth-footer">
            {mode === 'login' 
              ? <p>No account? <button className="auth-link" onClick={() => setMode('signup')}>Sign up</button></p>
              : <p>Have an account? <button className="auth-link" onClick={() => setMode('login')}>Sign in</button></p>}
          </div>
        </div>
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

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');
    if (savedUser && token) setUser(JSON.parse(savedUser));
    setAuthChecked(true);

    const handleExpiry = () => setUser(null);
    window.addEventListener('auth-expired', handleExpiry);
    return () => window.removeEventListener('auth-expired', handleExpiry);
  }, []);

  useEffect(() => {
    if (!user) return;
    api.getLogStats().then(setStats).catch(console.error);
    if (activeTab === 'dashboard') {
      api.getEmployees().then(setEmployees).catch(console.error);
    }
  }, [activeTab, user]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  if (!authChecked) return null;
  if (!user) return <AuthPage onAuth={setUser} />;

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-box">F</div>
          <span className="sidebar-title">FlowForge</span>
        </div>
        
        <div className="nav-section-title">Overview</div>
        <NavItem id="dashboard" icon={<Icons.Grid />} label="Dashboard" active={activeTab} set={setActiveTab} />
        <NavItem id="events" icon={<Icons.Activity />} label="Event Logs" active={activeTab} set={setActiveTab} />
        
        <div className="nav-section-title">Engine</div>
        <NavItem id="rules" icon={<Icons.Settings />} label="Rules" active={activeTab} set={setActiveTab} badge={stats.total > 0 ? "Active" : null} />
        
        <div className="nav-section-title">Modules</div>
        <NavItem id="employees" icon={<Icons.Users />} label="Directory" active={activeTab} set={setActiveTab} />
        <NavItem id="attendance" icon={<Icons.Clock />} label="Attendance" active={activeTab} set={setActiveTab} />
        <NavItem id="leaves" icon={<Icons.Calendar />} label="Leaves" active={activeTab} set={setActiveTab} />
        <NavItem id="salary" icon={<Icons.Briefcase />} label="Payroll" active={activeTab} set={setActiveTab} />
      </aside>

      <div className="main-wrapper">
        <header className="main-header">
          <div className="header-left">
            <span className="env-badge"><span className="status-dot"></span> Production</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-meta" style={{textAlign: 'right'}}>
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <div className="user-avatar">{user.name.charAt(0)}</div>
            </div>
            <button className="btn btn-secondary btn-icon" onClick={handleLogout} title="Logout">
              <Icons.Logout />
            </button>
          </div>
        </header>

        <main className="main-content">
          {activeTab === 'dashboard' && <Dashboard stats={stats} employees={employees} />}
          {activeTab === 'employees' && <EmployeesTab />}
          {activeTab === 'attendance' && <AttendanceTab employees={employees} />}
          {activeTab === 'leaves' && <LeavesTab />}
          {activeTab === 'rules' && <RulesTab />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'salary' && <SalaryTab />}
        </main>
      </div>
    </div>
  );
}

function NavItem({ id, icon, label, active, set, badge }) {
  return (
    <div className={`nav-item ${active === id ? 'active' : ''}`} onClick={() => set(id)}>
      <span className="nav-item-icon">{icon}</span>
      {label}
      {badge && <span className="nav-badge">{badge}</span>}
    </div>
  );
}

// ─── Dashboard Tab ───────────────────────────────────────────────────────────

function Dashboard({ stats, employees }) {
  return (
    <div>
      <div className="metrics-grid">
        <div className="metric-card" style={{'--metric-color': 'var(--text-secondary)'}}>
          <div className="metric-label">Directory Size</div>
          <div className="metric-value">{employees.length} <span className="metric-delta" style={{color: 'var(--text-secondary)'}}>Total</span></div>
        </div>
        <div className="metric-card" style={{'--metric-color': 'var(--accent-primary)'}}>
          <div className="metric-label">Execution Volume</div>
          <div className="metric-value">{stats.total} <span className="metric-delta" style={{color: 'var(--accent-primary)'}}>Runs</span></div>
        </div>
        <div className="metric-card" style={{'--metric-color': 'var(--accent-green)'}}>
          <div className="metric-label">Success Rate</div>
          <div className="metric-value">{stats.total > 0 ? Math.round((stats.successful/stats.total)*100) : 0}% <span className="metric-delta" style={{color: 'var(--accent-green)'}}>Ok</span></div>
        </div>
        <div className="metric-card" style={{'--metric-color': 'var(--accent-red)'}}>
          <div className="metric-label">Error Rate</div>
          <div className="metric-value">{stats.total > 0 ? Math.round((stats.failed/stats.total)*100) : 0}% <span className="metric-delta" style={{color: 'var(--accent-red)'}}>Fail</span></div>
        </div>
      </div>
      
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">System Architecture</h3>
        </div>
        <div className="panel-body">
          <div className="pipeline-view" style={{ fontSize: '13px', padding: '1rem', background: 'var(--bg-deep)', borderRadius: 'var(--radius-sm)' }}>
            <span className="pipeline-node node-event">Emit Event</span>
            <span className="pipeline-connector" style={{width: '40px'}}></span>
            <span className="pipeline-node node-cond">Evaluate Conditions</span>
            <span className="pipeline-connector" style={{width: '40px'}}></span>
            <span className="pipeline-node node-action">Execute Actions</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1.5rem', fontSize: '13px' }}>
            The engine operates asynchronously. Events are dispatched to a singleton EventBus. Evaluators match event payloads against rule conditions. If truthy, the ActionFactory dispatches commands.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Employees Tab ───────────────────────────────────────────────────────────

function EmployeesTab() {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { load() }, []);
  const load = () => api.getEmployees().then(setEmployees).catch(console.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      await api.createEmployee(data);
      setIsModalOpen(false);
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Directory</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Icons.Plus /> New Employee</button>
      </div>
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Base Salary</th>
              <th style={{textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id}>
                <td className="td-mono">{e.id.slice(-6)}</td>
                <td>
                  <div style={{fontWeight:500}}>{e.name}</div>
                  <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>{e.email}</div>
                </td>
                <td><span className="badge badge-active"><span className="badge-dot"></span>{e.department}</span></td>
                <td className="td-mono">{e.role}</td>
                <td className="td-mono">${e.baseSalary}</td>
                <td style={{textAlign:'right'}}>
                  <button className="btn btn-danger btn-sm" onClick={async () => {
                    if(window.confirm('Delete?')) { await api.deleteEmployee(e.id); load(); }
                  }}>Delete</button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'3rem', color:'var(--text-tertiary)'}}>No records found.</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Provision Account</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form id="empForm" onSubmit={handleSubmit}>
                <div className="form-group"><label className="form-label">Full Name</label><input name="name" required className="form-control" /></div>
                <div className="form-group"><label className="form-label">Email</label><input name="email" type="email" required className="form-control" /></div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select name="department" required className="form-control">
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Role</label><input name="role" required className="form-control" /></div>
                <div className="form-group"><label className="form-label">Base Salary</label><input name="baseSalary" type="number" required className="form-control" /></div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" form="empForm" className="btn btn-primary">Provision</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Rules Tab (Complex UI) ──────────────────────────────────────────────────

function RulesTab() {
  const [rules, setRules] = useState([]);
  const [actions, setActions] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { load(); }, []);

  const load = () => {
    Promise.all([api.getRules().catch(()=>[]), api.getActions().catch(()=>({actions:[]})), api.getEventTypes().catch(()=>({eventTypes:[]}))])
      .then(([r, a, e]) => { setRules(r); setActions(a.actions || []); setEventTypes(e.eventTypes || []); });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      if (data.actionConfigStr) data.actionConfig = JSON.parse(data.actionConfigStr);
      delete data.actionConfigStr;
      await api.createRule(data);
      setIsModalOpen(false);
      load();
    } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Active Rules</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Icons.Plus /> Define Rule</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Rule Def</th>
              <th>Pipeline</th>
              <th>Status</th>
              <th style={{textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id}>
                <td className="td-mono">{r.id.slice(-6)}</td>
                <td>
                  <div style={{fontWeight:500}}>{r.name}</div>
                  <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>{r.description}</div>
                </td>
                <td>
                  <div className="pipeline-view">
                    <span className="pipeline-node node-event">{r.eventType}</span>
                    <span className="pipeline-connector"></span>
                    <span className="pipeline-node node-cond">{r.conditionField} {r.conditionOperator} {r.conditionValue}</span>
                    <span className="pipeline-connector"></span>
                    <span className="pipeline-node node-action">{r.actionType}</span>
                  </div>
                </td>
                <td>
                  <button onClick={() => { api.toggleRule(r.id).then(load); }} className={`badge ${r.isActive ? 'badge-success' : 'badge-danger'}`} style={{cursor:'pointer'}}>
                    <span className="badge-dot"></span>{r.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td style={{textAlign:'right'}}>
                  <button className="btn btn-danger btn-sm" onClick={async () => {
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
          <div className="modal-content" style={{maxWidth: '640px'}}>
            <div className="modal-header">
              <h3 className="modal-title">Define Automation Rule</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form id="ruleForm" onSubmit={handleSubmit}>
                <div className="form-group"><label className="form-label">Rule Name</label><input name="name" required className="form-control" placeholder="e.g. Deduct Salary on Late Entry" /></div>
                
                <div style={{padding:'1rem', background:'var(--bg-deep)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-dim)'}}>
                  <div className="form-group" style={{marginBottom:0}}>
                    <label className="form-label" style={{color:'var(--accent-primary)'}}>1. Trigger Event</label>
                    <select name="eventType" required className="form-control">
                      <option value="">Select Event Type</option>
                      {eventTypes.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{padding:'1rem', background:'var(--bg-deep)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-dim)', marginTop:'1rem'}}>
                  <label className="form-label" style={{color:'var(--text-secondary)'}}>2. Condition Evaluation</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <input name="conditionField" required className="form-control" placeholder="Field (e.g. is_late)" />
                    <select name="conditionOperator" required className="form-control">
                      <option value="eq">== (Equals)</option>
                      <option value="neq">!= (Not Eq)</option>
                      <option value="gt">&gt; (Greater)</option>
                      <option value="lt">&lt; (Less)</option>
                    </select>
                    <input name="conditionValue" type="number" step="any" required className="form-control" placeholder="Value (e.g. 1)" />
                  </div>
                </div>

                <div style={{padding:'1rem', background:'var(--bg-deep)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-dim)', marginTop:'1rem', marginBottom:'1rem'}}>
                  <label className="form-label" style={{color:'var(--accent-amber)'}}>3. Action Dispatch</label>
                  <div className="form-group">
                    <select name="actionType" required className="form-control">
                      <option value="">Select Action Type</option>
                      {actions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{marginBottom:0}}>
                    <label className="form-label">Action Config (JSON)</label>
                    <textarea name="actionConfigStr" className="form-control" style={{fontFamily:'var(--font-mono)'}} rows="2" placeholder='{"percentage": 10}'></textarea>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" form="ruleForm" className="btn btn-primary">Save Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Others (simplified layouts mapping to identical new UI components) ───

function AttendanceTab({ employees }) {
  const [records, setRecords] = useState([]);
  useEffect(() => { load() }, []);
  const load = () => api.getAttendance().then(setRecords).catch(console.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    if(!data.date) data.date = new Date().toISOString().split('T')[0];
    if(data.status === 'PRESENT') { data.checkIn=`${data.date}T09:00:00Z`; data.checkOut=`${data.date}T17:00:00Z`; } 
    else if (data.status === 'LATE') { data.checkIn=`${data.date}T10:30:00Z`; data.checkOut=`${data.date}T17:00:00Z`; }
    try { await api.markAttendance(data); e.target.reset(); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem' }}>
      <div className="panel" style={{ height: 'max-content' }}>
        <div className="panel-header"><h3 className="panel-title">Emit Event</h3></div>
        <div className="panel-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Employee</label><select name="employeeId" required className="form-control"><option value="">Select Employee</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Date</label><input name="date" type="date" required className="form-control" defaultValue={new Date().toISOString().split('T')[0]} /></div>
            <div className="form-group"><label className="form-label">Status</label><select name="status" className="form-control"><option value="PRESENT">On Time</option><option value="LATE">Late</option><option value="ABSENT">Absent</option></select></div>
            <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Push AttendanceMarked</button>
          </form>
        </div>
      </div>
      <div className="panel">
        <div className="panel-header"><h3 className="panel-title">Recent Records</h3></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>Employee</th><th>Status</th><th>Events</th></tr></thead>
            <tbody>{records.map(r => (
              <tr key={r.id}>
                <td className="td-mono">{r.date.split('T')[0]}</td>
                <td>{r.employee?.name}</td>
                <td><span className={`badge ${r.status==='PRESENT'?'badge-success':r.status==='LATE'?'badge-warning':'badge-danger'}`}><span className="badge-dot"></span>{r.status}</span></td>
                <td><span className="badge badge-active"><span className="badge-dot"></span>Processed</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LeavesTab() {
  return <div className="panel"><div className="panel-header"><h2 className="panel-title">Leave Approvals</h2></div><div className="panel-body"><p style={{color:'var(--text-secondary)'}}>API active. Send requests via Postman to trigger automation rules.</p></div></div>;
}

function SalaryTab() {
  const [salaries, setSalaries] = useState([]);
  useEffect(() => { api.getAllSalaries().then(setSalaries).catch(console.error); }, []);
  return (
    <div className="panel">
      <div className="panel-header"><h2 className="panel-title">Payroll State</h2></div>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Employee</th><th>Base Salary</th><th>Deductions</th><th>Bonuses</th><th>Net Payout</th></tr></thead>
          <tbody>{salaries.map(s => (
            <tr key={s.id}>
              <td><div style={{fontWeight:500}}>{s.name}</div><div className="td-mono">{s.department}</div></td>
              <td className="td-mono">${s.baseSalary}</td>
              <td className="td-mono" style={{color:'var(--accent-red)'}}>-${s.totalDeductions}</td>
              <td className="td-mono" style={{color:'var(--accent-green)'}}>+${s.totalBonuses}</td>
              <td className="td-mono" style={{fontWeight:600}}>${s.netSalary}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function EventsTab() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.getActionLogs().then(setLogs).catch(console.error); }, []);
  return (
    <div className="panel">
      <div className="panel-header"><h2 className="panel-title">System Execution Logs</h2></div>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Timestamp</th><th>Trigger</th><th>Rule</th><th>Action Executed</th><th>Status</th></tr></thead>
          <tbody>{logs.map(l => (
            <tr key={l.id}>
              <td className="td-mono">{new Date(l.executedAt).toISOString().replace('T', ' ').slice(0, 19)}</td>
              <td><span className="badge badge-active"><span className="badge-dot"></span>{l.event?.type}</span></td>
              <td>{l.rule?.name}</td>
              <td><span className="badge badge-warning"><span className="badge-dot"></span>{l.actionType}</span></td>
              <td><span className={`badge ${l.status==='SUCCESS'?'badge-success':'badge-danger'}`}><span className="badge-dot"></span>{l.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
