/*
 * Generated on 2014-04-05
 * generator-assemble v0.4.11
 * https://github.com/assemble/generator-assemble
 *
 * Copyright (c) 2014 Hariadi Hinta
 * Licensed under the MIT license.
 */

'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// '<%= config.src %>/templates/pages/{,*/}*.hbs'
// use this if you want to match all subfolders:
// '<%= config.src %>/templates/pages/**/*.hbs'

module.exports = function(grunt) {

  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({

    config: {
      src: 'src',
      dist: 'dist'
    },

    watch: {
      assemble: {
        files: ['<%= config.src %>/{content,data,templates}/{,*/}*.{md,hbs,yml}'],
        tasks: ['assemble']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.dist %>/{,*/}*.html',
          '<%= config.dist %>/assets/{,*/}*.css',
          '<%= config.dist %>/assets/{,*/}*.js',
          '<%= config.dist %>/assets/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    connect: {
      options: {
        port: 9000,
        livereload: 35729,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          open: true,
          base: [
            '<%= config.dist %>'
          ]
        }
      }
    },

    assemble: {
      options: {
        assets: '<%= config.dist %>/assets',
        layout: '<%= config.src %>/templates/layouts/default.hbs',
        data: '<%= config.src %>/data/*.{json,yml}',
        partials: '<%= config.src %>/templates/partials/*.hbs',
        plugins: ['assemble-contrib-anchors','assemble-contrib-permalinks','assemble-contrib-sitemap','assemble-contrib-toc'],
      },

      blog: {
        options: {
          layout: '<%= config.src %>/templates/layouts/blog-layout.hbs',
          permalinks: {
            structure: ':year/:month/:day/:basename:ext'
          }
        },
        expand: true,
        cwd: '<%= config.src %>/blog',
        src: '*.md',
        dest: '<%= config.dist %>/blog/'
      },

      pages: {
        flatten: false,
        expand: true,
        cwd: '<%= config.src %>/templates/pages',
        src: '**/*.hbs',
        dest: '<%= config.dist %>'
      }
    },

    markdownpdf: {
      options: {
        expand: true
      },
      files: {
        src: "<%= config.src %>/content/resume.md",
        dest: "dist/about_me/resumes"
      }
    },

    // Before generating any new files,
    // remove any previously-created files.
    clean: ['<%= config.dist %>/**'],


    // overlay: {
    //     archive: {
    //         src: ['archive/**/*'], // source file search path
    //         dest: 'dist',      // the destination folder
    //         options: {            // options can be omitted
    //             overwrite: true,  // overwrite existing files (default to false)
    //             base_path: 'archive'  // path segment to ignore in src (default is empty
    //                               // or the directories prior to '**' if found).
    //         }
    //     }
    // }

    copy: {
      archive: {
        expand: true,
        cwd: 'archive_dist',
        src: ['assets/**','blog/**', 'about_me/resumes/resume.html', 'about_me.html'],
        dest: 'dist/',
      },
      assets: {
        expand: true,
        cwd: '<%= config.src %>/assets',
        src: '**',
        dest: '<%= config.dist %>/assets',
      },
    }

  });

  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-markdown-pdf');

  grunt.registerTask('server', [
    'clean',
    'assemble',
    // 'markdownpdf',
    'copy',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('build', [
    'clean',
    'assemble',
    // 'markdownpdf',
    'copy',
  ]);

  grunt.registerTask('default', [
    'build'
  ]);

};
