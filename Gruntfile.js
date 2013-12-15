module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    
    grunt.initConfig({
        clean: ['dist'],
        
        browserify: {
            lib: {
                src: 'src/MIDIFile.js',
                dest: 'dist/MIDIFile.js',
                options: {
                    standalone: 'MIDIFile'
                }
            }
        },

        watch: {
            code: {
                files: ['src/**/*.js', 'tests/**/*.js'],
                tasks: ['dist', 'mochaTest']
            }
        },

        mochaTest: {
          test: {
            options: {
              reporter: 'spec'
            },
            src: ['tests/**/*.js']
          }
        }
    });

    grunt.registerTask('dist', [
        'clean',
        'browserify'
    ]);

    grunt.registerTask('test', [
        'mochaTest',
        'watch'
    ]);

    grunt.registerTask('default', [
        'test'
    ]);
};
