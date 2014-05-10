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

  grunt.initConfig({
    config: {
      src: 'src',
      dist: 'build'
    },
    watch: {
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
    
    wintersmith: {
      build: {}
    },
    
    markdownpdf: {
      options: {
        expand: true
      },
      files: {
        src: "resume.md",
        dest: "<%= config.dist %>/about_me/resumes"
      }
    },
    
    clean: ['<%= config.dist %>/**'],
    
    copy: {
      //       copy over all website first to avoid 404
      archive: {
        expand: true,
        cwd: 'archive_dist',
        src: ['assets/**','blog/**', 'about_me/resumes/resume.html', 'about_me.html'],
        dest: '<%= config.dist %>/',
      },
      assets: {
        expand: true,
        cwd: '<%= config.src %>/assets',
        src: '**',
        dest: '<%= config.dist %>/assets',
      },
      docs: {
        expand: true,
        cwd: '.',
        src: ['AUTHORS', 'CHANGELONG', 'LICENSE_MIT', 'readme.md'],
        dest: '<%= config.dist %>',
      },
    },

    shell: {        
      delete_master: {
        command: 'git branch -D master'
      },
      checkout_master: {
        command: 'git checkout -b master'
      },
      filter: {
        command: 'git filter-branch --subdirectory-filter build/ -f'
      },
      go_back_one_branch: {
        command: 'git checkout -'
      },
      push: {
        command: 'git push -f origin master'
      }
    }  
});

  grunt.loadNpmTasks('grunt-wintersmith');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-markdown-pdf');
  grunt.loadNpmTasks('grunt-github-pages');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('ship_it', ['shell:delete_master', 'shell:checkout_master', 'shell:filter', 'shell:go_back_one_branch', 'shell:push']);
  
  grunt.registerTask('server', [
    'clean',
    'copy',
    'wintersmith',
    'markdownpdf',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('build', [
    'clean',
    'copy',
    'wintersmith',
    'markdownpdf'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);

};
