# Event-Driven Intelligent Workflow Automation System

An event-driven workflow automation system that automatically executes actions based on configurable rules following the **Event → Condition → Action** pattern. Built for a Smart HR Automation use case, enabling administrators to create and manage automation workflows without modifying core code.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Workflow](#workflow)
- [Features](#features)
- [Key Architecture Highlights](#key-architecture-highlights)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [API Documentation](#api-documentation)
- [Design Patterns](#design-patterns)
- [SOLID Principles](#solid-principles)
- [Team Contributions](#team-contributions)

---

## Problem Statement

Organizations often need automation for recurring operational tasks like attendance tracking, payroll updates, notifications, and compliance checks. Traditionally, these tasks are handled by separate software modules hardcoded for specific use cases:

- A factory may have one system for attendance and another for payroll.
- Offices may use different tools for task management and leave tracking.
- Schools may have separate systems for attendance and grading.

---

## Solution

We propose a Configurable Workflow Automation Engine (Universal Automation Platform) that allows organizations to define rules and automate actions based on events.

Key Idea:
EVENT → CONDITION → ACTION

- Event: Something that happens in the system (attendance marked, leave approved, task completed).
- Condition: A rule that decides whether the action should be executed (attendance < 75%, task overdue).
- Action: Automatic response triggered if the condition is true (send notification, update payroll, generate coupon).

---

## Workflow
1. Event is generated (e.g., attendance marked)
2. Event is published to Event Bus
3. Rule Engine receives the event
4. Relevant rules are fetched
5. Conditions are evaluated
6. Actions are executed
7. Results are logged

---

## Features

- **Configurable Rule Engine** — Create rules with Event → Condition → Action logic
- **Event-Driven Architecture** — Events trigger automatic rule evaluation
- **7 Built-in Actions** — DeductSalary, AddBonus, SendNotification, WarnEmployee, GenerateCoupon, AutoApproveLeave, Escalate
- **9 Condition Operators** — lt, gt, lte, gte, eq, neq, contains, startsWith, in
- **Dry-Run Testing** — Test rules against sample data before deploying
- **Employee Management** — Full CRUD for employees
- **Attendance Tracking** — Mark attendance with automatic event generation
- **Leave Management** — Request and approve/reject leaves with rule triggers
- **Salary Simulation** — View salary with rule-based deductions and bonuses
- **Dashboard Statistics** — Aggregated system overview
- **Workflow Execution** — Multi-step workflow engine with step-by-step execution

---

## Key Architecture Highlights

- Loose coupling via Event-Driven Architecture
- High cohesion with modular components
- Extensible rule system (no code changes required)
- Separation of concerns across layers
- Scalable design with support for async processing

---

##  Architecture

The system follows an **Event-Driven Modular Architecture**:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  REST API    │────▶│   Database   │
│  (React.js)  │◀────│  (Express)   │◀────│ (PostgreSQL) │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │
                    ┌──────▼───────┐
                    │  Event Bus   │  (Observer Pattern)
                    │  (Pub/Sub)   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Rule Engine  │  (Singleton)
                    │              │
                    ├──────────────┤
                    │  Evaluator   │  (Strategy Pattern)
                    ├──────────────┤
                    │  Repository  │  (Repository Pattern)
                    ├──────────────┤
                    │  Actions     │  (Factory + Command)
                    └──────────────┘
```

**Flow:** Controller → Event Created → EventBus publishes → RuleEngine processes → Conditions evaluated (Strategy) → Actions executed (Command) → ActionLog persisted

For detailed architecture, see [docs/architecture.md](docs/architecture.md).

---

##  Tech Stack

| Layer        | Technology                    |
|-------------|-------------------------------|
| Frontend    | React.js, CSS                 |
| Backend     | Node.js, Express.js           |
| ORM         | Prisma                        |
| Database    | PostgreSQL                    |
| Architecture| Event-Driven Modular          |
| Tools       | GitHub, Postman, VS Code, Prisma Studio |

---

##  Project Structure

```
workflow-automation-engine/
├── README.md
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Migration history
│   ├── src/
│   │   ├── controllers/           # Route handlers
│   │   ├── services/              # Business logic
│   │   │   └── actions/           # Action implementations (Command Pattern)
│   │   ├── models/                # Domain models (OOP)
│   │   ├── ruleEngine/            # Core rule engine module
│   │   ├── patterns/              # Design pattern implementations
│   │   ├── middleware/            # Express middleware
│   │   ├── utils/                 # Utilities (logger, validators)
│   │   ├── database/             # Prisma client singleton
│   │   ├── routes/               # API route definitions
│   │   ├── app.js                # Express app setup
│   │   └── index.js              # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main application
│   │   ├── api.js                # API client
│   │   └── *.css                 # Styling
│   └── package.json
├── docs/                          # Documentation
├── tests/                         # Test files
└── demo/                          # Sample requests
```

---

##  Setup & Installation

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/HARSHA8881/workflow-automation-engine.git
cd workflow-automation-engine
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/workflow_automation"' > .env
echo 'PORT=4000' >> .env

# Create database & run migrations
createdb -U postgres workflow_automation
npx prisma migrate dev
npx prisma generate

# Start the server
npm run dev    # → http://localhost:4000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev    # → http://localhost:5173
```

### 4. Verify

- **Backend Health:** `GET http://localhost:4000/health`
- **Frontend:** Open `http://localhost:5173` in browser

---

##  API Documentation

See [docs/api-documentation.md](docs/api-documentation.md) for the full API reference.

### Quick Overview

| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| GET    | `/api/dashboard/stats`        | Dashboard statistics           |
| GET    | `/api/employees`              | List employees                 |
| POST   | `/api/employees`              | Create employee                |
| GET    | `/api/attendance`             | List attendance records        |
| POST   | `/api/attendance`             | Mark attendance (fires event)  |
| GET    | `/api/leaves`                 | List leave requests            |
| POST   | `/api/leaves`                 | Request leave                  |
| PATCH  | `/api/leaves/:id/status`      | Approve/reject leave           |
| GET    | `/api/rules`                  | List automation rules          |
| GET    | `/api/rules/:id`              | Get single rule                |
| POST   | `/api/rules`                  | Create rule                    |
| POST   | `/api/rules/test`             | Dry-run test a rule            |
| POST   | `/api/rules/:id/toggle`       | Toggle rule active/inactive    |
| GET    | `/api/events`                 | List events                    |
| GET    | `/api/events/:id`             | Get single event with logs     |
| POST   | `/api/events/trigger`         | Manually trigger an event      |
| GET    | `/api/action-logs`            | List action logs               |
| GET    | `/api/action-logs/stats`      | Action log statistics          |
| GET    | `/api/workflows`              | List workflows                 |
| POST   | `/api/workflows`              | Create workflow                |
| POST   | `/api/runs`                   | Trigger workflow run           |
| GET    | `/api/salary`                 | List all salary simulations    |
| GET    | `/api/salary/:employeeId`     | Employee salary simulation     |

---

##  Design Patterns

| Pattern                    | Location                          | Purpose                                    |
|---------------------------|-----------------------------------|--------------------------------------------|
| **Singleton**             | `patterns/Singleton.js`           | Single RuleEngine & EventBus instance      |
| **Observer**              | `patterns/Observer.js`            | EventBus pub-sub for decoupled events      |
| **Strategy**              | `patterns/Strategy.js`            | Interchangeable condition operators         |
| **Factory**               | `actions/ActionFactory.js`        | Create action objects by type              |
| **Command**               | `actions/BaseAction.js`           | Uniform action execution interface         |
| **Chain of Responsibility** | `patterns/ChainOfResponsibility.js` | Validation pipeline in rule processing  |
| **Repository**            | `ruleEngine/RuleRepository.js`    | Abstract data access from business logic   |

For detailed explanations, see [docs/system-design.md](docs/system-design.md).

---

##  SOLID Principles

| Principle                     | Implementation                                                                 |
|------------------------------|--------------------------------------------------------------------------------|
| **Single Responsibility**    | Each class has one job: RuleEngine orchestrates, Evaluator evaluates, Actions execute |
| **Open/Closed**              | New actions and operators added via registry without modifying existing code     |
| **Liskov Substitution**      | Any action subclass can replace BaseAction seamlessly                           |
| **Interface Segregation**    | Minimal interfaces — actions implement only `execute()`, evaluators only `evaluate()` |
| **Dependency Inversion**     | RuleEngine depends on abstractions (Evaluator, Repository, Factory), not concretes |

---

##  Team Contributions

| Role                    | Responsibilities                                                  |
|------------------------|-------------------------------------------------------------------|
| **Rule Engine Developer** | Core rule engine, OOP models, design patterns, condition evaluation, action system |
| **Backend API Developer** | REST APIs, middleware, integration, dashboard, validation          |
| **Frontend Developer**    | React dashboard, UI components, API integration                  |

---

##  License

ISC
