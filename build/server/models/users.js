"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.User = exports.userSchema = exports.Session = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _mongoosePaginateV = _interopRequireDefault(require("mongoose-paginate-v2"));

_mongoose["default"].set("useCreateIndex", true);

var sessionSchema = new _mongoose["default"].Schema({}, {
  collection: "sessions"
});

var Session = _mongoose["default"].model("Session", sessionSchema);

exports.Session = Session;
var userSchema = new _mongoose["default"].Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    unique: false,
    required: true
  },
  nickname: {
    type: String,
    unique: true,
    required: true
  },
  server: {
    type: String,
    unique: false,
    required: true
  },
  guild: {
    type: String,
    unique: false,
    required: false
  },
  farm: {
    type: String,
    unique: false,
    required: false,
    trim: true
  },
  profile: {
    type: String,
    unique: true,
    required: false
  },
  bio: {
    type: String,
    unique: false,
    required: false,
    "default": "",
    validate: {
      validator: function validator(v) {
        return v.length < 51;
      }
    }
  },
  email_secret: {
    type: String,
    unique: false,
    required: false
  },
  email_valid: {
    type: Boolean,
    unique: false,
    required: true,
    "default": false
  },
  is_admin: {
    type: Boolean,
    unique: false,
    required: true,
    "default": false
  },
  is_activated: {
    type: Boolean,
    unique: false,
    required: true,
    "default": true
  }
});
exports.userSchema = userSchema;
userSchema.plugin(_mongoosePaginateV["default"]);

var User = _mongoose["default"].model("User", userSchema);

exports.User = User;