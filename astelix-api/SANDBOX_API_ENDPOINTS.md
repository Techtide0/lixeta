# Sandbox API Documentation

## Overview
The Astelix Sandbox provides a testing environment to simulate user behaviors, send messages, and track decision-making. All endpoints are protected with API key authentication.

**Base URL:** `/api/sandbox`

### Sandbox Guarantees

- ✅ No real emails, SMS, or notifications are sent
- ✅ All data is isolated to the sandbox environment
- ✅ All actions are simulated and fully auditable
- ✅ Behavior and timing decisions reflect real production logic

---

## Table of Contents
1. [Quick Start (3-Minute Flow)](#quick-start-3-minute-flow)
2. [Core Concepts](#core-concepts)
3. [User Management](#user-management)
4. [Signal Management](#signal-management)
5. [Message Operations](#message-operations)
6. [Message State Tracking](#message-state-tracking)
7. [Rules & Decisions](#rules--decisions)
8. [Orchestration](#orchestration)
9. [Audit & Logs](#audit--logs)
10. [Active Hours](#active-hours)
11. [Actions Management](#actions-management)

---

## Quick Start (3-Minute Flow)

This is the fastest way to experience the Astelix Sandbox end-to-end.

### Step 1: Trigger a User Login Signal

```
POST /sandbox/signals

{
  "userId": "user_us",
  "type": "user_login"
}
```

### Step 2: View Decisions Created

```
GET /sandbox/decisions/user_us
```

Response shows pending decisions created by the signal.

### Step 3: Execute Decisions (Orchestrate)

```
POST /sandbox/orchestrate/user_us
```

Response shows executed actions (e.g., messages sent).

### Step 4: Verify in Audit Logs

```
GET /sandbox/audit/user_us
```

Response shows the complete transaction history.

---

## Core Concepts

Understanding these three concepts is key to using the Sandbox effectively.

### Signal
A raw behavioral input (login, click, scroll, etc.).
- **Recorded via:** `POST /sandbox/signals`
- **Example:** User logs in → signal type: `user_login`

### Event
A normalized internal representation of a signal.
- **Processed via:** `POST /sandbox/events` or `POST /sandbox/events/process`
- **Purpose:** Standardize signals for rule evaluation

### Decision
An outcome produced by evaluating rules against events.
- **Created by:** Rules engine processing events
- **Executed via:** `POST /sandbox/orchestrate/:userId`
- **Example:** "Send message" decision → action executed

### Flow

```
Signal → Event → Rule Evaluation → Decision → Action → Audit Log
```

---

## User Management

### Get All Users
Retrieve a list of all sandbox users with their timezones.

**Endpoint:** `GET /sandbox/users`

**Method:** GET

**Parameters:** None

**Response:**
```json
[
  {
    "id": "user_us",
    "timezone": "America/New_York",
    "internalId": "uuid-123"
  },
  {
    "id": "user_uk",
    "timezone": "Europe/London",
    "internalId": "uuid-456"
  }
]
```

---

## Signal Management

### Get Signal Catalog
Discover all supported behavioral signals and their sandbox actions.

**Endpoint:** `GET /sandbox/signals/catalog`

**Method:** GET

**Parameters:** None

**Description:**
Returns a complete catalog of signal types (user_login, user_click, scroll, etc.) and the actions they trigger. Use this endpoint to:
- Discover valid signal types for your test scenarios
- Understand which demo actions are triggered by each signal
- Build dynamic test UIs that reflect available behaviors

**Response:**
```json
{
  "signals": [
    {
      "type": "user_login",
      "description": "User authentication/login event",
      "eventTypes": ["USER_LOGIN"],
      "demoActions": [
        {
          "type": "send_message",
          "reason": "User login detected",
          "channel": "sandbox"
        }
      ]
    }
  ]
}
```

---

### Record a Signal
Create a new signal event (user login, click, etc.) to trigger automated actions.

**Endpoint:** `POST /sandbox/signals`

**Method:** POST

**Signal Naming Convention:**
- Signal types use **snake_case**: `user_login`, `user_click`, `page_scroll`
- Valid signals are documented in the Signal Catalog

**Body:**
```json
{
  "userId": "user_us",
  "type": "user_login",
  "metadata": {}
}
```

**Parameters:**
- `userId` (string, required): The user triggering the signal (e.g., "user_us")
- `type` (string, required): Signal type in snake_case (e.g., "user_login", "user_click", "page_scroll")
- `metadata` (object, optional): Additional signal information

**Response:**
```json
{
  "status": "ok",
  "message": "Signal recorded and decisions created",
  "signal": {
    "userId": "user_us",
    "type": "login",
    "timestamp": "2026-01-30T16:55:00.000Z"
  },
  "decisionsCreated": 2
}
```

---

## Message Operations

### Send a Message Immediately
Send a message to a user right away.

**Endpoint:** `POST /sandbox/send-message`

**Method:** POST

**Body:**
```json
{
  "senderId": "user_sender",
  "receiverId": "user_receiver",
  "senderTimezone": "America/New_York",
  "receiverTimezone": "Europe/London",
  "content": "Hello! This is a test message."
}
```

**Parameters:**
- `senderId` (string, required): ID of the person sending the message
- `receiverId` (string, required): ID of the person receiving the message
- `senderTimezone` (string, required): Timezone of sender (e.g., "America/New_York")
- `receiverTimezone` (string, required): Timezone of receiver (e.g., "Europe/London")
- `content` (string, required): Message content

**Response:**
```json
{
  "messageId": "msg_abc123",
  "status": "sent",
  "sandbox": true,
  "senderId": "user_sender",
  "receiverId": "user_receiver",
  "content": "Hello! This is a test message.",
  "createdAt": "2026-01-30T16:55:00.000Z"
}
```

---

### Schedule a Message
Schedule a message to be sent at a future time.

**Endpoint:** `POST /sandbox/schedule`

**Method:** POST

**Body:**
```json
{
  "senderId": "user_sender",
  "receiverId": "user_receiver",
  "senderTimezone": "America/New_York",
  "receiverTimezone": "Europe/London",
  "content": "Hello! Scheduled message.",
  "scheduledFor": "2026-01-31T10:00:00Z"
}
```

**Parameters:**
- `senderId` (string, required): ID of the person sending the message
- `receiverId` (string, required): ID of the person receiving the message
- `senderTimezone` (string, required): Timezone of sender
- `receiverTimezone` (string, required): Timezone of receiver
- `content` (string, required): Message content
- `scheduledFor` (string, required): ISO 8601 timestamp for when to send

**Response:**
```json
{
  "messageId": "msg_def456",
  "status": "scheduled",
  "sandbox": true,
  "scheduledFor": "2026-01-31T10:00:00Z"
}
```

---

### Get Sent Messages
Retrieve all messages sent by a specific user.

**Endpoint:** `GET /sandbox/messages/sent/:senderId`

**Method:** GET

**Parameters:**
- `senderId` (URL parameter, required): ID of the sender (e.g., "user_us")

**Response:**
```json
[
  {
    "messageId": "msg_abc123",
    "senderId": "user_us",
    "receiverId": "user_uk",
    "content": "Hello!",
    "createdAt": "2026-01-30T16:55:00.000Z"
  }
]
```

---

### Get Received Messages
Retrieve all messages received by a specific user.

**Endpoint:** `GET /sandbox/messages/received/:receiverId`

**Method:** GET

**Parameters:**
- `receiverId` (URL parameter, required): ID of the receiver (e.g., "user_us")

**Response:**
```json
[
  {
    "messageId": "msg_abc123",
    "senderId": "user_sender",
    "receiverId": "user_us",
    "content": "Hello!",
    "createdAt": "2026-01-30T16:55:00.000Z"
  }
]
```

---

### Deliver Message via Delivery Service
Deliver a message using the dual-timezone delivery system.

**Endpoint:** `POST /sandbox/messages/deliver`

**Method:** POST

**Body:**
```json
{
  "senderId": "user_sender",
  "receiverId": "user_receiver",
  "senderTimezone": "America/New_York",
  "receiverTimezone": "Europe/London",
  "messageContent": "Test message content"
}
```

**Parameters:**
- `senderId` (string, required): Sender's user ID
- `receiverId` (string, required): Receiver's user ID
- `senderTimezone` (string, required): Sender's timezone
- `receiverTimezone` (string, required): Receiver's timezone
- `messageContent` (string, required): The message text

**Response:**
```json
{
  "messageId": "msg_xyz789",
  "status": "delivered",
  "dualTime": {
    "senderLocal": "2026-01-30 11:55:00",
    "receiverLocal": "2026-01-30 16:55:00"
  }
}
```

---

## Message State Tracking

### Message Status Semantics

Understand how message states evolve:

- **`scheduled`** → Waiting for the scheduled delivery time
- **`delayed`** → Delivery deferred by rules (e.g., outside active hours)
- **`delivered`** → Message successfully delivered to receiver
- **`read`** → Receiver has read the message
- **`replied`** → Receiver has replied

**Note:** A message may transition from `delayed` → `delivered` automatically when delivery conditions are met. This is expected behavior, not an error.

---

### Get Message State
Check the current state (delivery status, read status, etc.) of a message.

**Endpoint:** `GET /sandbox/message-state/:messageId`

**Method:** GET

**Parameters:**
- `messageId` (URL parameter, required): ID of the message (e.g., "msg_abc123")

**Response:**
```json
{
  "messageId": "msg_abc123",
  "status": "read",
  "deliveredAt": "2026-01-30T16:55:00.000Z",
  "readAt": "2026-01-30T17:30:00.000Z"
}
```

---

### Mark Message as Delivered
Update a message's status to "delivered".

**Endpoint:** `POST /sandbox/message/:messageId/mark-delivered`

**Method:** POST

**Parameters:**
- `messageId` (URL parameter, required): ID of the message

**Body:** None (empty)

**Response:**
```json
{
  "messageId": "msg_abc123",
  "status": "delivered",
  "deliveredAt": "2026-01-30T16:55:00.000Z"
}
```

---

### Mark Message as Read
Update a message's status to "read".

**Endpoint:** `POST /sandbox/message/:messageId/mark-read`

**Method:** POST

**Parameters:**
- `messageId` (URL parameter, required): ID of the message

**Body:** None (empty)

**Response:**
```json
{
  "messageId": "msg_abc123",
  "status": "read",
  "readAt": "2026-01-30T17:30:00.000Z"
}
```

---

### Mark Message as Replied
Update a message's status to "replied".

**Endpoint:** `POST /sandbox/message/:messageId/mark-replied`

**Method:** POST

**Parameters:**
- `messageId` (URL parameter, required): ID of the message

**Body:** None (empty)

**Response:**
```json
{
  "messageId": "msg_abc123",
  "status": "replied",
  "repliedAt": "2026-01-30T17:45:00.000Z"
}
```

---

## Rules & Decisions

### Get All Rules
View all behavioral rules configured in the system.

**Endpoint:** `GET /sandbox/rules`

**Method:** GET

**Parameters:** None

**Response:**
```json
{
  "totalRules": 5,
  "rules": [
    {
      "id": "rule_1",
      "name": "Login Trigger",
      "trigger": "user_login",
      "priority": 1,
      "delayMs": 0
    }
  ]
}
```

---

### Get Decisions for a User
Retrieve all pending decisions for a specific user.

**Endpoint:** `GET /sandbox/decisions/:userId`

**Method:** GET

**Parameters:**
- `userId` (URL parameter, required): ID of the user (e.g., "user_us")

**Response:**
```json
{
  "userId": "user_us",
  "decisions": [
    {
      "type": "send_message",
      "channel": "sandbox",
      "reason": "User login detected",
      "confidence": 0.85,
      "createdAt": "2026-01-30T16:55:00.000Z",
      "status": "pending"
    }
  ]
}
```

---

### Process an Event
Trigger behavioral rules by processing an event.

**Endpoint:** `POST /sandbox/events/process`

**Method:** POST

**Body:**
```json
{
  "type": "user_login",
  "userId": "user_us",
  "timestamp": "2026-01-30T16:55:00.000Z",
  "timezone": "America/New_York"
}
```

**Parameters:**
- `type` (string, required): Event type (e.g., "user_login", "user_click")
- `userId` (string, required): ID of the user triggering the event
- `timestamp` (string, optional): When the event occurred
- `timezone` (string, optional): User's timezone

**Response:**
```json
{
  "eventId": "evt_abc123",
  "eventType": "user_login",
  "userId": "user_us",
  "rulesTriggered": [
    {
      "ruleId": "rule_1",
      "ruleName": "Login Trigger",
      "action": "send_message"
    }
  ]
}
```

---

### Evaluate Rules for a Message
Check which rules apply to a specific message.

**Endpoint:** `POST /sandbox/evaluate-rules/:messageId`

**Method:** POST

**Parameters:**
- `messageId` (URL parameter, required): ID of the message

**Body:** None (empty)

**Response:**
```json
{
  "messageId": "msg_abc123",
  "applicableRules": [
    {
      "ruleId": "rule_1",
      "name": "Login Trigger",
      "applies": true
    }
  ]
}
```

---

## Orchestration

### Orchestrate (Execute Decisions)
Execute all pending decisions for a user.

**Endpoint:** `POST /sandbox/orchestrate/:userId`

**Method:** POST

**Parameters:**
- `userId` (URL parameter, required): ID of the user (e.g., "user_us")

**Body:** None (empty)

**Response:**
```json
{
  "userId": "user_us",
  "executed": 1,
  "actions": [
    {
      "decisionId": "decision_123",
      "type": "send_message",
      "reason": "User login detected",
      "executedAt": "2026-01-30T16:55:00.000Z"
    }
  ],
  "message": "Executed 1 decision(s)"
}
```

**Note:** If no decisions exist for the user, the orchestrator will execute 0 actions and return an empty actions array. This is expected behavior.

---

## Audit & Logs

### Audit Events Include

The audit system logs all behavioral intelligence activities:

- `signal_processed` → Signal received and normalized
- `decision_created` → Rules triggered and decision generated
- `decision_executed` → Decision executed into action
- `message_delivered` → Message delivered to receiver
- `message_read` → Message read by receiver
- `message_replied` → Receiver replied to message

---

### Get User Audit Logs
View all system activities and decision logs for a specific user.

**Endpoint:** `GET /sandbox/audit/:userId`

**Method:** GET

**Parameters:**
- `userId` (URL parameter, required): ID of the user (e.g., "user_us")

**Response:**
```json
[
  {
    "id": "audit_xyz",
    "type": "message_delivery",
    "userId": "user_us",
    "timestampUtc": "2026-01-30T16:55:00.000Z",
    "messageId": "msg_abc123",
    "status": "delivered"
  }
]
```

---

### Get All Audit Logs
Retrieve all system audit logs across all users.

**Endpoint:** `GET /sandbox/audit`

**Method:** GET

**Parameters:** None

**Response:**
```json
[
  {
    "id": "audit_xyz",
    "type": "message_delivery",
    "userId": "user_us",
    "timestampUtc": "2026-01-30T16:55:00.000Z",
    "messageId": "msg_abc123",
    "status": "delivered"
  },
  {
    "id": "audit_abc",
    "type": "message_read",
    "userId": "user_uk",
    "timestampUtc": "2026-01-30T17:30:00.000Z",
    "messageId": "msg_abc123"
  }
]
```

---

## Active Hours

### Get Active Hours for User
Check the active delivery window for a user (when messages can be sent).

**Endpoint:** `GET /sandbox/active-hours/:userId`

**Method:** GET

**Parameters:**
- `userId` (URL parameter, required): ID of the user (e.g., "user_us")

**Response:**
```json
{
  "sandbox": true,
  "userId": "user_us",
  "timezone": "America/New_York",
  "activeWindow": "09:00 - 17:00",
  "nowLocalTime": "14:30"
}
```

---

### Check If Message Can Be Delivered Now
Verify if a message can be delivered to a user right now based on their active hours.

**Endpoint:** `GET /sandbox/can-deliver/:userId`

**Method:** GET

**Parameters:**
- `userId` (URL parameter, required): ID of the user (e.g., "user_us")

**Response:**
```json
{
  "sandbox": true,
  "userId": "user_us",
  "canDeliver": true,
  "reason": null
}
```

Or if outside active hours:
```json
{
  "sandbox": true,
  "userId": "user_us",
  "canDeliver": false,
  "reason": "Outside active hours"
}
```

---

### Get Next Allowed Delivery Time
Find out when the next available time is to deliver a message to a user.

**Endpoint:** `GET /sandbox/next-allowed-delivery/:userId`

**Method:** GET

**Parameters:**
- `userId` (URL parameter, required): ID of the user (e.g., "user_us")

**Response:**
```json
{
  "userId": "user_us",
  "nextDeliveryUtc": "2026-01-31T14:00:00.000Z",
  "localTime": "09:00",
  "isDelayed": true
}
```

---

## Actions Management

### Get Pending Actions for User
Retrieve all pending actions that need to be executed for a user.

**Endpoint:** `GET /sandbox/users/:userId/actions`

**Method:** GET

**Parameters:**
- `userId` (URL parameter, required): ID of the user (e.g., "user_us")

**Response:**
```json
{
  "userId": "user_us",
  "actionCount": 2,
  "actions": [
    {
      "actionId": "act_123",
      "actionType": "send_message",
      "status": "pending",
      "scheduledAt": "2026-01-30T16:55:00.000Z"
    }
  ],
  "message": "2 pending actions"
}
```

---

### Execute Pending Actions for User
Execute all pending actions for a user and separate them into executed and delayed.

**Endpoint:** `POST /sandbox/users/:userId/execute`

**Method:** POST

**Parameters:**
- `userId` (URL parameter, required): ID of the user (e.g., "user_us")

**Body:** None (empty)

**Response:**
```json
{
  "userId": "user_us",
  "executed": 1,
  "delayed": 1,
  "actions": {
    "executed": [
      {
        "actionId": "act_123",
        "actionType": "send_message",
        "executedAt": "2026-01-30T16:55:00.000Z",
        "status": "executed"
      }
    ],
    "delayed": [
      {
        "actionId": "act_124",
        "actionType": "send_notification",
        "scheduledAt": "2026-01-31T10:00:00.000Z",
        "waitTime": 86400000
      }
    ]
  },
  "message": "Executed 1 actions, 1 delayed"
}
```

---

### Trigger Event
Trigger a signal event that will create decisions and actions.

**Endpoint:** `POST /sandbox/events`

**Method:** POST

**Body:**
```json
{
  "userId": "user_us",
  "eventType": "user_login",
  "metadata": {}
}
```

**Parameters:**
- `userId` (string, required): ID of the user
- `eventType` (string, required): Type of event (e.g., "user_login", "user_click")
- `metadata` (object, optional): Additional event data

**Response:**
```json
{
  "status": "ok",
  "eventId": "evt_123",
  "eventType": "user_login",
  "userId": "user_us",
  "rulesTriggered": 2,
  "decisionsCreated": 2,
  "message": "Event triggered, 2 rule(s) triggered, 2 decision(s) created"
}
```

---

## Summary

| Endpoint | Method | Category | Purpose |
|----------|--------|----------|---------|
| `/users` | GET | Users | Get all sandbox users |
| `/signals/catalog` | GET | Signals | View available signal types |
| `/signals` | POST | Signals | Record a signal event |
| `/send-message` | POST | Messages | Send message immediately |
| `/schedule` | POST | Messages | Schedule a message |
| `/messages/sent/:senderId` | GET | Messages | Get sent messages |
| `/messages/received/:receiverId` | GET | Messages | Get received messages |
| `/messages/deliver` | POST | Messages | Deliver via delivery service |
| `/message-state/:messageId` | GET | Message State | Get message state |
| `/message/:messageId/mark-delivered` | POST | Message State | Mark as delivered |
| `/message/:messageId/mark-read` | POST | Message State | Mark as read |
| `/message/:messageId/mark-replied` | POST | Message State | Mark as replied |
| `/rules` | GET | Rules | Get all rules |
| `/decisions/:userId` | GET | Decisions | Get user decisions |
| `/events/process` | POST | Events | Process event |
| `/evaluate-rules/:messageId` | POST | Rules | Evaluate rules |
| `/orchestrate/:userId` | POST | Orchestration | Execute decisions |
| `/audit/:userId` | GET | Audit | Get user audit logs |
| `/audit` | GET | Audit | Get all audit logs |
| `/active-hours/:userId` | GET | Active Hours | Get active hours |
| `/can-deliver/:userId` | GET | Active Hours | Check delivery eligibility |
| `/next-allowed-delivery/:userId` | GET | Active Hours | Get next delivery time |
| `/users/:userId/actions` | GET | Actions | Get pending actions |
| `/users/:userId/execute` | POST | Actions | Execute pending actions |
| `/events` | POST | Events | Trigger event |

---

## Authentication

All endpoints require an API key in the request header:

```
Authorization: Bearer YOUR_API_KEY
```

## Notes

- All timestamps are in ISO 8601 format
- User IDs are case-sensitive
- Message IDs are auto-generated as `msg_*`
- Timezone values must be valid IANA timezone identifiers (e.g., "America/New_York", "Europe/London")
