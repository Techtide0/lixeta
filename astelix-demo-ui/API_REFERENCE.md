# LIXETA API Reference Documentation

## 📖 Complete API Documentation

**Version:** 1.0.0  
**Last Updated:** January 22, 2026  
**Base URL:** `http://localhost:3000/api` (development) or `https://api.lixeta.com/api` (production)  
**Authentication:** Bearer Token in Authorization header  
**API Key Format:** `sk_live_` (production) or `sk_test_` (development)  

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Core Concepts](#core-concepts)
4. [API Endpoints](#api-endpoints)
5. [Scenarios](#scenarios)
6. [Code Examples](#code-examples)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Webhooks](#webhooks)
10. [SDK & Libraries](#sdk--libraries)

---

## Getting Started

### What is LIXETA?

LIXETA is a time-aware messaging and action orchestration engine. It intelligently handles:

- **Cross-timezone messaging** - Automatically resolve sender/receiver time zones
- **Behavior-based rules** - Trigger actions based on user behavior patterns
- **Active hours enforcement** - Respect user schedules and delivery windows
- **Multi-channel orchestration** - Unified delivery across SMS, Email, Push, Webhook, Slack
- **Event-driven actions** - Automatic responses to system events (login, purchase, etc.)

### Key Features

✅ **Timezone Intelligence** - Intelligent time zone detection and conversion  
✅ **Rule Engine** - Powerful behavior rule matching and execution  
✅ **Channel Agnostic** - Write rules once, deliver anywhere  
✅ **Event Processing** - Real-time event handling and orchestration  
✅ **Audit Logs** - Complete audit trail of all actions  
✅ **Rate Limiting** - Fair usage with configurable rate limits  

---

## Authentication

### API Key

All requests require an API key in the Authorization header.

```
Authorization: Bearer sk_test_abc123def456
```

or in production:

```
Authorization: Bearer sk_live_xxxxxxxxxxxxx
```

### Generate API Key

1. Log in to LIXETA Dashboard
2. Navigate to **Settings → API Keys**
3. Click **"Generate New Key"**
4. Copy your key (shown only once)
5. Use in Authorization header

### Key Formats

- **Test Key:** `sk_test_*` (starts with `sk_test_`)
- **Live Key:** `sk_live_*` (starts with `sk_live_`)
- **Publishable Key:** `sk_pub_*` (for client-side, limited permissions)

### Security Best Practices

✅ Never commit API keys to version control  
✅ Rotate keys regularly (recommended monthly)  
✅ Use environment variables for key storage  
✅ Revoke keys if compromised  
✅ Use scoped keys with minimal permissions  
✅ Monitor API key activity in dashboard  

---

## Core Concepts

### Messages

A message is the fundamental unit in LIXETA. Messages contain:

```typescript
interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    timezone: string;
    localTime: string;
  };
  receiver: {
    id: string;
    timezone: string;
    localTime: string;
  };
  metadata: {
    utcTime: string;
    senderLocal: string;
    receiverLocal: string;
  };
  status: 'pending' | 'delivered' | 'delayed' | 'failed';
  channels: string[];
  rules: string[];
}
```

### Rules

Rules are conditions that trigger actions:

```typescript
interface Rule {
  id: string;
  name: string;
  type: 'timezone' | 'behavior' | 'active_hours' | 'event';
  condition: string;
  action: string;
  enabled: boolean;
}
```

### Events

Events trigger rule evaluation:

```typescript
interface Event {
  id: string;
  type: 'message.sent' | 'message.delivered' | 'user.login' | 'user.action';
  timestamp: string;
  data: Record<string, any>;
}
```

### Actions

Actions are executed when rules match:

```typescript
interface Action {
  id: string;
  type: 'send_message' | 'send_reminder' | 'show_popup' | 'webhook';
  target: string;
  payload: Record<string, any>;
  status: 'pending' | 'executed' | 'failed';
}
```

---

## API Endpoints

### Signals (Events/Messages)

#### Record Event/Signal

**POST** `/signals`

Record a user signal (message, event, or action) with timezone intelligence and rule evaluation.

**Request Body:**
```json
{
  "userId": "user_123",
  "eventType": "login",
  "occurredAt": "2026-01-22T20:15:30Z",
  "timezone": "America/New_York",
  "metadata": {
    "channel": "sms",
    "content": "Please approve this transaction",
    "platform": "web",
    "ip": "192.168.1.100"
  }
}
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "Signal recorded successfully",
  "userId": "user_123",
  "eventType": "login",
  "occurredAt": "2026-01-22T20:15:30Z",
  "timezone": "America/New_York",
  "ruleMatches": [
    {
      "ruleId": "rule_active_hours",
      "matched": true,
      "action": "delay_delivery"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Signal recorded successfully
- `201 Created` - Signal created and processed
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Invalid API key
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded

---

#### Get User Signals

**GET** `/signals/{userId}`

Retrieve all signals/events for a specific user.

**Response:**
```json
{
  "userId": "user_123",
  "signals": [
    {
      "id": "signal_abc123",
      "eventType": "login",
      "occurredAt": "2026-01-22T20:15:30Z",
      "timezone": "America/New_York",
      "metadata": {
        "platform": "web",
        "ip": "192.168.1.100"
      },
      "processed": true
    }
  ],
  "totalCount": 42,
  "timezone": "America/New_York"
}
```

---

#### Query Signals

**GET** `/signals?userId={userId}&eventType={type}&limit=50&offset=0`

Query signals with filtering and pagination.

**Query Parameters:**
- `userId` (required) - Filter by user ID
- `eventType` (optional) - Filter by event type (login, purchase, reminder, etc.)
- `limit` (optional, default: 50) - Max results per page
- `offset` (optional, default: 0) - Results offset
- `startDate` (optional) - ISO 8601 date
- `endDate` (optional) - ISO 8601 date

**Response:**
```json
{
  "signals": [
    {
      "id": "signal_abc123",
      "userId": "user_123",
      "eventType": "login",
      "occurredAt": "2026-01-22T20:15:30Z",
      "processed": true
    }
  ],
  "pagination": {
    "total": 152,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Rules

#### Create Behavior Rule

**POST** `/rules`

Create a new behavior rule for event processing.

**Request Body:**
```json
{
  "name": "active_hours_enforcement",
  "description": "Delay message delivery outside business hours",
  "type": "active_hours",
  "condition": "currentHour < 9 OR currentHour > 18",
  "action": "delay",
  "channels": ["sms", "email"],
  "enabled": true,
  "metadata": {
    "delayUntilHour": 9,
    "timeZoneAware": true
  }
}
```

**Response (201 Created):**
```json
{
  "id": "rule_active_hours_123",
  "name": "active_hours_enforcement",
  "type": "active_hours",
  "enabled": true,
  "createdAt": "2026-01-22T20:15:30Z",
  "version": 1
}
```

---

#### Update Rule

**PUT** `/rules/{ruleId}`

Update an existing behavior rule.

**Request Body:**
```json
{
  "name": "active_hours_enforcement_updated",
  "condition": "currentHour < 9 OR currentHour > 19",
  "enabled": true,
  "metadata": {
    "delayUntilHour": 10
  }
}
```

**Response (200 OK):**
```json
{
  "id": "rule_active_hours_123",
  "name": "active_hours_enforcement_updated",
  "enabled": true,
  "updatedAt": "2026-01-22T21:00:00Z",
  "version": 2
}
```

---

#### Delete Rule

**DELETE** `/rules/{ruleId}`

Delete a behavior rule.

**Response:** `204 No Content`

---

#### List Rules

**GET** `/rules?enabled=true&type=active_hours`

List all behavior rules with filtering.

**Query Parameters:**
- `enabled` (optional) - Filter by enabled status (true/false)
- `type` (optional) - Filter by type (active_hours, behavior_reminder, etc.)
- `limit` (optional, default: 50) - Max results per page
- `offset` (optional, default: 0) - Results offset
- `channel` (optional) - Filter by channel

**Response (200 OK):**
```json
{
  "rules": [
    {
      "id": "rule_active_hours_123",
      "name": "active_hours_enforcement",
      "type": "active_hours",
      "enabled": true,
      "channels": ["sms", "email"],
      "createdAt": "2026-01-22T20:15:30Z"
    }
  ],
  "total": 8
}
```

---

### Decisions & Actions

#### Get User Decisions

**GET** `/decisions/users/{userId}`

Get recommended actions and decisions for a user based on their signals and rules.

**Response (200 OK):**
```json
{
  "userId": "user_123",
  "decisions": [
    {
      "id": "decision_abc123",
      "ruleId": "rule_active_hours_123",
      "action": "delay",
      "reason": "Outside active hours (9 AM - 6 PM EST)",
      "channel": "sms",
      "scheduledFor": "2026-01-23T09:00:00Z",
      "confidence": 0.95
    }
  ],
  "timestamp": "2026-01-22T20:15:30Z"
}
```

---

#### Execute Action

**POST** `/actions`

Manually trigger an action execution (send message, notification, etc.).

**Request Body:**
```json
{
  "type": "send_message",
  "userId": "user_123",
  "targetUserId": "user_456",
  "channel": "sms",
  "content": "You have an outstanding request",
  "metadata": {
    "priority": "high",
    "retryCount": 3
  }
}
```

**Response (200 OK):**
```json
{
  "id": "action_msg_abc123",
  "type": "send_message",
  "status": "executed",
  "channel": "sms",
  "userId": "user_123",
  "executedAt": "2026-01-22T20:15:35Z",
  "result": {
    "success": true,
    "deliveredTo": "user_456",
    "messageId": "msg_xyz789"
  }
}
```

---

#### Get Action Status

**GET** `/actions/{actionId}`

Get the status and result of a specific action.

**Response (200 OK):**
```json
{
  "id": "action_msg_abc123",
  "type": "send_message",
  "status": "executed",
  "channel": "sms",
  "createdAt": "2026-01-22T20:15:30Z",
  "executedAt": "2026-01-22T20:15:35Z",
  "result": {
    "success": true,
    "recipient": "user_456",
    "messageId": "msg_xyz789",
    "deliveredAt": "2026-01-22T20:15:38Z"
  }
}
```

---

### Audit Logs

#### Get Audit Logs

**GET** `/audit-logs?limit=50&offset=0&action={action}&userId={userId}`

Retrieve audit logs for compliance and debugging.

**Query Parameters:**
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)
- `action` (optional) - Filter by action type
- `userId` (optional) - Filter by user
- `startDate` (optional) - ISO 8601 date
- `endDate` (optional) - ISO 8601 date

**Response (200 OK):**
```json
{
  "logs": [
    {
      "id": "log_123",
      "timestamp": "2026-01-22T20:15:30Z",
      "action": "signal.recorded",
      "userId": "user_123",
      "eventType": "login",
      "ruleMatches": ["active_hours_enforcement"],
      "actionsTriggered": ["delay"]
    }
  ],
  "pagination": {
    "total": 5420,
    "limit": 50,
    "offset": 0
  }
}
```

---

## Scenarios

### Scenario 1: Dual-Time Message (Timezone Intelligence)

**Use Case:** Send signal with automatic timezone handling and rule evaluation

**Flow:**
1. Record signal from user in New York (EST)
2. LIXETA evaluates against active_hours rule
3. Detects outside business hours (after 6 PM)
4. Applies delay action until 9 AM next day
5. Returns decision with scheduled delivery time

**API Call:**
```bash
curl -X POST http://localhost:3000/api/signals \
  -H "Authorization: Bearer sk_test_abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "eventType": "purchase",
    "timezone": "America/New_York",
    "occurredAt": "2026-01-22T23:15:30Z",
    "metadata": {
      "channel": "sms",
      "content": "Purchase confirmation: $500 approved"
    }
  }'
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Signal recorded successfully",
  "userId": "user_123",
  "eventType": "purchase",
  "ruleMatches": [
    {
      "ruleId": "rule_active_hours_123",
      "matched": true,
      "action": "delay",
      "delayUntil": "2026-01-23T09:00:00Z",
      "reason": "Outside active hours (9 AM - 6 PM EST)"
    }
  ],
  "appliedRules": ["active_hours_enforcement"]
}
```

**Follow-up Call - Check Decision:**
```bash
curl -X GET http://localhost:3000/api/decisions/users/user_123 \
  -H "Authorization: Bearer sk_test_abc123def456"
```

---

### Scenario 2: Behavior-Based Reminder (No-Reply Rule)

**Use Case:** Auto-trigger reminder action based on behavior pattern

**Flow:**
1. Record initial signal (message sent)
2. Monitor user behavior (no reply for 10 minutes)
3. Trigger behavior event with elapsed time
4. `no_reply_10min` rule matches
5. Send reminder action via SMS

**API Call - Record Initial Signal:**
```bash
curl -X POST http://localhost:3000/api/signals \
  -H "Authorization: Bearer sk_test_abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "eventType": "request_sent",
    "timezone": "America/Chicago",
    "occurredAt": "2026-01-22T14:00:00Z",
    "metadata": {
      "channel": "sms",
      "content": "You have an outstanding request waiting",
      "requestId": "req_789"
    }
  }'
```

**API Call - Trigger Reminder After 10 Minutes:**
```bash
curl -X POST http://localhost:3000/api/signals \
  -H "Authorization: Bearer sk_test_abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "eventType": "no_reply_10min",
    "timezone": "America/Chicago",
    "occurredAt": "2026-01-22T14:10:00Z",
    "metadata": {
      "channel": "sms",
      "requestId": "req_789",
      "windowMinutes": 10
    }
  }'
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Signal recorded successfully",
  "userId": "user_123",
  "eventType": "no_reply_10min",
  "ruleMatches": [
    {
      "ruleId": "rule_no_reply_10min",
      "matched": true,
      "action": "send_reminder"
    }
  ],
  "actionsTriggered": [
    {
      "id": "action_reminder_123",
      "type": "send_message",
      "channel": "sms",
      "content": "Reminder: Please reply to your pending request",
      "status": "queued"
    }
  ]
}
```

---

### Scenario 3: Fintech Login (Multi-Action Orchestration)

**Use Case:** Execute multiple actions on user login event

**Flow:**
1. User logs into fintech platform
2. Emit login event to LIXETA
3. Rules match: welcome_popup and guidance_tour
4. Actions executed with 5-second delay between them
5. User experiences coordinated interactions

**API Call - Emit Login Event:**
```bash
curl -X POST http://localhost:3000/api/signals \
  -H "Authorization: Bearer sk_test_abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "eventType": "login",
    "timezone": "America/New_York",
    "occurredAt": "2026-01-22T09:30:00Z",
    "metadata": {
      "email": "john_doe@fintech.com",
      "platform": "web",
      "ipAddress": "203.0.113.45",
      "deviceType": "desktop"
    }
  }'
```

**API Call - Check User Decisions:**
```bash
curl -X GET http://localhost:3000/api/decisions/users/user_123 \
  -H "Authorization: Bearer sk_test_abc123def456"
```

**Expected Response:**
```json
{
  "userId": "user_123",
  "decisions": [
    {
      "id": "decision_popup_1",
      "ruleId": "rule_welcome_popup",
      "action": "show_popup",
      "title": "Welcome back 👋",
      "content": "You're logged in successfully",
      "status": "pending",
      "delayMs": 0
    },
    {
      "id": "decision_tour_2",
      "ruleId": "rule_guidance_tour",
      "action": "show_tour",
      "title": "Feature Guidance 📍",
      "content": "New features in your dashboard",
      "status": "pending",
      "delayMs": 5000
    }
  ],
  "appliedRules": ["welcome_popup", "guidance_tour"]
}
```

**Execute Actions:**
```bash
curl -X POST http://localhost:3000/api/actions \
  -H "Authorization: Bearer sk_test_abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "type": "show_popup",
    "channel": "web",
    "content": "Welcome back to your fintech dashboard",
    "metadata": {
      "decisionId": "decision_popup_1",
      "priority": "high"
    }
  }'
```

---

### Scenario 4: Active Hours Window (Schedule-Based Delivery)

**Use Case:** Respect user's active hours and delay messages accordingly

**Flow:**
1. Signal received at 2:15 AM PST (outside active hours)
2. `active_hours_enforcement` rule evaluates
3. Current time outside 9 AM - 6 PM PST window
4. Action automatically delayed until 9:00 AM PST next day
5. Audit log records the delay decision

**API Call - Record Signal During Off-Hours:**
```bash
curl -X POST http://localhost:3000/api/signals \
  -H "Authorization: Bearer sk_test_abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_789",
    "eventType": "account_alert",
    "timezone": "America/Los_Angeles",
    "occurredAt": "2026-01-23T02:15:00Z",
    "metadata": {
      "channel": "sms",
      "content": "Your account requires attention: Verify your identity",
      "priority": "normal",
      "alertId": "alert_456"
    }
  }'
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Signal recorded successfully",
  "userId": "user_789",
  "eventType": "account_alert",
  "ruleMatches": [
    {
      "ruleId": "rule_active_hours_123",
      "matched": true,
      "action": "delay",
      "delayReason": "Outside active hours (9 AM - 6 PM PST)",
      "delayUntil": "2026-01-23T09:00:00-07:00",
      "delayDuration": "6 hours 45 minutes",
      "confidence": 0.99
    }
  ],
  "appliedRules": ["active_hours_enforcement"],
  "scheduledDelivery": {
    "time": "2026-01-23T09:00:00Z",
    "userLocal": "9:00 AM PST"
  }
}
```

**Check Audit Log - Verify Delay Decision:**
```bash
curl -X GET "http://localhost:3000/api/audit-logs?userId=user_789&action=signal.delayed&limit=10" \
  -H "Authorization: Bearer sk_test_abc123def456"
```

**Expected Audit Response:**
```json
{
  "logs": [
    {
      "id": "log_audit_123",
      "timestamp": "2026-01-23T02:15:05Z",
      "action": "signal.delayed",
      "userId": "user_789",
      "eventType": "account_alert",
      "ruleMatches": ["rule_active_hours_123"],
      "delayDetails": {
        "reason": "active_hours_enforcement",
        "delayedUntil": "2026-01-23T09:00:00Z",
        "hours": 6,
        "minutes": 45
      }
    }
  ]
}
```

---

## Code Examples

### JavaScript / Node.js

#### Using Node.js Fetch

```javascript
const API_KEY = 'sk_test_abc123def456';
const BASE_URL = 'http://localhost:3000/api'; // Change to production URL

async function recordSignal(userId, eventType, timezone, metadata) {
  const response = await fetch(`${BASE_URL}/signals`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId,
      eventType,
      timezone,
      occurredAt: new Date().toISOString(),
      metadata
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${error.message}`);
  }

  return await response.json();
}

// Usage
const result = await recordSignal(
  'user_123',
  'login',
  'America/New_York',
  {
    channel: 'sms',
    platform: 'web',
    ip: '203.0.113.45'
  }
);

console.log('Signal recorded:', result);
```

#### Using Axios with Error Handling

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: process.env.LIXETA_API_URL || 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${process.env.LIXETA_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
client.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

async function getUserDecisions(userId) {
  try {
    const response = await client.get(`/decisions/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get decisions:', error);
    throw error;
  }
}

async function executeAction(userId, type, channel, content) {
  try {
    const response = await client.post('/actions', {
      userId,
      type,
      channel,
      content,
      metadata: { timestamp: new Date().toISOString() }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to execute action:', error);
    throw error;
  }
}

// Usage
const decisions = await getUserDecisions('user_123');
console.log('User decisions:', decisions);

const actionResult = await executeAction(
  'user_123',
  'send_message',
  'sms',
  'Your account update is complete'
);
console.log('Action executed:', actionResult);
```

---

### Python

```python
import requests
import os
from datetime import datetime

API_KEY = os.environ.get('LIXETA_API_KEY', 'sk_test_abc123def456')
BASE_URL = os.environ.get('LIXETA_API_URL', 'http://localhost:3000/api')

class LixetaClient:
    def __init__(self, api_key, base_url):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })
    
    def record_signal(self, user_id, event_type, timezone, metadata=None):
        """Record a user signal/event"""
        payload = {
            'userId': user_id,
            'eventType': event_type,
            'timezone': timezone,
            'occurredAt': datetime.utcnow().isoformat() + 'Z',
            'metadata': metadata or {}
        }
        
        response = self.session.post(
            f'{self.base_url}/signals',
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def get_user_decisions(self, user_id):
        """Get decisions for a user"""
        response = self.session.get(
            f'{self.base_url}/decisions/users/{user_id}'
        )
        response.raise_for_status()
        return response.json()
    
    def execute_action(self, user_id, action_type, channel, content, metadata=None):
        """Execute an action for a user"""
        payload = {
            'userId': user_id,
            'type': action_type,
            'channel': channel,
            'content': content,
            'metadata': metadata or {}
        }
        
        response = self.session.post(
            f'{self.base_url}/actions',
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def get_audit_logs(self, user_id=None, action=None, limit=50):
        """Retrieve audit logs with filtering"""
        params = {'limit': limit}
        if user_id:
            params['userId'] = user_id
        if action:
            params['action'] = action
        
        response = self.session.get(
            f'{self.base_url}/audit-logs',
            params=params
        )
        response.raise_for_status()
        return response.json()

# Usage
client = LixetaClient(API_KEY, BASE_URL)

# Record a signal
signal_result = client.record_signal(
    user_id='user_123',
    event_type='login',
    timezone='America/New_York',
    metadata={
        'channel': 'sms',
        'platform': 'web',
        'ip': '203.0.113.45'
    }
)
print('Signal recorded:', signal_result)

# Get user decisions
decisions = client.get_user_decisions('user_123')
print('User decisions:', decisions)

# Execute an action
action_result = client.execute_action(
    user_id='user_123',
    action_type='send_message',
    channel='sms',
    content='Your account update is complete'
)
print('Action executed:', action_result)

# Check audit logs
logs = client.get_audit_logs(user_id='user_123', limit=20)
print('Audit logs:', logs)
```

---

### React / TypeScript

```typescript
import { useState, useCallback } from 'react';

interface SignalPayload {
  userId: string;
  eventType: string;
  timezone: string;
  metadata?: Record<string, any>;
}

interface Decision {
  id: string;
  ruleId: string;
  action: string;
  reason: string;
  channel?: string;
  confidence: number;
}

const useLixetaAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const API_KEY = process.env.REACT_APP_LIXETA_API_KEY || 'sk_test_abc123def456';
  const BASE_URL = process.env.REACT_APP_LIXETA_URL || 'http://localhost:3000/api';
  
  const recordSignal = useCallback(async (payload: SignalPayload) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/signals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          occurredAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to record signal');
      }
      
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_KEY, BASE_URL]);
  
  const getUserDecisions = useCallback(async (userId: string): Promise<Decision[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${BASE_URL}/decisions/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch decisions');
      }
      
      const data = await response.json();
      return data.decisions || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_KEY, BASE_URL]);
  
  return { recordSignal, getUserDecisions, loading, error };
};

// Component usage
export function DemoComponent() {
  const { recordSignal, getUserDecisions, loading, error } = useLixetaAPI();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  
  const handleLogin = async () => {
    try {
      await recordSignal({
        userId: 'user_123',
        eventType: 'login',
        timezone: 'America/New_York',
        metadata: {
          platform: 'web',
          ip: '203.0.113.45'
        }
      });
      
      // Fetch decisions for this user
      const userDecisions = await getUserDecisions('user_123');
      setDecisions(userDecisions);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };
  
  return (
    <div>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Processing...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {decisions.length > 0 && (
        <div>
          <h3>Pending Decisions:</h3>
          {decisions.map(d => (
            <div key={d.id}>
              <p>{d.action}: {d.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Signal recorded successfully |
| 202 | Accepted | Message queued (delayed delivery) |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Invalid/missing API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |
| 503 | Service Unavailable | Maintenance/downtime |

### Error Response Format

```json
{
  "error": {
    "code": "invalid_parameter",
    "message": "Receiver timezone is invalid",
    "details": {
      "field": "receiver.timezone",
      "value": "Invalid/TimeZone",
      "valid_values": ["America/New_York", "Europe/London", ...]
    }
  }
}
```

### Common Errors

#### Invalid API Key
```json
{
  "error": {
    "code": "authentication_failed",
    "message": "Invalid or expired API key"
  }
}
```

#### Rate Limit Exceeded
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "You have exceeded your rate limit",
    "details": {
      "limit": 5000,
      "used": 5000,
      "resetAt": "2026-01-22T21:00:00Z"
    }
  }
}
```

#### Invalid Timezone
```json
{
  "error": {
    "code": "invalid_timezone",
    "message": "Timezone 'Invalid/Zone' is not valid",
    "details": {
      "field": "receiver.timezone",
      "suggestion": "Did you mean 'America/New_York'?"
    }
  }
}
```

---

## Rate Limiting

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 5000
X-RateLimit-Used: 4847
X-RateLimit-Remaining: 153
X-RateLimit-Reset: 2026-01-22T21:00:00Z
```

### Limits by Tier

| Tier | Requests/Hour | Concurrent | Burst |
|------|---------------|-----------|-------|
| Free | 1,000 | 10 | 100 |
| Pro | 50,000 | 100 | 5,000 |
| Enterprise | Unlimited | 1,000 | Unlimited |

### Best Practices

✅ Check `X-RateLimit-Remaining` before making requests  
✅ Implement exponential backoff for retries  
✅ Cache results when possible  
✅ Use batch endpoints for bulk operations  
✅ Contact support if you need higher limits  

---

## Webhooks

### Webhook Events

LIXETA can send events to your application:

- `signal.recorded` - Signal/event successfully recorded
- `signal.processed` - Signal processed and rules evaluated
- `signal.delayed` - Signal delayed (outside active hours)
- `rule.triggered` - Rule condition matched
- `action.executed` - Action successfully executed
- `decision.created` - Decision made based on rules
- `decision.executed` - Decision action performed

### Webhook Format

```json
{
  "id": "webhook_123",
  "event": "signal.processed",
  "timestamp": "2026-01-22T20:15:35Z",
  "data": {
    "signalId": "signal_abc123",
    "userId": "user_123",
    "eventType": "login",
    "rulesMatched": ["rule_welcome_popup"],
    "actionsTriggered": [
      {
        "id": "action_123",
        "type": "show_popup",
        "status": "queued"
      }
    ]
  }
}
```

### Register Webhook

```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Authorization: Bearer sk_test_abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/lixeta",
    "events": ["signal.processed", "action.executed"],
    "active": true,
    "secret": "whsec_1a2b3c4d5e6f7g8h9i0j"
  }'
```

### Verify Webhook

All webhooks include a signature for verification:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}

// In your webhook handler
app.post('/webhooks/lixeta', (req, res) => {
  const signature = req.headers['x-lixeta-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, process.env.LIXETA_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log(`Webhook received: ${req.body.event}`);
  // Process webhook event
  res.json({ received: true });
});
```

---

## SDK & Libraries

### Official SDKs

#### Node.js SDK (Native Fetch)

```javascript
const API_KEY = 'sk_test_abc123def456';
const BASE_URL = 'http://localhost:3000/api';

class LixetaClient {
  constructor(apiKey, baseUrl = 'http://localhost:3000/api') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async recordSignal(userId, eventType, timezone, metadata = {}) {
    const response = await fetch(`${this.baseUrl}/signals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        eventType,
        timezone,
        occurredAt: new Date().toISOString(),
        metadata
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`${error.error?.code || 'Unknown error'}: ${error.error?.message}`);
    }

    return await response.json();
  }

  async getUserDecisions(userId) {
    const response = await fetch(`${this.baseUrl}/decisions/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user decisions');
    }

    return await response.json();
  }

  async executeAction(userId, actionType, channel, content, metadata = {}) {
    const response = await fetch(`${this.baseUrl}/actions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        type: actionType,
        channel,
        content,
        metadata
      })
    });

    if (!response.ok) {
      throw new Error('Failed to execute action');
    }

    return await response.json();
  }

  async getAuditLogs(userId, limit = 50) {
    const params = new URLSearchParams({ limit, userId });
    const response = await fetch(`${this.baseUrl}/audit-logs?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audit logs');
    }

    return await response.json();
  }
}

// Usage
const client = new LixetaClient(API_KEY);

// Record a signal
const signal = await client.recordSignal(
  'user_123',
  'login',
  'America/New_York',
  { platform: 'web', ip: '203.0.113.45' }
);
console.log('Signal recorded:', signal);

// Get decisions
const decisions = await client.getUserDecisions('user_123');
console.log('Decisions:', decisions);

// Execute action
const action = await client.executeAction(
  'user_123',
  'send_message',
  'sms',
  'Your account update is complete'
);
console.log('Action executed:', action);
```

#### Using npm Package (When Available)

```bash
npm install @lixeta/sdk
```

```javascript
const { LixetaClient } = require('@lixeta/sdk');

const client = new LixetaClient({
  apiKey: process.env.LIXETA_API_KEY,
  apiUrl: process.env.LIXETA_API_URL || 'http://localhost:3000/api'
});

// Record signal
const result = await client.signals.record({
  userId: 'user_123',
  eventType: 'login',
  timezone: 'America/New_York',
  metadata: { platform: 'web' }
});

// Get user decisions
const decisions = await client.decisions.getForUser('user_123');

// Execute action
const action = await client.actions.execute({
  userId: 'user_123',
  type: 'send_message',
  channel: 'sms',
  content: 'Your alert'
});
```

#### Python SDK

```bash
pip install lixeta
```

```python
from lixeta import Client
from datetime import datetime
import os

# Initialize client
client = Client(
    api_key=os.environ.get('LIXETA_API_KEY', 'sk_test_abc123def456'),
    api_url=os.environ.get('LIXETA_API_URL', 'http://localhost:3000/api')
)

# Record a signal
signal = client.signals.record(
    user_id='user_123',
    event_type='login',
    timezone='America/New_York',
    metadata={
        'platform': 'web',
        'ip': '203.0.113.45',
        'device': 'desktop'
    }
)
print(f"Signal recorded: {signal}")

# Get user decisions
decisions = client.decisions.get_for_user('user_123')
print(f"Decisions: {decisions}")

# Execute action
action = client.actions.execute(
    user_id='user_123',
    action_type='send_message',
    channel='sms',
    content='Your account update is complete',
    metadata={'priority': 'high'}
)
print(f"Action executed: {action}")

# Get audit logs
logs = client.audit.list(user_id='user_123', limit=20)
print(f"Audit logs: {logs}")

# Create rule
rule = client.rules.create(
    name='active_hours_enforcement',
    rule_type='active_hours',
    condition='currentHour < 9 OR currentHour > 18',
    channels=['sms', 'email'],
    enabled=True
)
print(f"Rule created: {rule}")
```

#### React SDK

```bash
npm install @lixeta/react
```

```typescript
import { useLixeta } from '@lixeta/react';

interface Decision {
  id: string;
  ruleId: string;
  action: string;
  reason: string;
  confidence: number;
}

function MyComponent() {
  const { 
    recordSignal, 
    getDecisions, 
    executeAction,
    loading, 
    error 
  } = useLixeta({
    apiKey: process.env.REACT_APP_LIXETA_API_KEY,
    apiUrl: process.env.REACT_APP_LIXETA_URL
  });

  const handleLogin = async () => {
    try {
      // Record login signal
      const signal = await recordSignal({
        userId: 'user_123',
        eventType: 'login',
        timezone: 'America/New_York',
        metadata: {
          platform: 'web',
          ip: '203.0.113.45'
        }
      });

      console.log('Signal recorded:', signal);

      // Get user decisions
      const decisions = await getDecisions('user_123');
      console.log('Decisions:', decisions);

      // Execute action based on decision
      if (decisions.length > 0) {
        const action = await executeAction({
          userId: 'user_123',
          type: decisions[0].action,
          channel: decisions[0].channel || 'web'
        });
        console.log('Action executed:', action);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Processing...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
```

### Community Libraries

- **Ruby:** `lixeta-ruby`
- **PHP:** `lixeta-php`
- **Go:** `go-lixeta`
- **Java:** `lixeta-java`
- **C#/.NET:** `Lixeta.Net`

---

## Support & Resources

### Documentation

- 📖 [Full API Docs](https://docs.lixeta.com)
- 📚 [Code Examples](https://github.com/lixeta/examples)
- 🎓 [Tutorials](https://learn.lixeta.com)
- 📰 [Blog](https://blog.lixeta.com)

### Support Channels

- 💬 [Chat Support](https://chat.lixeta.com)
- 📧 Email: support@lixeta.com
- 📞 Phone: +1-800-LIXETA-1
- 🎫 [GitHub Issues](https://github.com/lixeta/sdk/issues)

### Status & Monitoring

- 🟢 [System Status](https://status.lixeta.com)
- 📊 [API Metrics](https://dashboard.lixeta.com/metrics)
- 🚨 [Incident History](https://status.lixeta.com/history)

---

## FAQ

### Q: What timezone formats are supported?

A: We support IANA timezone database format (e.g., `America/New_York`, `Europe/London`). See [full list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

### Q: Can I test without an API key?

A: Yes, use our [interactive demo](https://demo.lixeta.com) or sandbox environment.

### Q: What's the SLA for message delivery?

A: 99.98% uptime SLA with support for Pro and Enterprise tiers.

### Q: How long are messages retained?

A: Messages are retained for 90 days. Enterprise customers can extend to 7 years.

### Q: Can I use multiple API keys?

A: Yes, create multiple keys in the dashboard for different environments/apps.

### Q: Is there a webhook retry policy?

A: Yes, webhooks retry up to 5 times with exponential backoff (1s, 2s, 5s, 10s, 30s).

---

## Changelog

### Version 1.0.0 (Current)

**Release Date:** January 22, 2026

**Features:**
- ✅ Message sending with timezone intelligence
- ✅ Rule engine with behavior matching
- ✅ Multi-channel orchestration
- ✅ Event-driven actions
- ✅ Audit logging
- ✅ Webhook support
- ✅ Rate limiting

**Status:** Stable & Production Ready

---

## License & Terms

This API is provided under the [LIXETA Service Agreement](https://lixeta.com/terms).

**© 2026 LIXETA Inc. All rights reserved.**

---

**Last Updated:** January 22, 2026  
**API Version:** 1.0.0  
**Status:** Active  

For the latest updates, visit [docs.lixeta.com](https://docs.lixeta.com)
