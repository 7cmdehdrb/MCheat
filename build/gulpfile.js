"use strict";

var gulp = require("gulp");

var css = function css() {
  var postCSS = require("gulp-postCSS");

  var sass = require("gulp-sass");

  var minify = require("gulp-csso");

  sass.compiler = require("node-sass");
  return gulp.src("assets/scss/styles.scss").pipe(sass().on("error", sass.logError)).pipe(postCSS([require("tailwindcss"), require("autoprefixer")])).pipe(minify()).pipe(gulp.dest("public/stylesheets"));
};

exports["default"] = css;