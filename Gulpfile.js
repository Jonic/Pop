
'use strict';

var autoprefixer = require('gulp-autoprefixer');
var gulp         = require('gulp');
var coffee       = require('gulp-coffee');
var concat       = require('gulp-concat');
var gutil        = require('gulp-util');
var rename       = require('gulp-rename');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');

var paths = {
	scripts: {
		any:       'assets/scripts/**/*.coffee',
		bootstrap: 'assets/scripts/_bootstrap.coffee',
		classes:   'assets/scripts/classes/**/*.coffee',
		dest:      'public/scripts'
	},
	styles: {
		any:   'assets/styles/**/*.scss',
		input: 'assets/styles/master.scss',
		dest:  'public/styles'
	}
};

gulp.task('scripts', function () {
	return gulp.src([
			paths.scripts.classes,
			paths.scripts.bootstrap
		])
		.pipe(sourcemaps.init())
		.pipe(coffee({
			bare: true
		}))
		.pipe(concat('application.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.scripts.dest));
		//.on('error', gutil.log());
});

gulp.task('styles', function () {
	return gulp.src(paths.styles.input)
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(autoprefixer())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.styles.dest));
		//.on('error', gutil.log());
});

gulp.task('watch', function () {
	gulp.watch(paths.scripts.any, ['scripts']);
	gulp.watch(paths.styles.any,  ['styles']);
});

gulp.task('default', [
	'scripts',
	'styles',
	'watch'
]);
