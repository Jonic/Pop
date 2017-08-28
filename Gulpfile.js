const autoprefixer = require('gulp-autoprefixer')
const coffee = require('gulp-coffee')
const concat = require('gulp-concat')
const cssnano = require('gulp-cssnano')
const gulp = require('gulp')
const notify = require('gulp-notify')
const sass = require('gulp-sass')
const shell = require('gulp-shell')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const util = require('gulp-util')

const handleError = error => {
  const formattedError = error.toString()
  util.log(formattedError)
  notify(formattedError)
  this.emit('end')
}

const config = {
  paths: {
    scripts: {
      files: {
        any: 'assets/scripts/**/*.coffee',
        utils: 'assets/scripts/utils.coffee',
        helpers: 'assets/scripts/helpers/**/*.coffee',
        classes: 'assets/scripts/classes/**/*.coffee',
        scenes: 'assets/scripts/scenes/**/*.coffee',
        entities: 'assets/scripts/entities/**/*.coffee',
        bootstrap: 'assets/scripts/bootstrap.coffee',
      },
      dest: 'public/scripts',
    },
    styles: {
      files: {
        any: 'assets/styles/**/*.scss',
        input: 'assets/styles/master.scss',
      },
      dest: 'public/styles',
    },
  },
}

gulp.task('scripts', () => {
  const files = config.paths.scripts.files

  return gulp
    .src([
      files.utils,
      files.helpers,
      files.classes,
      files.scenes,
      files.entities,
      files.bootstrap,
    ])
    .on('error', handleError)
    .pipe(sourcemaps.init())
    .on('error', handleError)
    .pipe(coffee({ bare: true }))
    .on('error', handleError)
    .pipe(concat('application.js'))
    .on('error', handleError)
    .pipe(uglify())
    .on('error', handleError)
    .pipe(sourcemaps.write('.'))
    .on('error', handleError)
    .pipe(gulp.dest(config.paths.scripts.dest))
    .on('error', handleError)
})

gulp.task('styles', () => {
  const files = config.paths.styles.files

  return gulp
    .src(files.input)
    .pipe(sourcemaps.init())
    .on('error', handleError)
    .pipe(
      sass({
        compressed: false,
      }),
    )
    .on('error', handleError)
    .pipe(autoprefixer())
    .on('error', handleError)
    .pipe(cssnano())
    .on('error', handleError)
    .pipe(sourcemaps.write('.'))
    .on('error', handleError)
    .pipe(gulp.dest(config.paths.styles.dest))
    .on('error', handleError)
})

gulp.task('watch', () => {
  gulp.watch(config.paths.scripts.files.any, ['scripts'])
  gulp.watch(config.paths.styles.files.any, ['styles'])
})

gulp.task('deploy', shell.task('make deploy'))

gulp.task('default', ['scripts', 'styles', 'watch'])
