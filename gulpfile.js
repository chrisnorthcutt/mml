var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat-util');
var uglify = require('gulp-uglify');
var es = require('event-stream');
var path = require('path');
var sass = require('gulp-sass');
var themesCombiner = require('gulp-sass-themes-combiner');
var themesCombiner = themesCombiner('./resources/scss/themes/_*.scss');
var browserSync = require('browser-sync').create();
var autoprefixer = require('gulp-autoprefixer');
var replace = require('gulp-replace');
var fs = require('fs');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var reload = browserSync.reload;
// ... variables
var autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};
var sourcemaps = require('gulp-sourcemaps');

//Deploy MML to Dev
gulp.task('deploy', function() {
  var target = '\\\\10.5.40.50\\c$\\Program Files (x86)\\OfficeMMLNew\\';

  if (path.sep != '\\') {
    target = "smb://10.5.40.50/c$/Program Files (x86)/OfficeMMLNew/Screens/testing";
  }

  gulp.src([
    './**/*',
    '!node_modules/**/*',
    '!themes/**/*',
    '!temp/**/*',
    '!resources/scss/*',
    '!prepros-6.config',
    '!README.md',
    '!gulpfile.js',
    '!package.json',
    '!package-lock.json',
    '!.DS_Store',
    '!browserconfig.xml',
    '!replace.json',
    '!.gitignore'
    ])
    .pipe(gulp.dest(target));
});

//Deploy Neurocore to Dev
gulp.task('neurocore-deploy', function() {
  var target = "\\\\10.5.40.50\\c$\\Program Files (x86)\\Neurocore\\";

  if (path.sep != '\\') {
    target = "smb://10.5.40.50/c$/Program Files (x86)/OfficeMMLNew/Screens/testing";
  }

  gulp.src([
    './temp/**/*'
    ])
    .pipe(gulp.dest(target));
});

//Deploy MML to QA
gulp.task('qa', function() {
  var target = '\\\\192.168.1.29\\c$\\Program Files (x86)\\MML';

  if (path.sep != '\\') {
    target = 'smb://192.168.1.29/c$/Program Files/OfficeMML/new'
  }

  gulp.src([
    './**/*',
    '!./node_modules/**/*',
    '!./themes/**/*',
    '!./temp/**/*',
    '!./.git/**/*'
    ])
    .pipe(gulp.dest(target));
});

//Deploy Neurocore to QA
gulp.task('neurocore-qa', function() {
  var target = '\\\\192.168.1.29\\c$\\Program Files (x86)\\MML\\neurocore';

  if (path.sep != '\\') {
    target = 'smb://192.168.1.29/c$/Program Files/OfficeMML/new'
  }

  gulp.src([
    './temp/**/*',
    ])
    .pipe(gulp.dest(target));
});

//Send MML to Localhost *This is currently not working*
// gulp.task('host', function() {
//   var target = 'C:\\Program Files (x86)\\MMLNew';

//   var replacements = JSON.parse(fs.readFileSync('replace.json', 'utf8'));

//    gulp.src([
//     './**/*',
//     '!/node_modules/**/*',
//     '!/themes/**/*',
//     '!/temp/**/*',
//     '!/.git/**/*'
//     ])
//   .pipe(gulp.dest(target));
// });

//Minify the Javascript in the /javascript directory
gulp.task('minify', function() {
  es.merge(
    gulp.src('./javascript/screens/{,*/}*.js')
      .pipe(concat('mml.js')),
    gulp.src('./javascript/*.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./resources/js/'));
});

//Minify the CSS
gulp.task('minify-css', () => {
  return gulp.src(['resources/css/*.css', '!resources/css/*.min.css'])
  .pipe(cleanCSS({
    compatibility: 'ie8'
  }))
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('resources/css/'));
});

gulp.task('build', function() {
  es.merge(
    gulp.src('./javascript/screens/{,*/}*.js')
      .pipe(concat('mml.js')),
    gulp.src('./javascript/*.js'))
      .pipe(gulp.dest('./resources/js/'));
});

//Compile the SCSS to CSS
gulp.task('sass', function() {
 return gulp.src('resources/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    // .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('resources/css'))
});

//Compile Neurocore SCSS to CSS
gulp.task('neurocore-sass', function() {
 return gulp.src('resources/scss/themes/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    // .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('themes/neurocore/resources/css'))
});

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('theme', function() {
  var target = 'temp';
  
  return gulp.src([
    './themes/neurocore/**/*'
  ])
  .pipe(gulp.dest(target));
});

gulp.task('temphost', function() {
  return gulp.src([
    './temp/**/*'
  ])
});

gulp.task('tempbuild', function() {
  return es.merge(
    gulp.src('./temp/javascript/screens/{,*/}*.js')
      .pipe(concat('mml.js')),
    gulp.src('./temp/javascript/*.js'))
      .pipe(gulp.dest('./temp/resources/js/'));
});

gulp.task('move', function() {
  var target = 'temp';

  return gulp.src([
    './**/*',
    '!./node_modules/**/*',
    '!./themes/**/*',
    '!./temp/**/*',
    '!prepros-6.config',
    '!README.md',
    '!gulpfile.js',
    '!package.json',
    '!package-lock.json',
    '!.DS_Store',
    '!browserconfig.xml',
    '!replace.json',
    '!.gitignore'
  ])
  .pipe(gulp.dest(target));
});

gulp.task('neurocore-sync', function(done) {
  runSequence('sass', 'neurocore-sass', 'move', 'theme', 'tempbuild', function() {
    browserSync.reload();
    done();
  })
});

gulp.task('mml-sync', function(done) {
  runSequence('sass', 'build', function() {
    browserSync.reload();
    done();
  })
});

gulp.task('serve', function() {

  browserSync.init({
    server: "./"
  });

  gulp.watch(["./resources/scss/**/*.scss", "./**/*.html"], ['mml-sync']);
});

gulp.task('neurocore', function(done) {
  runSequence('move', 'theme', 'tempbuild', 'temphost', function() {
    console.log('Done!');
  })
})

gulp.task('createbuild', function(done) {
  runSequence('move', 'tempbuild', 'push', function() {
    console.log('Done!');
  });
});

gulp.task('push', function() {
  var target = '\\\\192.168.1.29\\c$\\Program Files (x86)\\MML_Push\\neurocore';

  target = '.\\build\\mml';

  return gulp.src([
    './temp/**/*'
  ])
  .pipe(gulp.dest(target));
});

gulp.task('watch:sass', function(){
  gulp.watch("resources/scss/**/*.scss", ["sass"]); 
})

gulp.task('sync', ['serve']);

gulp.task('default', ['build']);

// MML Build - gulp createbuild
//
// Neurocore Build - gulp neurocore
//                   gulp push
