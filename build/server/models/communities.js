"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Community = exports.Comment = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _mongoosePaginateV = _interopRequireDefault(require("mongoose-paginate-v2"));

require("./users");

var tagList = ["자유", "정보", "모임", "건의", "공지"];

var checkTagValid = function checkTagValid(tag) {
  var result = tagList.indexOf(tag);
  return result !== -1;
};

var commnetSchema = new _mongoose["default"].Schema({
  writerEmail: {
    type: String,
    unique: false,
    required: true
  },
  noticeId: {
    type: String,
    unique: false,
    required: true
  },
  content: {
    type: String,
    unique: false,
    required: true
  },
  time: {
    type: Date,
    unique: false,
    required: false,
    "default": new Date()
  },
  is_deleted: {
    type: Boolean,
    unique: false,
    required: false,
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
commnetSchema.virtual("writer", {
  ref: "User",
  localField: "writerEmail",
  foreignField: "email",
  justOne: true
});

var Comment = _mongoose["default"].model("Comment", commnetSchema);

exports.Comment = Comment;
var communitySchema = new _mongoose["default"].Schema({
  writerEmail: {
    type: String,
    unique: false,
    required: true
  },
  tag: {
    type: String,
    unique: false,
    required: true,
    validate: {
      validator: function validator(v) {
        return checkTagValid(v);
      },
      message: function message(props) {
        return "".concat(props.value, " is not valid tag name");
      }
    }
  },
  title: {
    type: String,
    unique: false,
    required: true,
    validate: {
      validator: function validator(v) {
        return v.length <= 30;
      },
      message: function message() {
        return "Title is too long";
      }
    }
  },
  content: {
    type: String,
    unique: false,
    required: true
  },
  file: {
    type: String,
    unique: false,
    required: false
  },
  time: {
    type: Date,
    unique: false,
    required: false,
    "default": new Date()
  },
  recommends: [{
    recommender: {
      type: String,
      unique: false,
      required: false
    },
    like: {
      type: Boolean,
      unique: false,
      required: false,
      "default": true
    }
  }]
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});
communitySchema.virtual("writer", {
  ref: "User",
  localField: "writerEmail",
  foreignField: "email",
  justOne: true
});
communitySchema.plugin(_mongoosePaginateV["default"]);

var Community = _mongoose["default"].model("Community", communitySchema);

exports.Community = Community;