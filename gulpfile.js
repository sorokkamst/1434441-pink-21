const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify-es");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const sync = require("browser-sync").create();

// HTML

const html = () => {
  return gulp.src("source/*.html")
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest("build"))
}

// Scripts

const scripts = () => {
  return gulp.src("source/js/navigation.js")
  .pipe(uglify())
  .pipe(rename("navigation.min.js"))
  .pipe(gulp.dest("build/js"))
  .pipe(sync.stream());
}

exports.scripts = scripts;

// Styles

function styles() {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(gulp.dest("build/css"))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Images

const fonts = () => {
  return gulp.src("source/fonts/*.{woff2,woff}")
  .pipe(gulp.dest("build/fonts"))
}

exports.fonts = fonts;

// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
  .pipe(imagemin([
    imagemin.mozjpeg({progressive: true}),
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("build/img"))
}

exports.images = images;

//Webp

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("build/img"))
}

exports.createWebp = createWebp;

// Sprite

const sprite = () => {
  return gulp.src("source/img/*.svg")
  .pipe(svgstore())
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;

// Server

function server(done) {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

// Build

const build = gulp.parallel(
  styles,
  fonts,
  html,
  sprite,
  images,
  createWebp
)

exports.build = build;

exports.default = gulp.series(
  build, server, watcher
);
