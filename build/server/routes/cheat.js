"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _cheat = require("../models/cheat");

var _mongoSanitize = _interopRequireDefault(require("mongo-sanitize"));

var _middleware = require("../../middleware");

var _utils = require("../../utils");

var _multer = require("../../multer");

var express = require("express");

var router = express.Router();
// 검색
router.get("/search", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
    var session, _req$query, search, page, totalPages, charQuery, byCharacter, phoneQuery, byPhone, accountQuery, byAccout;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            session = req.session;
            _req$query = req.query, search = _req$query.search, page = _req$query.page;

            if (!page) {
              page = 1;
            }

            if (search) {
              _context.next = 8;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "올바르지 않은 접근입니다");
            res.redirect("/");
            return _context.abrupt("return");

          case 8:
            search = (0, _utils.getPlaneString)(search);
            totalPages = 1;
            charQuery = {
              $or: [{
                subCharacter: {
                  $regex: ".*".concat((0, _mongoSanitize["default"])(search), ".*")
                }
              }, {
                mainCharacter: {
                  $regex: ".*".concat((0, _mongoSanitize["default"])(search), ".*")
                }
              }, {
                farm: {
                  $regex: ".*".concat((0, _mongoSanitize["default"])(search), ".*")
                }
              }]
            };
            _context.next = 13;
            return _cheat.Cheat.paginate(charQuery, {
              page: page || 1,
              limit: 50,
              select: "_id subCharacter mainCharacter farm writerEmail",
              sort: "-createdDate",
              populate: {
                path: "writer",
                model: "User",
                select: "_id nickname email"
              }
            }).then(function (characters) {
              characters.docs = characters.docs.filter(function (element) {
                return element.writer != null;
              });
              totalPages = characters.totalPages;
              return characters.docs;
            });

          case 13:
            byCharacter = _context.sent;
            phoneQuery = {
              phone: {
                $regex: ".*".concat((0, _mongoSanitize["default"])(search), ".*")
              }
            };
            _context.next = 17;
            return _cheat.Cheat.paginate(phoneQuery, {
              page: page || 1,
              limit: 50,
              select: "_id phone writerEmail",
              sort: "-createdDate",
              populate: {
                path: "writer",
                model: "User",
                select: "_id nickname email"
              }
            }).then(function (phones) {
              phones.docs = phones.docs.filter(function (element) {
                return element.writer != null;
              });

              if (phones.totalPages > totalPages) {
                totalPages = phones.totalPages;
              }

              return phones.docs;
            })["catch"](function (err) {
              console.log(err);
            });

          case 17:
            byPhone = _context.sent;
            byPhone.forEach(function (phone) {
              var temp = phone;
              temp.phone = (0, _utils.phone_transfer)(phone.phone);
            });
            accountQuery = {
              account: {
                $regex: ".*".concat((0, _mongoSanitize["default"])(search), ".*")
              }
            };
            _context.next = 22;
            return _cheat.Cheat.paginate(accountQuery, {
              page: page || 1,
              limit: 50,
              select: "_id account account_type writerEmail",
              sort: "-createdDate",
              populate: {
                path: "writer",
                model: "User",
                select: "_id nickname email"
              }
            }).then(function (accounts) {
              accounts.docs = accounts.docs.filter(function (element) {
                return element.writer != null;
              });

              if (accounts.totalPages > totalPages) {
                totalPages = accounts.totalPages;
              }

              return accounts.docs;
            })["catch"](function (err) {
              console.log(err);
            });

          case 22:
            byAccout = _context.sent;
            byAccout.forEach(function (account) {
              var temp = account;
              temp.account = (0, _utils.account_transfer)(account.account);
            });
            res.render("cheat/searchCheat", {
              session: session,
              character: byCharacter,
              account: byAccout,
              phone: byPhone,
              page: page,
              totalPages: totalPages
            });

          case 25:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}()); // 새 사기 등록

router.get("/newCheat", _middleware.csrfProtection, function (req, res, next) {
  var session = req.session;
  var csrfToken = req.csrfToken();

  if (!session.user) {
    res.redirect("/users/login");
    return;
  }

  res.render("cheat/newCheat", {
    session: session,
    csrfToken: csrfToken
  });
});
router.post("/newCheat", _multer.cheatUpload.array("images"), _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
    var session, _req$body, tag, date, title, money, money_type, nickname, main_nickname, server, guild, farm, content, phone, account_type, account, files, filenames;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            session = req.session;
            _req$body = req.body, tag = _req$body.tag, date = _req$body.date, title = _req$body.title, money = _req$body.money, money_type = _req$body.money_type, nickname = _req$body.nickname, main_nickname = _req$body.main_nickname, server = _req$body.server, guild = _req$body.guild, farm = _req$body.farm, content = _req$body.content, phone = _req$body.phone, account_type = _req$body.account_type, account = _req$body.account;
            files = req.files;
            filenames = [];
            files.forEach(function (element) {
              filenames.push(element.filename);
            });

            if (session.user) {
              _context2.next = 8;
              break;
            }

            res.redirect("/users/login");
            return _context2.abrupt("return");

          case 8:
            _context2.next = 10;
            return _cheat.Cheat.create({
              writerEmail: session.user.email,
              tag: (0, _mongoSanitize["default"])(tag),
              title: (0, _mongoSanitize["default"])(title),
              date: (0, _mongoSanitize["default"])(date),
              subCharacter: (0, _mongoSanitize["default"])(nickname),
              mainCharacter: Boolean(main_nickname) ? (0, _mongoSanitize["default"])(main_nickname) : null,
              server: (0, _mongoSanitize["default"])(server),
              guild: (0, _mongoSanitize["default"])(guild),
              farm: Boolean(farm) ? (0, _mongoSanitize["default"])(farm) : null,
              money: money,
              phone: Boolean(phone) ? (0, _mongoSanitize["default"])(phone.replace(/-/gi, "")) : null,
              account_type: account_type == "NOBANK" ? null : (0, _mongoSanitize["default"])(account_type),
              account: Boolean(account) ? (0, _mongoSanitize["default"])(account.replace(/-/gi, "")) : null,
              money_type: (0, _mongoSanitize["default"])(money_type),
              content: (0, _mongoSanitize["default"])(content),
              files: filenames
            }).then(function (newCheat) {
              if (newCheat == null) {
                throw Error();
              }

              res.redirect("/cheat/detail?id=".concat(newCheat._id)); // 목록으로 리다이렉트
            })["catch"](function (err) {
              console.log(err);
              req.flash("show", "true");
              req.flash("message", "등록에 실패하였습니다");
              res.redirect("/");
            });

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}()); // 사기 내용 디테일

router.get("/detail", _middleware.csrfProtection, /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var session, id, csrfToken, cheatDetail;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            session = req.session;
            id = req.query.id;
            csrfToken = req.csrfToken();
            _context3.next = 5;
            return _cheat.Cheat.findOne({
              _id: (0, _mongoSanitize["default"])(id)
            }).populate("writer", "\n            email\n            nickname\n        ").exec()["catch"](function (err) {
              console.log(err);
            });

          case 5:
            cheatDetail = _context3.sent;

            if (!(cheatDetail == null)) {
              _context3.next = 13;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "정보를 불러올 수 없습니다");
            res.redirect("/");
            return _context3.abrupt("return");

          case 13:
            if (!(cheatDetail.writer == null)) {
              _context3.next = 18;
              break;
            }

            req.flash("show", "true");
            req.flash("message", "삭제된 유저입니다");
            res.redirect("/");
            return _context3.abrupt("return");

          case 18:
            if (cheatDetail.account) {
              cheatDetail.account = (0, _utils.account_transfer)(cheatDetail.account);
            }

            if (cheatDetail.phone) {
              cheatDetail.phone = (0, _utils.phone_transfer)(cheatDetail.phone);
            }

            res.render("cheat/detail", {
              session: session,
              detail: cheatDetail,
              id: id,
              csrfToken: csrfToken
            });

          case 21:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}());
module.exports = router; // 사기 리스트
// router.get("/cheatList", async (req, res, next) => {
//     const { session } = req;
//     const { page } = req.query;
//     const show = req.flash("show");
//     const message = req.flash("message");
//     const query = {};
//     await Cheat.paginate(query, {
//         select: `
//             writerEmail
//             tag
//             title
//             subCharacter
//             mainCharacter
//             server
//             date
//             `,
//         page: page || 1,
//         limit: 20,
//         sort: "-createdDate",
//         populate: {
//             path: "writer",
//             select: `
//             _id
//             email
//             nickname
//             server
//             `,
//             model: "User",
//         },
//     })
//         .then((cheats) => {
//             cheats.docs = cheats.docs.filter((element) => element.writer != null);
//             if (page > cheats.totalPages) {
//                 res.redirect(`/?page=${cheats.totalPages}`);
//             } else {
//                 res.render("", { session: session, cheats: cheats, show: show, message: message });
//             }
//         })
//         .catch((err) => {
//             console.log(err);
//             req.flash("show", "true");
//             req.flash("message", "목록을 불러오는데 실패했습니다");
//             res.redirect("/");
//         });
// });