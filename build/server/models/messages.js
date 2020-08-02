"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GroupMessage = exports.GroupMessageRoom = exports.InstantMessage = void 0;

var _mongoose = _interopRequireWildcard(require("mongoose"));

var _mongoosePaginateV = _interopRequireDefault(require("mongoose-paginate-v2"));

require("./users");

var instantMessageSchema = new _mongoose["default"].Schema({
  to: {
    type: String,
    unique: false,
    required: true
  },
  from: {
    type: String,
    unique: false,
    required: true
  },
  from_email: {
    type: String,
    unique: false,
    required: true
  },
  message: {
    type: String,
    unique: false,
    required: true,
    validate: {
      validator: function validator(v) {
        if (v.length > 50) {
          return false;
        }
      }
    }
  },
  time: {
    type: Date,
    unique: false,
    required: false,
    "default": new Date()
  }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});
instantMessageSchema.virtual("fromUser", {
  ref: "User",
  localField: "from_email",
  foreignField: "email",
  justOne: true
});

var InstantMessage = _mongoose["default"].model("InstantMessage", instantMessageSchema);

exports.InstantMessage = InstantMessage;
var groupMessageRoomSchema = new _mongoose["default"].Schema({
  name: {
    type: String,
    unique: false,
    required: true
  },
  password: {
    type: String,
    unique: false,
    required: true
  },
  introduce: {
    type: String,
    unique: false,
    required: true,
    validate: {
      validator: function validator(v) {
        return v.length <= 300;
      }
    }
  },
  masterEmail: {
    type: String,
    unique: false,
    required: true
  },
  roomMember: [{
    user: {
      type: String,
      unique: false,
      required: true
    }
  }],
  time: {
    type: Date,
    unique: false,
    required: false,
    "default": new Date()
  }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});
groupMessageRoomSchema.virtual("master", {
  ref: "User",
  localField: "masterEmail",
  foreignField: "email",
  justOne: true
});
groupMessageRoomSchema.virtual("member", {
  ref: "User",
  localField: "roomMember.user",
  foreignField: "email",
  justOne: true
});
groupMessageRoomSchema.plugin(_mongoosePaginateV["default"]);

var GroupMessageRoom = _mongoose["default"].model("GroupMessageRoom", groupMessageRoomSchema);

exports.GroupMessageRoom = GroupMessageRoom;
var groupMessageSchema = new _mongoose["default"].Schema({
  room: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: "GroupMessageRoom",
    required: true
  },
  from: {
    type: String,
    unique: false,
    required: true
  },
  from_email: {
    type: String,
    unique: false,
    required: true
  },
  message: {
    type: String,
    unique: false,
    required: true
  },
  time: {
    type: Date,
    unique: false,
    required: false,
    "default": new Date()
  }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});
groupMessageSchema.virtual("user", {
  ref: "User",
  localField: "from_email",
  foreignField: "email",
  justOne: true
});

var GroupMessage = _mongoose["default"].model("GroupMessage", groupMessageSchema);

exports.GroupMessage = GroupMessage;