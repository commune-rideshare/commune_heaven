// Include gulp
const gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  autoprefixer = require('gulp-autoprefixer'),
  plumber = require('gulp-plumber'),
  cssnano = require('gulp-cssnano'),
  sass = require('gulp-sass'),
  notify = require('gulp-notify'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  changed = require('gulp-changed'),
  parker = require('gulp-parker'),
  // fontgen = require('gulp-fontgen'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  browserSync = require('browser-sync').create();

// Build javascript
gulp.task('scripts', function () {

  return browserify('./src/js/app.js', {
      debug: true
    })
    .bundle()
    .pipe(source('app.min.js'))
    .pipe(buffer())
//    .pipe(uglify())
    .pipe(gulp.dest('./'))
    .pipe(browserSync.stream());

});

// Handle styles
gulp.task('sass', function () {
  return gulp.src('src/style/style.scss')
    .pipe(changed('./'))
    .pipe(plumber({
      errorHandler: sassErrorAlert
    }))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(gulp.dest('./'))
    .pipe(browserSync.stream());
});

// Browser Sync
gulp.task('browser-sync', function () {
  browserSync.init({
    proxy: 'localhost:8888',
    open: false
  });
});

// Images
gulp.task('images', () => {
  return gulp.src('src/img/*')
    .pipe(changed('img'))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
        }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('img'));
});


// Watch for changes in files
gulp.task('watch', function () {

  // Watch .js files
  gulp.watch('src/js/*.js', ['scripts']);

  // Watch .html files
  gulp.watch('*.html', browserSync.reload);

  // Watch .scss files
  gulp.watch('src/style/**/*.scss', ['sass']);

  // Watch images
  gulp.watch('src/img/*', ['images']);

  // Watch fonts
});

// Analyze CSS
gulp.task('parker', function () {
  return gulp.src('./style.css')
    .pipe(parker());
});

// Default Task
gulp.task('default', ['scripts', 'sass', 'watch', 'browser-sync', 'images']);

function sassErrorAlert(error) {
  notify.onError({
    title: 'SCSS Error',
    message: error.message,
    sound: 'Submarine'
  })(error); //Error Notification
  console.log(error.toString()); //Prints Error to Console
  this.emit('end'); //End function
};

function handlebarsErrorAlert(error) {
  notify.onError({
    title: 'Handlebars Error',
    message: error.message,
    sound: 'Ping'
  })(error); //Error Notification
  console.log(error.toString()); //Prints Error to Console
  this.emit('end'); //End function
};

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: "Compile Error",
    message: "<%= error %>"
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}
