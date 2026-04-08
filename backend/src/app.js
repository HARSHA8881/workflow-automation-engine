const express        = require('express');
const cors           = require('cors');
const errorHandler   = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// ─── Health (public) ───────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'Smart HR Automation System', ts: new Date().toISOString() })
);

// ─── Auth (public) ─────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth.routes'));

// ─── Protected Routes (require JWT) ────────────────────────────────────────
app.use('/api/workflows',   authenticate, require('./routes/workflow.routes'));
app.use('/api/runs',        authenticate, require('./routes/run.routes'));
app.use('/api/employees',   authenticate, require('./routes/employee.routes'));
app.use('/api/attendance',  authenticate, require('./routes/attendance.routes'));
app.use('/api/leaves',      authenticate, require('./routes/leave.routes'));
app.use('/api/rules',       authenticate, require('./routes/rule.routes'));
app.use('/api/events',      authenticate, require('./routes/event.routes'));
app.use('/api/action-logs', authenticate, require('./routes/actionLog.routes'));
app.use('/api/salary',      authenticate, require('./routes/salary.routes'));
app.use('/api/dashboard',   authenticate, require('./routes/dashboard.routes'));

// ─── 404 ───────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
