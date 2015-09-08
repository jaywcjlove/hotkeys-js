module.exports = (grunt) ->
    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-contrib-jshint'
    grunt.loadNpmTasks 'grunt-dist'
    grunt.initConfig(
        pkg: grunt.file.readJSON 'package.json' 
        uglify:
            app_task: 
                options: 
                    beautify: false
                    mangle: true #不混淆变量名
                    compress:false #打开或关闭使用默认选项源压缩。
                files:
                    'build/hotkeys.min.js': [
                        'src/hotkeys.js'
                    ]
        jshint: 
            options:
                eqeqeq: true
                trailing: true 
            files: ['src/hotkeys.js']
        dist: 
            default_options: 
                files: 
                    "dist":['src/hotkeys.js']
        watch: 
            another: 
                files: ['src/*.js']
                tasks: ['jshint','uglify']
                options: 
                    livereload: 1244
    )
    grunt.registerTask 'default', ['watch']
