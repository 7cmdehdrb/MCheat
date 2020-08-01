"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Report = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _mongoosePaginateV = _interopRequireDefault(require("mongoose-paginate-v2"));

require("./users");

var reportSchema = new _mongoose["default"].Schema({
  writerEmail: {
    type: String,
    unique: false,
    required: true
  },
  id: {
    type: String,
    unique: false,
    required: true
  },
  url: {
    type: String,
    unique: false,
    required: true
  },
  title: {
    type: String,
    unique: false,
    required: true
  },
  content: {
    type: String,
    unique: false,
    required: true
  },
  date: {
    type: Date,
    unique: false,
    required: false,
    "default": new Date()
  },
  catagory: [{
    type: String,
    unique: false,
    required: true
  }],
  is_finished: {
    type: Boolean,
    unique: false,
    required: true,
    "default": false
  }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});
reportSchema.virtual("writer", {
  ref: "User",
  localField: "writerEmail",
  foreignField: "email",
  justOne: true
});
reportSchema.plugin(_mongoosePaginateV["default"]);

var Report = _mongoose["default"].model("Report", reportSchema);

exports.Report = Report;