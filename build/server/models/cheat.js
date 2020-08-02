"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cheat = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _mongoosePaginateV = _interopRequireDefault(require("mongoose-paginate-v2"));

require("./users");

var tagList = ["대리작", "파티", "사칭", "캐시", "물통", "계정", "기타"];

var checkTag = function checkTag(tag) {
  var result = tagList.indexOf(tag);
  return result !== -1;
};

var moneyType = ["메소", "원"];

var checkMoneyType = function checkMoneyType(type) {
  var result = moneyType.indexOf(type);
  return result !== -1;
};

var bankList = ["KB국민은행", "우리은행", "신한은행", "하나은행", "카카오뱅크", "케이뱅크", "SC제일은행", "한국씨티은행", "BNK부산은행", "BNK경남은행", "광주은행", "DBG대구은행", "전북은행", "제주은행", "농협", "수협", "신협", "산림조합", "상호저축은행", "새마을금고", "기타"];

var checkBankType = function checkBankType(type) {
  var result = bankList.indexOf(type);
  return result !== -1;
};

var cheatSchema = new _mongoose["default"].Schema({
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
        return checkTag(v);
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
      }
    }
  },
  date: {
    type: Date,
    unique: false,
    required: true
  },
  createdDate: {
    type: Date,
    unique: false,
    required: false,
    "default": new Date()
  },
  subCharacter: {
    type: String,
    unique: false,
    required: true
  },
  mainCharacter: {
    type: String,
    unique: false,
    required: false
  },
  server: {
    type: String,
    unique: false,
    required: true
  },
  guild: {
    type: String,
    unique: false,
    required: true
  },
  farm: {
    type: String,
    unique: false,
    required: false
  },
  money: {
    type: Number,
    unique: false,
    required: true
  },
  money_type: {
    type: String,
    unique: false,
    required: true,
    validate: {
      validator: function validator(v) {
        return checkMoneyType(v);
      }
    }
  },
  phone: {
    type: String,
    unique: false,
    required: false,
    validate: {
      validator: function validator(v) {
        if (Boolean(Number(v)) || v == null) {
          return true;
        } else {
          return false;
        }
      }
    }
  },
  account_type: {
    type: String,
    unique: false,
    required: false,
    validate: {
      validator: function validator(v) {
        if (v == null) {
          return true;
        } else {
          return checkBankType(v);
        }
      }
    }
  },
  account: {
    type: String,
    unique: false,
    required: false,
    validate: {
      validator: function validator(v) {
        if (v == null) {
          return true;
        } else {
          if (v.length < 10) {
            return false;
          } else if (Boolean(Number(v))) {
            return true;
          } else {
            return false;
          }
        }
      }
    }
  },
  content: {
    type: String,
    unique: false,
    required: true
  },
  files: [{
    type: String,
    unique: false,
    required: false
  }]
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});
cheatSchema.virtual("writer", {
  ref: "User",
  localField: "writerEmail",
  foreignField: "email",
  justOne: true
});
cheatSchema.plugin(_mongoosePaginateV["default"]);

var Cheat = _mongoose["default"].model("Cheat", cheatSchema);

exports.Cheat = Cheat;