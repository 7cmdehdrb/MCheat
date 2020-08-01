"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var nick1 = document.querySelector(".js_nickname1");
var nick2 = document.querySelector(".js_nickname2");
var title = document.querySelector(".js_title");
var server = document.querySelector(".js_server");
var guild = document.querySelector(".js_guild");
var money = document.querySelector(".js_money");
var money_type = document.querySelector(".js_money_type");
var money_to_ko = document.querySelector(".js_money_ko");
var account = document.querySelector(".js_account");
var accout_type = document.querySelector(".js_account_type");
var phone_form = document.querySelector(".js_phone_form");
var phone = document.querySelector(".js_input_phone");
var account_form = document.querySelector(".js_bank_form");
var phone_info = document.querySelector(".js_info_phone");
var account_info = document.querySelector(".js_info_account");
var char_check = false;
var check_interval = true;

function numberToKorean() {
  var number = money.value;
  var inputNumber = number < 0 ? false : number;
  var unitWords = ["", "만", "억", "조", "경"];
  var splitUnit = 10000;
  var splitCount = unitWords.length;
  var resultArray = [];
  var resultString = "";

  for (var i = 0; i < splitCount; i++) {
    var unitResult = inputNumber % Math.pow(splitUnit, i + 1) / Math.pow(splitUnit, i);
    unitResult = Math.floor(unitResult);

    if (unitResult > 0) {
      resultArray[i] = unitResult;
    }
  }

  for (var i = 0; i < resultArray.length; i++) {
    if (!resultArray[i]) continue;
    resultString = String(resultArray[i]) + unitWords[i] + resultString;
  }

  money_to_ko.innerText = "".concat(resultString, " ").concat(money_type.value);
}

document.querySelector(".js_cheatForm").addEventListener("submit", function (ev) {
  var check = confirm("해당 유저를 등록하시겠습니까? 허위 신고는 경고 없이 계정이 정지될 수 있으며, 신고 내용은 삭제 및 변경할 수 없습니다");

  if (!check) {
    ev.preventDefault();
    return;
  }

  if (title.value.length > 30) {
    alert("제목은 최대 30자까지 작성 가능합니다");
    return;
  }

  if (phone.value != "") {
    if (Boolean(Number(phone.value.replace(/-/gi, "")))) {
      if (phone.value.replace(/-/gi, "").length != 11) {
        ev.preventDefault();
        alert("휴대폰 번호는 - 제외 11개의 숫자로 이루어져야 합니다");
        return;
      }
    } else {
      ev.preventDefault();
      alert("휴대폰 번호는 숫자와 -만 입력할 수 있습니다");
      return;
    }
  }

  if (accout_type.value != "NOBANK" && account.value < 11) {
    if (!Boolean(Number(account.value.replace(/-/gi, "")))) {
      ev.preventDefault();
      alert("올바른 계좌번호를 입력하거나, 은행 선택을 취소해주세요");
      return;
    }
  }

  if (accout_type.value == "NOBANK" && account.value != "") {
    ev.preventDefault();
    alert("금융사를 선택해주세요");
    return;
  }

  if (!char_check) {
    ev.preventDefault();
    alert("캐릭터 찾기로 조회 후에 사용해주세요");
    return;
  }
});

openPhone = function openPhone() {
  if (phone_form.style.display == "none") {
    phone_form.style.display = null;
    phone_info.innerText = "- 추가정보 취소 : 휴대폰 번호";
  } else {
    phone_form.style.display = "none";
    phone_info.innerText = "+ 추가정보 입력 : 휴대폰 번호";
  }
};

openAccout = function openAccout() {
  if (account_form.style.display == "none") {
    account_form.style.display = null;
    account_info.innerText = "- 추가정보 취소 : 계좌 번호";
  } else {
    account_form.style.display = "none";
    account_info.innerText = "+ 추가정보 입력 : 계좌 번호";
  }
};

nick1.addEventListener("click", function () {
  char_check = false;
  nick1.removeAttribute("readonly");
});
nick2.addEventListener("click", function () {
  char_check = false;
  nick2.removeAttribute("readonly");
});

checkNickname = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var data, sub, main;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(check_interval == false)) {
              _context.next = 3;
              break;
            }

            alert("잠시 후에 이용해주세요");
            return _context.abrupt("return");

          case 3:
            nick1.setAttribute("readonly", "readonly");
            nick2.setAttribute("readonly", "readonly");
            char_check = false;
            check_interval = false;
            server.value = "로딩중...";
            guild.value = "로딩중...";

            if (!(nick1.value == "")) {
              _context.next = 12;
              break;
            }

            alert("닉네임을 작성해주세요");
            return _context.abrupt("return");

          case 12:
            if (!(nick1.value != "" && nick2.value == "")) {
              _context.next = 20;
              break;
            }

            _context.next = 15;
            return fetch("/users/searchNickname?id=".concat(nick1.value)).then(function (Response) {
              return Response.json();
            })["catch"](function (err) {
              return console.log(err);
            });

          case 15:
            data = _context.sent;
            server.value = data.server;
            guild.value = data.guild;
            _context.next = 29;
            break;

          case 20:
            if (!(nick1.value != "" && nick2.value != "")) {
              _context.next = 29;
              break;
            }

            _context.next = 23;
            return fetch("/users/searchNickname?id=".concat(nick1.value)).then(function (Response) {
              return Response.json();
            })["catch"](function (err) {
              return console.log(err);
            });

          case 23:
            sub = _context.sent;
            _context.next = 26;
            return fetch("/users/searchNickname?id=".concat(nick2.value)).then(function (Response) {
              return Response.json();
            })["catch"](function (err) {
              return console.log(err);
            });

          case 26:
            main = _context.sent;

            if (sub.guild != "길드없음" && main.guild == "길드없음") {
              guild.value = sub.guild;
            } else {
              guild.value = main.guild;
            }

            server.value = sub.server;

          case 29:
            if (server.value != "캐릭터를 찾을 수 없습니다") {
              char_check = true;
              setInterval(function () {
                check_interval = true;
              }, 1000 * 10);
            } else {
              setInterval(function () {
                check_interval = true;
              }, 1000 * 1);
            }

            document.getElementById("inputTextarea").focus();

          case 31:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function checkNickname() {
    return _ref.apply(this, arguments);
  };
}();