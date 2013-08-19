module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'public/main.js',
        dest: 'public/main.min.js'
      }
    },
    less: {
      development: {
        files: {
          "public/ala.css": "styles.less"
        }
      },
      production: {
        options: {
          yuicompress: true
        },
        files: {
          "public/ala.yui.css": "styles.less"
        }
      }
    },
    tests: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/*.js']
      }
    },
    watch: {
      serverjs: {
        files: ['server/*.js', 'package.json', 'Gruntfile.js'],
        tasks: ['jshint', 'tests']
      },
      styles: {
        files: ['styles.less'],
        tasks: ['less']
      },
      publicjs: {
        files: ['public/main.js'],
        tasks: ['uglify']
      }
    }
  });

  // Load the plugins for the tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'less', 'watch', 'tests']);
};