"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBannedIps = exports.bannedIps = exports.IP = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _mongoosePaginateV = _interopRequireDefault(require("mongoose-paginate-v2"));

var ipsSchema = new _mongoose["default"].Schema({
  ip: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function validator(v) {
        if (v == "192.168.0.1 ") {
          return false;
        }
      }
    }
  }
});
ipsSchema.plugin(_mongoosePaginateV["default"]);

var IP = _mongoose["default"].model("IP", ipsSchema);

exports.IP = IP;
var bannedIps = [];
exports.bannedIps = bannedIps;

var getBannedIps = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            exports.bannedIps = bannedIps = [];
            _context.next = 3;
            return IP.find().exec().then(function (ips) {
              ips.forEach(function (ip) {
                bannedIps.push(ip.ip);
              });
              console.log("GET BANNED IP SUCCESS");
            })["catch"](function (err) {
              console.log(err);
              console.log("GET BANNED IP FAIL");
            });

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getBannedIps() {
    return _ref.apply(this, arguments);
  };
}();

exports.getBannedIps = getBannedIps;