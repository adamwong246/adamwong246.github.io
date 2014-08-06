module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      main: {
        files: [
          {expand: true, src: ['index.html', 'resumes/**'], dest: '../'},
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-copy');

};
