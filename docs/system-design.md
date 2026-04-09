# System Design — Design Patterns & SOLID Principles

This document explains each design pattern and SOLID principle applied in the codebase with references to actual implementation files.

---

## Design Patterns

### 1. Singleton Pattern

**File:** `src/patterns/Singleton.js`
**Used by:** RuleEngine, EventBus

**Purpose:** Ensures only one instance of the Rule Engine and Event Bus exist throughout the application lifecycle, preventing duplicate event processing and resource waste.

**Implementation:**
```javascript
class Singleton {
  static getInstance(...args) {
    if (!this._instance) {
      this._instance = new this(...args);
    }
    return this._instance;
  }
}
```

**Why:** The Rule Engine must maintain state (processing count, evaluator config). Multiple instances would cause events to be processed multiple times.

---

### 2. Observer Pattern (Publish-Subscribe)

**File:** `src/patterns/Observer.js`
**Used by:** `src/ruleEngine/EventBus.js`

**Purpose:** Decouples event producers (controllers) from event consumers (rule engine). Controllers don't need to know about the rule engine — they just publish events.

**Implementation:**
- `EventBus.subscribe(eventType, handler)` — Register a listener
- `EventBus.publish(eventType, data)` — Notify all listeners
- Supports wildcard (`*`) subscriptions

**Why:** When we add new event consumers (e.g., audit logging, notifications), we just add subscribers — no controller changes needed.

---

### 3. Strategy Pattern

**File:** `src/patterns/Strategy.js`
**Used by:** `src/ruleEngine/RuleEvaluator.js`

**Purpose:** Each comparison operator (lt, gt, eq, contains, etc.) is an interchangeable strategy. New operators are added by registering a function — no if/else chains.

**Implementation:**
```javascript
// Register strategies
this._context.register('gt', (a, b) => Number(a) > Number(b));
this._context.register('contains', (a, b) => String(a).includes(String(b)));

// Execute by name
this._context.execute('gt', 10, 5); // true
```

**Why:** The original ConditionEvaluator had 6 operators. We extended to 9 without modifying existing code — pure Open/Closed Principle.

---

### 4. Factory Pattern

**File:** `src/services/actions/ActionFactory.js`

**Purpose:** Creates the correct Action object based on a string type name. Callers don't need to know about concrete action classes.

**Implementation:**
```javascript
class ActionFactory {
  static _registry = {
    DeductSalary: DeductSalaryAction,
    AddBonus: AddBonusAction,
    // ... 7 total actions
  };

  static create(actionType) {
    const Cls = this._registry[actionType];
    return new Cls();
  }

  static register(type, ActionClass) {
    this._registry[type] = ActionClass;  // Runtime extension
  }
}
```

**Why:** Rules configure actions by string name. The Factory resolves them to concrete classes, enabling runtime extensibility.

---

### 5. Command Pattern

**File:** `src/services/actions/BaseAction.js`

**Purpose:** All actions implement a uniform `execute(employee, rule, event)` interface, enabling the Rule Engine to execute any action polymorphically.

**Implementation:**
```javascript
class BaseAction {
  async execute(employee, rule, event) {
    throw new Error('Must implement execute()');
  }
}
```

**Concrete Actions:** DeductSalary, AddBonus, SendNotification, WarnEmployee, GenerateCoupon, AutoApproveLeave, Escalate

**Why:** The engine doesn't need to know what each action does — it just calls `action.execute()`. New actions are plug-and-play.

---

### 6. Chain of Responsibility Pattern

**File:** `src/patterns/ChainOfResponsibility.js`
**Used by:** RuleEngine validation pipeline

**Purpose:** Processes requests through a chain of handlers. Each handler can validate, transform, or enrich the request before passing it along.

**Implementation in RuleEngine:**
```
Request → EventTypeValidator → RuleLoader → EmployeeLoader → Processing
```

**Why:** Each validation step is independent and can be reordered, removed, or extended without affecting others.

---

### 7. Repository Pattern

**File:** `src/ruleEngine/RuleRepository.js`

**Purpose:** Abstracts database queries behind a clean interface. The Rule Engine uses `repository.findActiveByEventType()` instead of raw Prisma queries.

**Why:** Makes the engine testable (mock the repository), portable (swap databases), and clean (no SQL in business logic).

---

## SOLID Principles

### Single Responsibility Principle (SRP)

> A class should have only one reason to change.

| Class               | Responsibility                          |
|--------------------|-----------------------------------------|
| RuleEngine         | Orchestrate Event → Condition → Action  |
| RuleEvaluator      | Evaluate conditions only                |
| RuleRepository     | Data access for rules only              |
| ActionFactory      | Create action instances only            |
| BaseAction (subs)  | Execute one specific action             |
| EventBus           | Route events to subscribers only        |

### Open/Closed Principle (OCP)

> Open for extension, closed for modification.

- **New operators:** `evaluator.registerOperator('regex', fn)` — no existing code changes
- **New actions:** `ActionFactory.register('NewAction', NewActionClass)` — no existing code changes
- **New subscribers:** `eventBus.subscribe('NewEvent', handler)` — no existing code changes

### Liskov Substitution Principle (LSP)

> Subtypes must be substitutable for their base types.

All 7 action classes extend `BaseAction` and implement `execute()`. The RuleEngine treats them identically through the base class interface.

### Interface Segregation Principle (ISP)

> Clients should not depend on interfaces they don't use.

- Actions only implement `execute()` — no unnecessary methods
- Evaluator only implements `evaluate()` and `getOperators()`
- Repository exposes only the queries the engine needs

### Dependency Inversion Principle (DIP)

> Depend on abstractions, not concretes.

- RuleEngine depends on `RuleEvaluator` (abstraction) not specific operator implementations
- RuleEngine depends on `RuleRepository` (abstraction) not Prisma directly
- RuleEngine depends on `ActionFactory` which returns `BaseAction` (abstraction) not concrete action
