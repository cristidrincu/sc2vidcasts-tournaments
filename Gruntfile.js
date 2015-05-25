/**
 * Created by cristiandrincu on 12/5/14.
 */
module.exports = function(grunt){
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		concat: {
			css: {
				//syntax for excluding a folder - !public/css/plugins/**/*.css
				src: ['public/css/plugins/**/*.css', 'public/css/plugins/*.css', 'public/css/*.css'],
				dest: 'public/css-dist/combined.css'
			},
			js: {
				src: ['public/js/sidebar-menus.js', 'public/js/site-date.js', 'public/js/slidingProfilePanels.js', 'public/js/flash-messages.js'],
				dest: 'public/js-dist/combined.js'

			}
		},
		jshint: {
			files: ['app/**/*.js', 'config/*.js'],
			options: {
				globals: {
					jQuery: true
				}
			}
		},
		uglify: {
			dest: {
				files: {
					'public/js-dist/combined.min.js': ['<%= concat.js.dest %>']
				}
			}
		},
		cssmin: {
			dest: {
				files: {
					'public/css-dist/combined.min.css': ['<%= concat.css.dest %>']
				}
			}
		},
		watch: {
			files: ['<%= concat.css.src %>', '<%= concat.js.src %>'],
			tasks: ['concat', 'uglify', 'cssmin', 'jshint']
		}
	});


	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	//grunt.registerTask('default', [ 'concat:css', 'cssmin:css', 'concat:js', 'uglify:js' ]);
	grunt.registerTask('default', [ 'concat:css', 'concat:js', 'uglify', 'cssmin', 'jshint']);
}