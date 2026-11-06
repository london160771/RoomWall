const { ROLES } = require('./config');

const VALID_ROLES = new Set(Object.values(ROLES));

class BadRequestError extends Error {}

function isMessage(message) {
  return message !== null
    && typeof message === 'object'
    && VALID_ROLES.has(message.role)
    && typeof message.content === 'string';
}

function parseCheckRequest(roomId, body) {
  if (typeof roomId !== 'string' || roomId.trim() === '') {
    throw new BadRequestError('x-agent-session-id header (the room id) is required');
  }
  if (body === null || typeof body !== 'object' || !Array.isArray(body.messages) || body.messages.length === 0) {
    throw new BadRequestError('body must be {"messages":[{"role":"user"|"assistant","content":"..."}]}');
  }
  if (!body.messages.every(isMessage)) {
    throw new BadRequestError('each message needs role "user" or "assistant" and string content');
  }
  return { roomId: roomId.trim(), messages: body.messages.map(({ role, content }) => ({ role, content })) };
}

module.exports = { parseCheckRequest, BadRequestError };
