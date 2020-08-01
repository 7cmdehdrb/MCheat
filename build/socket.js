"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _messages = require("./server/models/messages");

var _mongoSanitize = _interopRequireDefault(require("mongo-sanitize"));

module.exports = function (io) {
  io.on("connection", function (socket) {
    socket.on("event", function (data) {
      console.log(data);
      io.emit("event", data);
    });
    socket.on("instantMessage", /*#__PURE__*/function () {
      var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(data) {
        var to, from, from_email, message;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // 귓속말
                to = data.to, from = data.from, from_email = data.from_email, message = data.message;
                _context.next = 3;
                return _messages.InstantMessage.create({
                  to: (0, _mongoSanitize["default"])(to),
                  from: (0, _mongoSanitize["default"])(from),
                  from_email: (0, _mongoSanitize["default"])(from_email),
                  message: (0, _mongoSanitize["default"])(message)
                }).then(function (instant) {
                  if (instant == null) {
                    throw Error();
                  } else {
                    console.log("Socket - ".concat(from, " >> ").concat(to, " : ").concat(message));
                    io.emit("instantMessage", {
                      to: (0, _mongoSanitize["default"])(to),
                      from: (0, _mongoSanitize["default"])(from),
                      message: (0, _mongoSanitize["default"])(message)
                    });
                  }
                })["catch"](function (err) {
                  console.log(err);
                });

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    socket.on("joinGroup", /*#__PURE__*/function () {
      var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(data) {
        var room;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                // 그룹 참여
                room = data.room;
                console.log("Join Room : ".concat(room));
                socket.join(room);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }());
    socket.on("groupMessage", /*#__PURE__*/function () {
      var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(data) {
        var room, from, from_email, message;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // 그룹 체팅
                room = data.room, from = data.from, from_email = data.from_email, message = data.message;
                _context3.next = 3;
                return _messages.GroupMessage.create({
                  room: (0, _mongoSanitize["default"])(room),
                  from: (0, _mongoSanitize["default"])(from),
                  from_email: (0, _mongoSanitize["default"])(from_email),
                  message: (0, _mongoSanitize["default"])(message)
                }).then(function (newMessage) {
                  if (newMessage == null) {
                    throw Error();
                  } else {
                    console.log("Socket - ".concat(from, " >> ").concat(room, " : ").concat(message));
                    io.to(room).emit("groupMessage", {
                      room: (0, _mongoSanitize["default"])(room),
                      from: (0, _mongoSanitize["default"])(from),
                      from_email: (0, _mongoSanitize["default"])(from_email),
                      message: (0, _mongoSanitize["default"])(message)
                    });
                  }
                })["catch"](function (err) {
                  console.log(err);
                });

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      return function (_x3) {
        return _ref3.apply(this, arguments);
      };
    }());
  });
};