"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.date_transfer = exports.account_transfer = exports.phone_transfer = exports.getPlaneString = exports.datetimeToString = exports.newDatetimeFormat = exports.sendResetMail = exports.sendMail = exports.createUUID = exports.hashFunction = exports.getGuild = exports.getTag = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _crypto = _interopRequireDefault(require("crypto"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _nodemailerSmtpTransport = _interopRequireDefault(require("nodemailer-smtp-transport"));

var _emails = require("./emails");

require("./env");

var axios = require("axios");

var cheerio = require("cheerio");

var getWorld = function getWorld(icon) {
  var url = "https://ssl.nx.com/s2/game/maplestory/renewal/common/world_icon/";
  var world;

  try {
    world = icon.replace(url, "").replace(".png", "").replace("icon_", "");
  } finally {
    switch (world) {
      case "2":
        return "리부트2";

      case "3":
        return "리부트";

      case "4":
        return "오로라";

      case "5":
        return "레드";

      case "6":
        return "이노시스";

      case "7":
        return "유니온";

      case "8":
        return "스카니아";

      case "9":
        return "루나";

      case "10":
        return "제니스";

      case "11":
        return "크로아";

      case "12":
        return "베라";

      case "13":
        return "엘리시움";

      case "14":
        return "아케인";

      case "15":
        return "노바";

      default:
        return "캐릭터를 찾을 수 없습니다";
    }
  }
};

var getTag = function getTag(tag) {
  switch (tag) {
    case "free":
      return "자유";

    case "info":
      return "정보";

    case "group":
      return "모임";

    case "request":
      return "건의";

    default:
      return null;
  }
};

exports.getTag = getTag;

var getGuild = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(nickname) {
    var result, encodedNickname;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            encodedNickname = encodeURI(nickname);
            _context.prev = 1;
            _context.next = 4;
            return axios.get("https://maplestory.nexon.com/Ranking/World/Total?c=".concat(encodedNickname)).then(function (html) {
              var $ = cheerio.load(html.data);
              var $bodyList = $("tr.search_com_chk").children("td");
              var guilds = [];
              var servers = [];
              $("tr.search_com_chk").find("img").each(function (i, elem) {
                servers.push(elem.attribs.src);
              });
              $bodyList.each(function (i, elem) {
                var children = elem.children;
                children.forEach(function (element) {
                  guilds.push(element.data);
                });
              });
              return {
                guild: guilds[13] !== undefined ? guilds[13] : "길드없음",
                server: getWorld(servers[5]),
                profile: servers[3]
              };
            })["catch"](function (err) {
              console.log("ERROR!" + err);
              return {
                guild: "캐릭터를 찾을 수 없습니다",
                server: "캐릭터를 찾을 수 없습니다"
              };
            });

          case 4:
            result = _context.sent;
            _context.next = 10;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](1);
            console.error(_context.t0);

          case 10:
            return _context.abrupt("return", result);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 7]]);
  }));

  return function getGuild(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.getGuild = getGuild;

var hashFunction = function hashFunction(password) {
  var encodedPw = _crypto["default"].createHash("sha512").update(password + process.env.HASH).digest("hex");

  return encodedPw;
};

exports.hashFunction = hashFunction;

function s4() {
  return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
}

function guid() {
  return s4() + s4() + s4() + s4() + s4();
}

var createUUID = function createUUID() {
  return guid();
};

exports.createUUID = createUUID;

var sendMail = function sendMail(address, secret) {
  var transporter = _nodemailer["default"].createTransport((0, _nodemailerSmtpTransport["default"])({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    }
  }));

  transporter.sendMail({
    from: process.env.EMAIL_ADDRESS,
    to: address,
    subject: "MCheat 이메일 인증",
    html: (0, _emails.emailVerification)(secret)
  }, function (err, info) {
    if (err) {
      console.log(err);
      return false;
    }

    console.log(info);
  });
};

exports.sendMail = sendMail;

var sendResetMail = function sendResetMail(address, secret) {
  var transporter = _nodemailer["default"].createTransport((0, _nodemailerSmtpTransport["default"])({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    }
  }));

  transporter.sendMail({
    from: process.env.EMAIL_ADDRESS,
    to: address,
    subject: "MCheat 비밀번호 초기화",
    html: (0, _emails.passwordReset)(secret)
  }, function (err, info) {
    if (err) {
      console.log(err);
      return false;
    }

    console.log(info);
  });
};

exports.sendResetMail = sendResetMail;

var newDatetimeFormat = function newDatetimeFormat() {
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1 < 10 ? "0" + today.getMonth() + 1 : today.getMonth() + 1;
  var date = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
  var hour = today.getHours() < 10 ? "0" + today.getHours() : today.getHours();
  var minute = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
  var second = today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds();
  return "".concat(year).concat(month).concat(date).concat(hour).concat(minute).concat(second);
};

exports.newDatetimeFormat = newDatetimeFormat;

var datetimeToString = function datetimeToString(date) {
  var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
  var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  return "".concat(month).concat(day);
};

exports.datetimeToString = datetimeToString;

var getPlaneString = function getPlaneString(str) {
  return str.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, "");
};

exports.getPlaneString = getPlaneString;

var phone_transfer = function phone_transfer(phone) {
  var phone_divide = phone.split("");
  var new_phone = "".concat(phone_divide[0]).concat(phone_divide[1]).concat(phone_divide[2], "-****-").concat(phone_divide[7]).concat(phone_divide[8]).concat(phone_divide[9]).concat(phone_divide[10]);
  return new_phone;
};

exports.phone_transfer = phone_transfer;

var account_transfer = function account_transfer(account) {
  var new_account = "";
  var account_divide = account.split("");

  for (var index = 0; index < account_divide.length; index++) {
    if (index >= account_divide.length - 5) {
      new_account += account_divide[index];
    } else if (index < 3) {
      new_account += account_divide[index];
    } else {
      new_account += "*";
    }
  }

  return new_account;
};

exports.account_transfer = account_transfer;

var date_transfer = function date_transfer(data) {
  var newDate = new Date(data);
  var year = newDate.getFullYear();
  var month = newDate.getMonth() + 1;

  if (month < 10) {
    month = "0" + month;
  }

  var date = newDate.getDate();

  if (date < 10) {
    date = "0" + date;
  }

  var newDateFormat = "".concat(year, "-").concat(month, "-").concat(date);
  return newDateFormat;
};

exports.date_transfer = date_transfer;