const express = require('express');
const { BODY_LIMIT, HEADERS, HTTP, CODES } = require('./config');
const { parseCheckRequest, BadRequestError } = require('./request');
const { toWireResponse } = require('./wire');

function errorBody(code, message) {
  return { error: { code, message } };
}

function requireApiKey(req, res, next) {
  const key = req.get(HEADERS.API_KEY);
  if (typeof key !== 'string' || key.trim() === '') {
    res.status(HTTP.UNAUTHORIZED).json(errorBody(CODES.UNAUTHORIZED, 'x-flintai-api-key header is required'));
    return;
  }
  next();
}

function createApp({ wall, rooms, onCheck }) {
  const app = express();

  app.get('/health', (req, res) => {
    res.json({ ok: true });
  });

  app.post('/guardrails/check', requireApiKey, express.json({ limit: BODY_LIMIT }), (req, res) => {
    const started = process.hrtime.bigint();
    const { roomId, messages } = parseCheckRequest(req.get(HEADERS.ROOM), req.body);
    const result = wall.checkMessages({ roomId, messages });
    const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
    onCheck({
      time: new Date(),
      roomId,
      roomName: rooms.nameOf(roomId),
      roles: messages.map((message) => message.role),
      result: { ...result, sourceNames: result.sourceRooms.map(rooms.nameOf) },
      elapsedMs,
    });
    res.status(HTTP.OK).json(toWireResponse(result));
  });

  app.use((req, res) => {
    res.status(HTTP.NOT_FOUND).json(errorBody(CODES.NOT_FOUND, `${req.method} ${req.path} is not a RoomWall endpoint`));
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    if (error instanceof BadRequestError || error.type === 'entity.parse.failed' || error.type === 'entity.too.large') {
      res.status(HTTP.BAD_REQUEST).json(errorBody(CODES.BAD_REQUEST, error.message));
      return;
    }
    console.error('RoomWall internal error:', error);
    res.status(HTTP.INTERNAL_ERROR).json(errorBody(CODES.INTERNAL_ERROR, 'internal error'));
  });

  return app;
}

module.exports = { createApp };
