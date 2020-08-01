"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rateLimitModule = exports.timeoutModule = exports.csrfProtection = void 0;

var _csurf = _interopRequireDefault(require("csurf"));

var _expressTimeoutHandler = _interopRequireDefault(require("express-timeout-handler"));

var _expressRateLimit = _interopRequireDefault(require("express-rate-limit"));

var csrfProtection = (0, _csurf["default"])({
  cookie: true
});
exports.csrfProtection = csrfProtection;

var timeoutModule = _expressTimeoutHandler["default"].handler({
  timeout: 3000,
  onTimeout: function onTimeout(req, res) {
    res.status(503).send("요청이 지연되고 있습니다. 이 오류가 계속되면 관리자에게 문의해주세요");
  },
  disable: ["write", "setHeaders", "send", "json", "end"]
});

exports.timeoutModule = timeoutModule;
var rateLimitModule = (0, _expressRateLimit["default"])({
  windowMs: 1 * 60 * 1000,
  // 1min
  max: 20 * 100
});
exports.rateLimitModule = rateLimitModule;