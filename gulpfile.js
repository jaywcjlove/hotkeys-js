var gulp = require('gulp');
var watch = require('gulp-watch');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var umd = require('gulp-umd')
var gutil = require('gulp-util');



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
        .pipe(gulp.dest('./dist/'));

})