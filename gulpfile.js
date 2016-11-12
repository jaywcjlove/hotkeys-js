var gulp = require('gulp');
var watch = require('gulp-watch');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var umd = require('gulp-umd')
var gutil = require('gulp-util');
var banner = require('gulp-banner');
var bannerjs = require('bannerjs');
var sourcemap = require('gulp-sourcemap');



gulp.task('default',["build","min"])


gulp.task('watch',function(){
    gulp.watch('./src/**/*',['default'])
})

gulp.task('build', function (cb) {

    gulp.src('src/hotkeys.js')
        .pipe(umd({
            exports: function(file) {
                return 'hotkeys';
            },
            namespace: function(file) {
                return 'hotkeys';
            }
        }))
        .pipe(banner(bannerjs.multibanner()))
        .pipe(gulp.dest('./dist/'));

})


gulp.task('min', function (cb) {
    
    gulp.src('dist/hotkeys.js')
        .pipe(uglify({
            mangle: false,
            output:{
                // comments:true
            }
        }))
        .pipe(rename({
            suffix:".min"
        }))
        .pipe(banner(bannerjs.onebanner()))
        .pipe(gulp.dest('./dist/'));

})

gulp.task('map', function (cb) {

    gulp.src('dist/hotkeys.js')
        .pipe(sourcemap({
            outSourceMap:'hotkeys.min.map',
            sourceRoot:"http://jslite.io",
            write:'./dist/'
        }))
        .pipe(gulp.dest('./dist/'));

})