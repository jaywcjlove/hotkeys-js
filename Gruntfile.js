// 包装函数
module.exports = function(grunt) {
    // 任务配置,所有插件的配置信息
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //删除文件
        clean: {
            dist:['src/style.css']
        },
        stylus:{
            build: {
                options: {
                },
                files: [{
                    'src/style.css': [
                        'src/style.styl'
                    ]
                }]
            }
        },
        concat: {
            options: {
                banner: '/*!\n' +
                '* home page (https://github.com/jaywcjlove/hotkeys)\n' +
                '*/\n'
            },
            dist:{
                src: [
                    'node_modules/jslite/build/JSLite.min.js',
                    'node_modules/highlight.js/lib/highlight.js',
                    'src/hotkeys_main.js'
                ],
                dest: 'src/main.js'
            }
        },
        // watch插件的配置信息
        watch: {
            js: {
                files: ['src/*.styl','src/hotkeys_main.js'],
                tasks: ['default']
            }
        }
    });

    // 任务加载
    require('load-grunt-tasks')(grunt);


    // 告诉grunt当我们在终端中输入grunt时需要做些什么
    grunt.registerTask('default', ['clean','concat','stylus']);

};
