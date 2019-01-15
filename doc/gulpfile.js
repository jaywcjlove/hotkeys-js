var gulp = require('gulp');
var watch = require('gulp-watch');
var stylus = require('gulp-stylus');
// var rename = require("gulp-rename");
var nib = require('nib');

gulp.task('default', function() {
  // 将你的默认的任务代码放在这
});

// 侦听文件改变执行任务
gulp.task('watch', function (cb) {
    gulp.watch('./src/style.styl', ['stylus']);
});

// RUI CSS 生成
gulp.task('stylus', function () {
    gulp.src('./src/style.styl')
        .pipe(stylus({
            compress:true,
            use: nib()
        }))
        // .pipe(rename('RUI.min.css'))
        .pipe(gulp.dest('./src/'));
});