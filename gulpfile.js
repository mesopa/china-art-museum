
var gulp           = require('gulp'),
    googleWebFonts = require('gulp-google-webfonts'),
    sass           = require('gulp-sass'),
    prefixer       = require('gulp-autoprefixer'),
    uglify         = require('gulp-uglify'),
    minifyCSS      = require('gulp-clean-css'),
    htmlmin        = require('gulp-htmlmin'),
    connect        = require('gulp-connect'),
    concat         = require('gulp-concat'),
    replace        = require('gulp-replace'),
    htmlreplace    = require('gulp-html-replace'),
    rename         = require('gulp-rename'),
    del            = require('del');

const base_path = './',
      src       = base_path + '_dev/src',
      dist      = base_path + 'docs';

// Initialize the live server
gulp.task('connect', function(){
  connect.server({
    root: dist,
    livereload: false
  });
});

// Copy and minify HTML files
gulp.task('html', function(){
  return gulp.src( src + '/*.html' )
    .pipe(htmlmin({
      collapseWhitespace: true,
      collapseInlineTagWhitespace: true
    }))
    .pipe(gulp.dest( dist ))
    .pipe(connect.reload());
});

// Copy all necessary images
gulp.task('images', function(){
  return gulp.src( src + '/images/**/*' )
    .pipe(gulp.dest( dist + '/assets/images/' ))
    .pipe(connect.reload());
});

// Get all the necessary Google fonts listed in 'fonts.list'
gulp.task('google-fonts', function(){
  return gulp.src( base_path + 'fonts.list' )
    .pipe(googleWebFonts({
      fontsDir: dist + '/assets/fonts/google/',
      cssDir: dist + '/assets/css/',
      cssFilename: 'fonts.css'
    }))
    .pipe(gulp.dest('./'));
});

// Fix CSS Google Fonts PATH
gulp.task('google-fonts-css-fix', ['google-fonts'], function(){
  return gulp.src( dist + '/assets/css/fonts.css')
    .pipe(replace('url(docs/assets/', 'url(../'))
    .pipe(minifyCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(dist + '/assets/css/'));
});

// Copy Font Awesome Fonts files
gulp.task('fontawesome-fonts', function(){
  return gulp.src( base_path + 'node_modules/font-awesome/fonts/*' )
    .pipe(gulp.dest(dist + '/assets/fonts/font-awesome/'));
});

// Compiles Font Awesome Styles
gulp.task('fontawesome-sass', function(){
  return gulp.src( src + '/stylesheet/font-awesome.scss' )
    .pipe(sass({
      includePaths: [
        'node_modules/font-awesome/scss'
      ]
    }))
    .pipe(prefixer())
    .pipe(minifyCSS({
      level: {1: {specialComments: 0}}
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(dist + '/assets/css/'));
});

// Copy scripts that doesn't need any compilation
gulp.task('no-compile-scripts', function(){
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js', //Only for local development
    'node_modules/lazysizes/lazysizes.min.js'
  ])
    .pipe(gulp.dest( dist + '/assets/js/' ));
});

// Compile Javascript scripts.js
gulp.task('compile-scripts', function(){
  return gulp.src( src + '/javascript/scripts.js')
    .pipe(uglify())
    .pipe(rename('scripts.min.js'))
    .pipe(gulp.dest( dist + '/assets/js/' ));
});


// Compile styles.scss
gulp.task('styles-sass', function(){
  return gulp.src( src + '/stylesheet/styles.scss' )
    .pipe(sass())
    .pipe(minifyCSS())
    .pipe(prefixer())
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest( dist + '/assets/css/' ));
});


// Concat all Styles Files into one file
gulp.task('concat-styles', [
  'google-fonts',
  'google-fonts-css-fix',
  'fontawesome-fonts',
  'fontawesome-sass',
  'styles-sass' ], function(){
return gulp.src([
   './node_modules/basscss/css/basscss.css',
   './node_modules/basscss-btn/css/btn.css',
   './node_modules/basscss-btn-primary/css/btn-primary.css',
   './node_modules/basscss-background-images/css/background-images.css',
   dist + '/assets/css/font-awesome.min.css',
   dist + '/assets/css/fonts.min.css',
   dist + '/assets/css/styles.min.css'
  ])
  .pipe(concat('app.min.css'))
  .pipe(gulp.dest( dist + '/assets/css/' ));
});

// Concat all Scripts Files into one file
gulp.task('concat-scripts', [
  'no-compile-scripts',
  'compile-scripts' ], function(){
return gulp.src([
    dist + '/assets/js/lazysizes.min.js',
    dist + '/assets/js/scripts.min.js'
  ])
  .pipe(concat('app.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest( dist + '/assets/js/' ));
});

// Live concat all styles files into one file
// If any changes are made in styles.scss
gulp.task('watch-concat-styles', ['styles-sass'], function(){
  return gulp.src([
    './node_modules/basscss/css/basscss.css',
    dist + '/assets/css/font-awesome.min.css',
    dist + '/assets/css/fonts.min.css',
    dist + '/assets/css/styles.min.css'
   ])
   .pipe(concat('app.min.css'))
   .pipe(gulp.dest( dist + '/assets/css/' ))
   .pipe(connect.reload());
});

// Live concat all scripts files into one file
// If any changes are made in scripts.js
gulp.task('watch-concat-scripts', ['compile-scripts'], function(){
  return gulp.src([
    dist + '/assets/js/lazysizes.min.js',
    dist + '/assets/js/scripts.min.js'
  ])
  .pipe(concat('app.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest( dist + '/assets/js/' ))
  .pipe(connect.reload());
});

// Clean all files inside the 'dist' folder
gulp.task('clean', function(){
  return del( dist + '/*' );
});

// Watch styles.scss and scripts.js for any changes
gulp.task('watch', function(){
  gulp.watch( src + '/*.html', ['html'] );
  gulp.watch( src + '/stylesheet/*.scss', ['watch-concat-styles'] );
  gulp.watch( src + '/javascript/scripts.js', ['watch-concat-scripts'] );
});

// *****************************************
// AMP Section
// *****************************************

gulp.task('amp-styles-sass', function(){
  return gulp.src( src + '/amp/stylesheet/amp-styles.scss' )
    .pipe(sass())
    .pipe(sassUnicode())
    .pipe(minifyCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest( dist + '/assets/css/' ));
});

gulp.task('amp-inline-styles', ['amp-styles-sass'], function(){
  return gulp.src( src + '/amp/index.amp.html' )
    .pipe(htmlreplace({
      'cssInline': {
        'src': gulp.src( dist + '/assets/css/amp-styles.min.css' ),
        'tpl': '<style amp-custom>%s</style>'
      }
    }))
    .pipe(gulp.dest( dist + '/' ));
});

gulp.task('amp-watch', function(){
  gulp.watch( src + '/amp/stylesheet/amp-styles.scss', ['amp-inline-styles'] );
  gulp.watch( src + '/amp/index.amp.html', ['amp-inline-styles'] );
});

gulp.task('amp', function(){
  gulp.start(
    'amp-inline-styles',
    'connect',
    'amp-watch');
});

// *****************************************
// End of AMP Section
// *****************************************

// Default task
gulp.task('default', ['clean'], function(){
  gulp.start(
    'html',
    'images',
    'concat-styles',
    'concat-scripts',
    'connect',
    'watch');
});