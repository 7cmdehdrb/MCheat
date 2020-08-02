"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _mongoSanitize = _interopRequireDefault(require("mongo-sanitize"));

var _communities = require("../models/communities");

var _utils = require("../../utils");

var _multer = require("../../multer");

var _middleware = require("../../middleware");

var express = require("express");

var router = express.Router();
router.get("/", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            res.redirect("/");

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}()); // 목록

router.get("/list", /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var session, _req$query, page, tag, key, value, show, message, query, communities, alerts;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            session = req.session;
            _req$query = req.query, page = _req$query.page, tag = _req$query.tag, key = _req$query.key, value = _req$query.value;
            show = req.flash("show");
            message = req.flash("message");
            query = {
              tag: {
                $ne: "공지"
              }
            };

            if (tag) {
              // 태그 조건
              query = {
                tag: (0, _utils.getTag)(tag)
              };
            } else {
              // 검색 조건
              if (key == "title") {
                query = {
                  $and: [{
                    tag: {
                      $ne: "공지"
                    }
                  }, {
                    title: {
                      $regex: ".*".concat((0, _mongoSanitize["default"])(value), ".*")
                    }
                  }]
                };
              }
            } // 검색


            _context2.next = 8;
            return _communities.Community.paginate(query, {
              select: "_id writerEmail tag title time recommends",
              page: page || 1,
              limit: 15,
              sort: {
                time: "desc"
              },
              populate: {
                path: "writer",
                select: "\n                email\n                nickname\n                server\n                ",
                model: "User"
              }
            }, {}).then(function (communities) {
              communities.docs = communities.docs.filter(function (element) {
                var idx = 0;
                element.recommends.forEach(function (element) {
                  if (element.like == false) {
                    idx++;
                  }
                });
                element.recommends = element.recommends.filter(function (element) {
                  return element.like == true;
                });
                return element.writer != null && idx < 20;
              });

              if (key == "nickname") {
                communities.docs = communities.docs.filter(function (element) {
                  return element.writer.nickname.includes((0, _mongoSanitize["default"])(value));
                });
              } else if (key == "email") {
                communities.docs = communities.docs.filter(function (element) {
                  return element.writer.email.includes((0, _mongoSanitize["default"])(value));
                });
              }

              return communities;
            })["catch"](function (err) {
              console.log(err);
            });

          case 8:
            communities = _context2.sent;
            _context2.next = 11;
            return _communities.Community.find({
              tag: {
                $eq: "공지"
              }
            }).select("_id writerEmail title time recommends").populate("writer", "\n            email\n            nickname\n            server\n            profile\n            bio\n            is_admin\n        ").limit(5).sort("-time").exec().then(function (alerts) {
              alerts = alerts.filter(function (element) {
                return element.writer != null;
              });
              return alerts;
            })["catch"](function (err) {
              console.log(err);
            });

          case 11:
            alerts = _context2.sent;

            if (page > communities.totalPages) {
              res.redirect("/communities/list?page=".concat(communities.totalPages));
            } else {
              res.render("community/list", {
                session: session,
                communities: communities,
                alerts: alerts,
                show: show,
                message: message
              });
            }

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}()); // 새 글쓰기

router.get("/new", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  res.render("community/new", {
    session: session,
    csrfToken: csrfToken
  });
});
router.post("/new", _multer.upload.single("inputFile"), _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var session, _req$body, tag, title, content, file, newContent;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            session = req.session;
            _req$body = req.body, tag = _req$body.tag, title = _req$body.title, content = _req$body.content;
            file = req.file;

            if (session.user) {
              _context3.next = 6;
              break;
            }

            res.redirect("/users/login");
            return _context3.abrupt("return");

          case 6:
            if (!(session.user.is_admin != true && tag == "공지")) {
              _context3.next = 11;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "관리자 전용 기능입니다");
            res.redirect("/");
            return _context3.abrupt("return");

          case 11:
            newContent = content.replace(/\r\n/g, "<br>").replace(/<script>/gi, "script");
            _context3.next = 14;
            return _communities.Community.create({
              writerEmail: session.user.email,
              tag: (0, _mongoSanitize["default"])(tag),
              title: (0, _mongoSanitize["default"])(title),
              content: (0, _mongoSanitize["default"])(newContent),
              file: Boolean(file) ? (0, _mongoSanitize["default"])(file.location) : null
            }).then(function (newCommunity) {
              if (newCommunity == null) {
                throw Error();
              }

              res.redirect("/communities/detail?id=".concat(newCommunity._id));
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생했습니다");
              res.redirect("/communities/list");
            });

          case 14:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}()); // 글보기

router.get("/detail", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var session, id, csrfToken, detail, like, dislike, more, comments;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            session = req.session;
            id = req.query.id;
            csrfToken = req.csrfToken();

            if (id) {
              _context4.next = 6;
              break;
            }

            res.redirect("/communities/list");
            return _context4.abrupt("return");

          case 6:
            _context4.next = 8;
            return _communities.Community.findOne({
              _id: (0, _mongoSanitize["default"])(id)
            }).select("\n        _id\n        writerEmail\n        tag\n        title\n        content\n        file\n        time\n        recommends\n    ").populate("writer", "\n        email\n        nickname\n        server\n        profile\n        bio\n        ").exec()["catch"](function (err) {
              console.log(err);
            });

          case 8:
            detail = _context4.sent;

            if (!(detail == null)) {
              _context4.next = 14;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
            return _context4.abrupt("return");

          case 14:
            like = detail.recommends.filter(function (element) {
              return element.like == true;
            });
            dislike = detail.recommends.filter(function (element) {
              return element.like == false;
            });
            _context4.next = 18;
            return _communities.Community.find({
              $and: [{
                writerEmail: detail.writer.email
              }, {
                tag: {
                  $ne: "공지"
                }
              }, {
                _id: {
                  $ne: detail._id
                }
              }]
            }).select("_id title time").sort("-time").limit(7).exec()["catch"](function (err) {
              console.log(err);
            });

          case 18:
            more = _context4.sent;
            _context4.next = 21;
            return _communities.Comment.find({
              noticeId: id
            }).populate("writer", "\n        email\n        nickname\n        server\n        profile\n        bio\n        ").sort("time").exec().then(function (comment) {
              comment = comment.filter(function (element) {
                return element.writer != null;
              });
              return comment;
            })["catch"](function (err) {
              console.log(err);
            });

          case 21:
            comments = _context4.sent;
            res.render("community/detail", {
              session: session,
              detail: detail,
              more: more,
              like: like,
              dislike: dislike,
              comments: comments,
              csrfToken: csrfToken
            });

          case 23:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}()); // 글 수정

router.get("/updatePost", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res, next) {
    var session, id, csrfToken;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            session = req.session;
            id = req.query.id;
            csrfToken = req.csrfToken();

            if (session.user) {
              _context5.next = 6;
              break;
            }

            res.redirect("/users/login");
            return _context5.abrupt("return");

          case 6:
            if (id) {
              _context5.next = 9;
              break;
            }

            res.redirect("/communities/list");
            return _context5.abrupt("return");

          case 9:
            _context5.next = 11;
            return _communities.Community.findOne({
              $and: [{
                _id: (0, _mongoSanitize["default"])(id)
              }, {
                writerEmail: (0, _mongoSanitize["default"])(session.user.email)
              }]
            }).then(function (targetPost) {
              var _res$render;

              if (targetPost == null) {
                throw Error();
              }

              res.render("community/updatePost", (_res$render = {
                session: session
              }, (0, _defineProperty2["default"])(_res$render, "session", session), (0, _defineProperty2["default"])(_res$render, "post", targetPost), (0, _defineProperty2["default"])(_res$render, "csrfToken", csrfToken), _res$render));
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생했습니다");
              res.redirect("/communities/list");
            });

          case 11:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x13, _x14, _x15) {
    return _ref5.apply(this, arguments);
  };
}());
router.post("/updatePost", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res, next) {
    var session, _req$body2, tag, title, content, id, newContent;

    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            session = req.session;
            _req$body2 = req.body, tag = _req$body2.tag, title = _req$body2.title, content = _req$body2.content, id = _req$body2.id;

            if (session.user) {
              _context6.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context6.abrupt("return");

          case 5:
            newContent = content.replace(/\r\n/g, "<br>").replace(/<script>/gi, "script");
            _context6.next = 8;
            return _communities.Community.updateOne({
              $and: [{
                writerEmail: session.user.email
              }, {
                _id: (0, _mongoSanitize["default"])(id)
              }]
            }, {
              $set: {
                tag: (0, _mongoSanitize["default"])(tag),
                title: (0, _mongoSanitize["default"])(title),
                content: (0, _mongoSanitize["default"])(newContent)
              }
            }).then(function (updatedPost) {
              if (updatedPost.nModified == 1) {
                res.redirect("/communities/detail?id=".concat(id));
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생했습니다");
              res.redirect("/communities/list");
            });

          case 8:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x16, _x17, _x18) {
    return _ref6.apply(this, arguments);
  };
}()); // 글 삭제

router.get("/deletePost", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var id = req.query.id;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  if (!id) {
    res.redirect("/communities/list");
    return;
  }

  res.render("community/deletePost", {
    id: id,
    csrfToken: csrfToken
  });
});
router.post("/deletePost", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var session, id;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            session = req.session;
            id = req.body.id;

            if (session.user) {
              _context7.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context7.abrupt("return");

          case 5:
            if (id) {
              _context7.next = 8;
              break;
            }

            res.redirect("/communities/list");
            return _context7.abrupt("return");

          case 8:
            _context7.next = 10;
            return _communities.Community.deleteOne({
              $and: [{
                writerEmail: (0, _mongoSanitize["default"])(session.user.email)
              }, {
                _id: (0, _mongoSanitize["default"])(id)
              }]
            }).then(function (deletedPost) {
              if (deletedPost.deletedCount == 1) {
                req.flash("show", "true");
                req.flash("message", "삭제를 완료하였습니다");
                res.redirect("/communities/list");
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생하였습니다");
              res.redirect("/communities/list");
            });

          case 10:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x19, _x20, _x21) {
    return _ref7.apply(this, arguments);
  };
}()); // 추천하기

router.get("/recommendPost", /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res, next) {
    var session, _req$query2, id, like, action, success, method, recommendPost;

    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            session = req.session;
            _req$query2 = req.query, id = _req$query2.id, like = _req$query2.like;
            success = false;
            method = null;

            if (!(!session.user || !id || !like)) {
              _context8.next = 7;
              break;
            }

            res.json({
              success: success,
              method: method
            });
            return _context8.abrupt("return");

          case 7:
            _context8.next = 9;
            return _communities.Community.findOne({
              $and: [{
                _id: (0, _mongoSanitize["default"])(id)
              }, {
                "recommends.recommender": session.user.email
              }]
            }).select("_id").exec()["catch"](function (err) {
              console.log(err);
            });

          case 9:
            recommendPost = _context8.sent;

            if (recommendPost == null) {
              // 지금까지 한 적 없음
              method = "push";
              action = {
                $push: {
                  recommends: {
                    recommender: session.user.email,
                    like: like == "true" ? true : false
                  }
                }
              };
            } else {
              // 한 적 있음
              method = "pull";
              action = {
                $pull: {
                  recommends: {
                    recommender: session.user.email
                  }
                }
              };
            }

            _context8.next = 13;
            return _communities.Community.updateOne({
              $and: [{
                _id: (0, _mongoSanitize["default"])(id)
              }]
            }, action).then(function (updatedPost) {
              if (updatedPost.nModified == 1) {
                res.json({
                  success: true,
                  method: method
                });
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              res.json({
                success: false,
                method: method
              });
            });

          case 13:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x22, _x23, _x24) {
    return _ref8.apply(this, arguments);
  };
}()); // 댓글쓰기

router.post("/newComment", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res, next) {
    var session, _req$body3, noticeId, content;

    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            session = req.session;
            _req$body3 = req.body, noticeId = _req$body3.noticeId, content = _req$body3.content;

            if (session.user) {
              _context9.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context9.abrupt("return");

          case 5:
            if (!(!noticeId || !content)) {
              _context9.next = 10;
              break;
            }

            req.flash("show", "true");
            req.flash("show", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
            return _context9.abrupt("return");

          case 10:
            _context9.next = 12;
            return _communities.Comment.create({
              writerEmail: session.user.email,
              noticeId: (0, _mongoSanitize["default"])(noticeId),
              content: (0, _mongoSanitize["default"])(content)
            }).then(function (newComment) {
              if (newComment === null) {
                throw Error();
              }

              res.redirect("/communities/detail?id=".concat(noticeId));
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("show", "알 수 없는 오류가 발생했습니다");
              res.redirect("/communities/list");
            });

          case 12:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function (_x25, _x26, _x27) {
    return _ref9.apply(this, arguments);
  };
}()); // 댓글 삭제(수정)

router.get("/deleteComment", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var id = req.query.id;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  if (!id) {
    res.redirect("/communities/list");
    return;
  }

  res.render("community/deleteComment", {
    id: id,
    csrfToken: csrfToken
  });
});
router.post("/deleteComment", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(req, res, next) {
    var session, id, comment;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            session = req.session;
            id = req.body.id;

            if (session.user) {
              _context10.next = 5;
              break;
            }

            res.redirect("/users/login");
            return _context10.abrupt("return");

          case 5:
            if (id) {
              _context10.next = 8;
              break;
            }

            res.redirect("/communities/list");
            return _context10.abrupt("return");

          case 8:
            _context10.next = 10;
            return _communities.Comment.findOne({
              _id: (0, _mongoSanitize["default"])(id)
            }).select("noticeId").exec()["catch"](function (err) {
              console.log(err);
            });

          case 10:
            comment = _context10.sent;

            if (!(comment == null)) {
              _context10.next = 16;
              break;
            }

            req.flash("show", "true");
            req.flash("show", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
            return _context10.abrupt("return");

          case 16:
            _context10.next = 18;
            return _communities.Comment.updateOne({
              $and: [{
                _id: (0, _mongoSanitize["default"])(id)
              }, {
                writerEmail: session.user.email
              }]
            }, {
              $set: {
                is_deleted: true
              }
            }).then(function (updatedComment) {
              if (updatedComment.nModified == 1) {
                res.redirect("/communities/detail?id=".concat(comment.noticeId));
              } else {
                throw Error();
              }
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "알 수 없는 오류가 발생했습니다");
              res.redirect("/communities/list");
            });

          case 18:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function (_x28, _x29, _x30) {
    return _ref10.apply(this, arguments);
  };
}());
module.exports = router;