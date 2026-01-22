/**
 * Demo API Service
 * This service acts as the interface between the UI and the backend
 * Currently calls real API endpoints on the NestJS backend
 */

/**
 * Run a demo scenario by calling the real backend
 */
export async function runDemoScenario(scenario) {
  const endpoints = {
    'dual-time': '/api/demo/dual-time',
    'behavior-reminder': '/api/demo/behavior-reminder',
    'fintech-login': '/api/demo/fintech-login',
    'active-hours': '/api/demo/active-hours'
  };

  const endpoint = endpoints[scenario];
  if (!endpoint) {
    throw new Error(`Unknown scenario: ${scenario}`);
  }

  try {
    const res = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const response = await res.json();
    return response;
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
}

export function transformToTimeline(scenario, data) {
  const events = [];

  switch (scenario) {
    case 'dual-time':
      events.push(
        { relativeTime: 'T+0s', message: `Sender (${data.sender.timezone}) initiated message`, type: 'info' },
        { relativeTime: 'T+0s', message: `Resolved sender local time: ${data.sender.localTime}`, type: 'info' },
        { relativeTime: 'T+0s', message: `Resolved receiver timezone: ${data.receiver.timezone}`, type: 'rule' },
        { relativeTime: 'T+0s', message: `Receiver local time: ${data.receiver.localTime}`, type: 'info' },
        { relativeTime: 'T+0s', message: `Message ${data.status}`, type: 'action' }
      );
      break;

    case 'behavior-reminder':
      events.push(
        { relativeTime: 'T+0s', message: 'Message sent and delivered', type: 'action' },
        { relativeTime: 'T+10m', message: 'No reply detected', type: 'warning' },
        { relativeTime: 'T+10m', message: `Rule triggered: ${data.rule}`, type: 'rule' },
        { relativeTime: 'T+10m', message: `Action queued: ${data.action}`, type: 'action' },
        { relativeTime: 'T+10m', message: `Action ${data.status}`, type: 'action' }
      );
      break;

    case 'fintech-login':
      events.push(
        { relativeTime: 'T+0s', message: 'User login event detected', type: 'info' },
        { relativeTime: 'T+0s', message: `Action 1: ${data.actions[0].message}`, type: 'action' },
        { relativeTime: 'T+5s', message: `Action 2: ${data.actions[1].message}`, type: 'action' },
        { relativeTime: 'T+5s', message: 'All actions executed', type: 'action' }
      );
      break;

    case 'active-hours':
      events.push(
        { relativeTime: 'T+0s', message: `Message sent at ${data.sentAt}`, type: 'info' },
        { relativeTime: 'T+0s', message: `Receiver timezone: ${data.receiverTimezone}`, type: 'info' },
        { relativeTime: 'T+0s', message: `Active hours: ${data.deliveryWindow}`, type: 'rule' },
        { relativeTime: 'T+0s', message: `Status: ${data.status}`, type: 'warning' },
        { relativeTime: 'T+0s', message: `Scheduled for: ${data.scheduledFor}`, type: 'action' }
      );
      break;

    default:
      break;
  }

  return events;
}

export function extractMetadata(scenario, data) {
  switch (scenario) {
    case 'dual-time':
      return {
        utcTime: data.utcTime,
        senderLocal: data.sender.localTime,
        receiverLocal: data.receiver.localTime,
        rule: 'timezone_intelligence',
        action: 'message_resolved',
        status: data.status
      };

    case 'behavior-reminder':
      return {
        utcTime: data.triggeredAt,
        senderLocal: 'N/A',
        receiverLocal: 'N/A',
        rule: data.rule,
        action: data.action,
        status: data.status
      };

    case 'fintech-login':
      return {
        utcTime: new Date().toISOString(),
        senderLocal: 'N/A',
        receiverLocal: 'N/A',
        rule: 'login_event',
        action: `${data.actions.length} actions executed`,
        status: 'executed'
      };

    case 'active-hours':
      return {
        utcTime: data.sentAt,
        senderLocal: 'N/A',
        receiverLocal: data.receiverTimezone,
        rule: 'active_hours_check',
        action: 'delivery_delayed',
        status: data.status
      };

    default:
      return {
        utcTime: '',
        senderLocal: '',
        receiverLocal: '',
        rule: '',
        action: '',
        status: ''
      };
  }
}
