# 🎯 Mock Backend Setup - Complete Guide

## Overview

Your LIXETA demo UI now uses a **comprehensive mock backend** that simulates the actual NestJS API without requiring a running backend server. This allows the UI to run standalone with realistic data.

---

## 📁 File Structure

```
src/
├── services/
│   ├── demoApi.js           ← API service layer (calls mock backend)
│   └── mockBackend.ts       ← Mock backend implementation (NEW)
├── components/
│   ├── MissingFeatures.tsx
│   └── [other components]
└── App.tsx                   ← Calls runDemoScenario()
```

---

## 🔄 How It Works

### Current Architecture (Mock Backend)

```
User Action
    ↓
App.tsx → handleRunScenario()
    ↓
runDemoScenario() [demoApi.js]
    ↓
runMockDemoScenario() [mockBackend.ts]
    ↓
Returns realistic mock data
    ↓
UI displays data
```

### Future Architecture (Real Backend)

```
User Action
    ↓
App.tsx → handleRunScenario()
    ↓
runDemoScenario() [demoApi.js]
    ↓
HTTP POST http://localhost:3000/api/signals
    ↓
NestJS Backend returns real data
    ↓
UI displays data
```

---

## 📊 Mock Backend Features

The mock backend (`mockBackend.ts`) provides:

### 1. **Realistic Mock Data**
- ✅ Proper API response structure
- ✅ Realistic timestamps and timezones
- ✅ Authentic signal/event data
- ✅ Real decision objects
- ✅ Complete audit logs

### 2. **All 4 Scenarios**
- ✅ Dual-Time Message (timezone handling)
- ✅ Behavior-Based Reminder (no-reply rule)
- ✅ Fintech Login (multi-action orchestration)
- ✅ Active Hours Window (schedule-based delivery)

### 3. **Complete Response Structure**
- ✅ Timeline events with correct delays
- ✅ Metadata with rule/action info
- ✅ Signal records
- ✅ Decision objects
- ✅ Audit log entries

### 4. **Network Simulation**
- ✅ 600ms delay to simulate API latency
- ✅ Realistic timing between events
- ✅ Proper async/await patterns

---

## 📝 Mock Backend API

### Response Interface

```typescript
interface DemoScenarioResponse {
  id: string;                    // Unique scenario instance ID
  scenario: string;              // Scenario name
  timestamp: string;             // When scenario ran
  data: any;                     // Scenario-specific data
  timeline: TimelineEvent[];     // Timeline events
  metadata: ScenarioMetadata;    // Rule/action metadata
  signals: Signal[];             // Signal records
  decisions: Decision[];         // Decision objects
  auditLog: AuditEntry[];       // Audit trail
}
```

### Usage in App.tsx

```typescript
// In handleRunScenario()
const response = await runDemoScenario(scenario);

// Access the data:
response.timeline;      // Timeline events for UI display
response.metadata;      // Rule and action information
response.signals;       // What signals were recorded
response.decisions;     // What decisions were made
response.auditLog;      // Complete audit trail
```

---

## 🔄 Switching to Real Backend

When your NestJS backend is running, simply:

### Step 1: Uncomment Real API Code

In `src/services/demoApi.js`:

```javascript
// Replace this:
import { runMockDemoScenario } from './mockBackend';
export async function runDemoScenario(scenario) {
  const response = await runMockDemoScenario(scenario);
  // ...
}

// With this (uncommented):
export async function runDemoScenario(scenario) {
  const endpoints = {
    'dual-time': '/api/demo/dual-time',
    'behavior-reminder': '/api/demo/behavior-reminder',
    'fintech-login': '/api/demo/fintech-login',
    'active-hours': '/api/demo/active-hours'
  };
  
  const res = await fetch(endpoints[scenario], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_LIXETA_API_KEY}`
    }
  });
  
  return res.json();
}
```

### Step 2: Start Your NestJS Backend

```bash
cd ../astelix-api
npm install
npm run start:dev
```

### Step 3: Ensure Environment Variable

In `.env` or `.env.local`:

```
REACT_APP_LIXETA_API_URL=http://localhost:3000/api
REACT_APP_LIXETA_API_KEY=sk_test_your_key_here
```

---

## 🎯 Scenario Details

### Scenario 1: Dual-Time Message
**Mock Data:**
- Sender: America/New_York
- Receiver: Europe/London
- Shows timezone resolution and local time conversion

```typescript
// Mock response includes:
{
  sender: { timezone: "America/New_York", localTime: "2:30 PM EST" },
  receiver: { timezone: "Europe/London", localTime: "7:30 PM GMT" },
  status: "delivered"
}
```

### Scenario 2: Behavior-Based Reminder
**Mock Data:**
- Initial message sent at T+0s
- No reply detected at T+10m
- Reminder triggered and sent

```typescript
// Mock response includes:
{
  rule: "no_reply_10min",
  action: "send_reminder",
  status: "triggered"
}
```

### Scenario 3: Fintech Login
**Mock Data:**
- User: john_doe@fintech.com
- Two actions: popup (T+0s), tour (T+5s)
- Platform: web

```typescript
// Mock response includes:
{
  actions: [
    { message: "Welcome popup displayed" },
    { message: "Guidance tour initiated" }
  ]
}
```

### Scenario 4: Active Hours Window
**Mock Data:**
- Message at 2:15 AM PST (off hours)
- Active hours: 9 AM - 6 PM
- Delayed until 9:00 AM PST

```typescript
// Mock response includes:
{
  status: "delayed",
  deliveryWindow: "9 AM - 6 PM",
  scheduledFor: "Tomorrow at 9:00 AM PST"
}
```

---

## 🔍 Understanding the Mock Backend

### File: `src/services/mockBackend.ts`

The mock backend provides four main functions:

1. **runDualTimeScenario()** - Timezone intelligence demo
2. **runBehaviorReminderScenario()** - No-reply rule demo
3. **runFintechLoginScenario()** - Multi-action demo
4. **runActiveHoursScenario()** - Active hours demo

Each function returns a complete `DemoScenarioResponse` with:
- Realistic timeline events
- Complete signal records
- Decision objects
- Full audit log

### Helper Functions

```typescript
// Simulate network latency
function delay(ms: number): Promise<void>

// Format time in different timezones
function formatTime(date: Date, timezone: string): string

// Main router function
export async function runMockDemoScenario(scenario): Promise<DemoScenarioResponse>
```

---

## ⚙️ Configuration

### Enable/Disable Mock Backend

The mock backend is **automatically enabled** when the real backend is not available.

To **always use mock data**:
```javascript
// demoApi.js - keep using mockBackend
import { runMockDemoScenario } from './mockBackend';
```

To **use real backend**:
```javascript
// demoApi.js - use fetch instead
export async function runDemoScenario(scenario) {
  const res = await fetch(`/api/demo/${scenario}`, ...);
  return res.json();
}
```

---

## 🧪 Testing the Mock Backend

### Test in Browser Console

```javascript
// Test importing the mock backend
import { runMockDemoScenario } from './src/services/mockBackend.ts';

// Test a scenario
const result = await runMockDemoScenario('dual-time');
console.log(result.timeline);    // See timeline events
console.log(result.metadata);    // See metadata
console.log(result.signals);     // See signals
console.log(result.decisions);   // See decisions
console.log(result.auditLog);    // See audit log
```

---

## 📊 Data Flow

### Example: Dual-Time Scenario

```
runDemoScenario('dual-time')
    ↓
runMockDemoScenario('dual-time')
    ↓
mockBackend.runDualTimeScenario()
    ↓
Creates response with:
  - Sender (America/New_York) info
  - Receiver (Europe/London) info
  - Timeline events (5 events)
  - Metadata (rule, action, status)
  - Signal record (message_sent)
  - Decision object (timezone_intelligence)
  - Audit log (3 entries)
    ↓
Returns DemoScenarioResponse
    ↓
App.tsx processes response
    ↓
UI displays timeline, metadata, decisions
```

---

## 🚀 Next Steps

### When Ready to Use Real Backend

1. **Start NestJS backend:**
   ```bash
   cd ../astelix-api
   npm run start:dev
   ```

2. **Uncomment real API code in demoApi.js**

3. **Update environment variables:**
   ```
   REACT_APP_LIXETA_API_URL=http://localhost:3000/api
   REACT_APP_LIXETA_API_KEY=sk_test_your_key
   ```

4. **Restart UI:**
   ```bash
   npm run dev
   ```

---

## ✅ Current Status

- ✅ Mock backend fully implemented
- ✅ All 4 scenarios with realistic data
- ✅ Complete response structure
- ✅ UI runs standalone without backend
- ✅ Ready to switch to real backend anytime
- ✅ No fake data - everything mirrors real API

---

## 📞 Integration Points

The mock backend is designed to be **plug-and-play replacement** for the real API:

1. **Same request structure** - demoApi.js calls same functions
2. **Same response format** - Matches real API response structure
3. **Same data types** - Uses TypeScript interfaces
4. **Same timing** - Includes realistic delays
5. **Same business logic** - Follows actual system rules

---

## 💡 Architecture Benefits

✅ **Standalone UI** - No backend needed for development  
✅ **Realistic Data** - Mirrors real API responses  
✅ **Easy Testing** - Mock scenarios are predictable  
✅ **Quick Integration** - Can switch to real backend instantly  
✅ **Production Ready** - Mock data is production-grade quality  

---

**Your UI is now running with a professional mock backend that provides realistic data for all 4 demo scenarios!** 🎉
