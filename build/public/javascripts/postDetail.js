"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var commentForm = document.querySelector(".js_commentForm");
var commentInput = document.querySelector(".js_commentInput");
var likecnt = document.querySelector(".js_likecnt");

commentSubmit = function commentSubmit() {
  if (commentInput.value == "") {
    alert("댓글 내용을 작성해주세요");
  } else if (commentInput.value.length > 300) {
    alert("댓글작성은 최대 300자까지 가능합니다");
  } else {
    commentForm.submit();
  }
};

deleteComment = function deleteComment(id) {
  var msg = prompt("삭제된 댓글은 복구할 수 없습니다. 정말 지우시려면 <댓글을 삭제합니다.> 라고 입력해주세요");

  if (msg == "댓글을 삭제합니다.") {
    location.href = "/communities/deleteComment?id=".concat(id);
  } else {
    alert("문구가 일치하지 않습니다. 다시 입력해주세요");
  }
};

deletePost = function deletePost(id) {
  var msg = prompt("삭제된 게시글은 복구할 수 없습니다. 정말 지우시려면 <게시글을 삭제합니다.> 라고 입력해주세요");

  if (msg == "게시글을 삭제합니다.") {
    location.href = "/communities/deletePost?id=".concat(id);
  } else {
    alert("문구가 일치하지 않습니다. 다시 입력해주세요");
  }
};

likePost = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(id, like) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fetch("/communities/recommendPost?id=".concat(id, "&like=").concat(like)).then(function (Response) {
              return Response.json();
            }).then(function (json) {
              if (json.success == false) {
                alert("(비)추천에 실패하였습니다");
              } else {
                if (json.method == "pull") {
                  alert("취소하였습니다");
                } else {
                  if (like == "true") {
                    alert("추천했습니다");
                  } else {
                    alert("비추천했습니다");
                  }
                }

                location.reload();
              }
            })["catch"](function (err) {
              console.log(err);
            });

          case 2:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function likePost(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

changeDate = function changeDate() {
  var documentDate = document.querySelector(".js_datetime");
  var newDate = new Date(documentDate.innerText);
  var year = newDate.getFullYear() + "";
  var twoYear = year.split("");
  var month = newDate.getMonth() + 1;

  if (month < 10) {
    month = "0" + month;
  }

  var date = newDate.getDate();

  if (date < 10) {
    date = "0" + date;
  }

  var newDateFormat = "".concat(twoYear[2]).concat(twoYear[3]).concat(month).concat(date);
  documentDate.innerText = newDateFormat;
};

init = function init() {
  changeDate();
};

init();