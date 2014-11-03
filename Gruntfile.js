module.exports = function(grunt) {

    grunt.initConfig({

        connect: {
            server: {
                options: {
                    port: 9001,
                    base: 'public'
                }
            }
        },

        sass: {
            options: {
                includePaths: [
                    'bower_components/foundation/scss',
                    'assets/type',
                    'bower_components/bourbon/dist',
                    'bower_components/neat/app/assets/stylesheets'
                ]
            },
            dist: {
                options: {
                    //outputStyle: 'compressed'
                },
                files: {
                    'public/css/app.css': 'scss/app.scss'
                }
            }
        },

        clean: [
            'public/'
        ],

        copy: {
            main: {
                files: [
                    // hoo boy this is some hacky shit
                    {
                        src: [
                            'node_modules/normalize.css/normalize.css'
                        ],
                        dest: 'scss/_normalize.scss'
                    },
                    {
                        src: [
                            'assets/**'
                        ],
                        dest: 'public/'
                    },
                    {
                        src: [
                            'app/app.js'
                        ],
                        dest: 'public/'
                    },
                    {
                        src: [
                            'node_modules/angular/*',
                            'node_modules/angular-animate/*',
                            'node_modules/angular-ui-router/release/*',
                            'node_modules/snapsvg/dist/snap.svg-min.js',
                            'node_modules/Swipe/swipe.js'
                        ],
                        dest: 'public/app/plugins/',
                        expand: true,
                        flatten: true,
                        filter: 'isFile'
                    }
                ]
            }
        },

        assemble: {
            options: {
                assets: 'assets',
                partials: ['app/includes/**/*.hbs', 'app/partials/**/*.md'],
                helpers: ['helpers/**/*.js'],
                data: ['app/content/*.{json,yml}']
            },
            site: {
                options: {
                    layout: ['app/index.hbs']
                },
                src: ['app/index.hbs'],
                dest: 'public/index.html'
            },
            partials: {
                src: ['app/partials/*.hbs'],
                dest: 'public/',
                flatten: true
            }
        },

        watch: {
            grunt: {
                files: [
                    'Gruntfile.js'
                ]
            },
            sass: {
                files: 'scss/**/*.scss',
                tasks: ['sass']
            },
            app: {
                files: 'app/**/*',
                tasks: ['copy','assemble']
            },
            options: {
                livereload: true
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('assemble');

    grunt.registerTask('server',['connect']);
    grunt.registerTask('default', ['server','clean','copy','sass','assemble','watch']);

};
