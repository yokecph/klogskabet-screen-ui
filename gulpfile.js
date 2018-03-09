'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('gulp-browserify');

// Compile src/sass to public/css
gulp.task('sass', function () {
  return gulp.src('./src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

// watch and compile sass
gulp.task('sass:watch', function () {
  gulp.watch('./src/sass/**/*.scss', ['sass']);
});

// Compile src/js to public/js
gulp.task('js', function() {
    // Single entry point to browserify
    gulp.src(['src/js/**/*.js', '!./src/js/common/*.js'])
        .pipe(browserify({
          insertGlobals: false,
          paths: ['./node_modules/', 'src/js/']
        }))
        .pipe(gulp.dest('./public/js'));
});

// watch and compile js
gulp.task('js:watch', function () {
  gulp.watch('./src/js/**/*.js', ['js']);
});

// compile js and sass
gulp.task('build', ['js', 'sass']);

// compile and watch js and sass
gulp.task('watch', ['js', 'js:watch', 'sass', 'sass:watch']);
