'use strict';


module.exports = function (grunt) {

	grunt.initConfig({
		css: {
			any: 'assets/styles/**/*.scss',
			input: 'assets/styles/master.scss',
			output: 'public/styles/master.min.css'
		},

		scripts: {
			any: 'assets/scripts/**/*.coffee',
			input: 'assets/scripts/**/*.coffee',
			output: 'public/scripts/master.min.js'
		},

		pkg: grunt.file.readJSON('package.json'),

		tag: {
			banner: '/*!\n' +
				' * <%= pkg.name %>\n' +
				' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>\n' +
				' * @version <%= pkg.version %>\n' +
				' */\n'
		},

		sass: {
			options: {
				banner: '<%= tag.banner %>',
				noCache: true
			},
			dev: {
				files: {
					'<%= css.output %>': '<%= css.input %>'
				},
				options: {
					style: 'expanded'
				}
			},
			dist: {
				files: {
					'<%= css.output %>': '<%= css.input %>'
				},
				options: {
					style: 'compressed'
				}
			}
		},

		coffee: {
			options: {
				bare: false,
				join: true
			},
			dev: {
				files: {
					'<%= scripts.output %>': '<%= scripts.input %>'
				}
			},
			dist: {
				files: {
					'<%= scripts.output %>': '<%= scripts.input %>'
				}
			}
		},

		uglify: {
			options: {
				banner: "<%= tag.banner %>",
				mangle: true,
				wrap: true
			},
			dist: {
				files: {
					'<%= scripts.output %>': [
						'<%= scripts.output %>'
					]
				}
			}
		},

		watch: {
			css: {
				files: '<%= css.any %>',
				tasks: [
					'sass:dev'
				]
			},
			scripts: {
				files: '<%= scripts.any %>',
				tasks: [
					'coffee:dev'
				]
			}
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', [
		'watch'
	]);

	grunt.registerTask('build', [
		'sass:dist',
		'coffee:dist',
		'uglify',
	]);
};
