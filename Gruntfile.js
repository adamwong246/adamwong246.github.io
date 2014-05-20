'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// '<%= config.src %>/templates/pages/{,*/}*.hbs'
// use this if you want to match all subfolders:
// '<%= config.src %>/templates/pages/**/*.hbs'

module.exports = function(grunt) {
  require('time-grunt')(grunt);
  grunt.initConfig({
    
    config: {src: 'src', dist: 'build'},
    
    watch: {
      wintersmith: {
        files: ['./contents/**/*', './templates/**/*'],
        tasks: ['wintersmith'],
        options: {livereload: true}
      }
    },
    
    connect: {
      options: {port: 9000, livereload: 35729, hostname: 'localhost'},
      livereload: {options: {open: true, base: ['<%= config.dist %>']}}
    },
    
    assemble: {
      options: {
        layout: 'layouts/default.hbs',
        plugins: ['assemble-contrib-permalinks', 'plugins/**'],
      },

      blog: {
        options: {
          permalinks: {
            structure: ':basename/:index.html'
          }
        },
        expand:true,
        cwd: 'blog_posts/',
        dest: 'blog/',
        src: ['*.hbs']
      }
    },

    markdownpdf: {
      options: {expand: true},
      files: {src: "contents/about/resumes/resume.md", dest: "<%= config.dist %>/about/resumes/"}
    },
    
    clean: ['<%= config.dist %>/**'],
    
    copy: {
      // copy over old website first to avoid 404's
      archive: {
        expand: true, cwd: 'archive_dist', src: ['assets/**','blog/**', 'about/resumes/resume.html'], dest: '<%= config.dist %>/',
      },
      
      docs: {
        expand: true,
        cwd: '.',
        src: ['AUTHORS', 'CHANGELOG', 'LICENSE-MIT', 'readme.md'],
        dest: '<%= config.dist %>',
      },
      
      resume_as_markdown: {
        expand: true, cwd: './about/resumes/', src: 'resume.md', dest: './build/about/resumes/',
      }
    },
    shell: {        
      delete_master:      {command: 'git branch -D master'},
      checkout_master:    {command: 'git checkout -b master'},
      filter:             {command: 'git filter-branch --subdirectory-filter build/ -f'},
      go_back_one_branch: {command: 'git checkout -'},
      push:               {command: 'git push -f origin master'}
    }  
  });

  grunt.loadNpmTasks('assemble' );
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-markdown-pdf');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('ship_it', 
    ['shell:delete_master', 'shell:checkout_master', 'shell:filter', 'shell:go_back_one_branch', 'shell:push']
  );
  
  grunt.registerTask('server', 
    ['clean','copy','assemble','markdownpdf','connect:livereload','watch']
  );

  grunt.registerTask('build', 
    ['clean','copy','assemble','markdownpdf']
  );

  grunt.registerTask('default', 
    ['build']
  );

};
