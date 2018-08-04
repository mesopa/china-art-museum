
// -----------------
// Project Variables
// -----------------

var gulp           = require('gulp'),
    sass           = require('gulp-sass'),
    prefixer       = require('gulp-autoprefixer'),
    uglify         = require('gulp-uglify'),
    minifyCSS      = require('gulp-clean-css'),
    htmlmin        = require('gulp-htmlmin'),
    connect        = require('gulp-connect'),
    concat         = require('gulp-concat'),
    replace        = require('gulp-replace'),
    inlinesource   = require('gulp-inline-source'),
    inject         = require('gulp-inject-string'),
    rename         = require('gulp-rename'),
    fs             = require('fs'),
    del            = require('del');

const theme_name   = 'china-art-museum',
      theme_suffix = '';

      const base_path  = '',
      src        = base_path + '_dev',
      dist       = base_path + 'docs',
      temp       = base_path + '_dev/tmp',
      paths      = {
        vendor_js:   [
          'node_modules/jquery/dist/jquery.min.js',
          'node_modules/lazysizes/lazysizes.min.js',
          'node_modules/lazysizes/plugins/unveilhooks/ls.unveilhooks.min.js',
        ],
        vendor_css:  [
          'node_modules/basscss/css/basscss.css',
          'node_modules/basscss-btn/css/btn.css',
          'node_modules/basscss-btn-primary/css/btn-primary.css',
          'node_modules/basscss-background-images/css/background-images.css',
          'node_modules/basscss-responsive-position/css/responsive-position.css',
          'node_modules/basscss-forms/index.css',
        ],
        vendor_css_AMP: [
          'node_modules/basscss/css/basscss.css',
          'node_modules/basscss-btn/css/btn.css',
          'node_modules/basscss-btn-primary/css/btn-primary.css',
          'node_modules/basscss-background-images/css/background-images.css',
          'node_modules/basscss-responsive-position/css/responsive-position.css',
          'node_modules/basscss-forms/index.css',
        ],
        js:   [
          src + '/javascript/' + theme_name + '-javascript.js',
        ],
        sass: [
          src + '/scss/' + theme_name + '-styles.scss',
          src + '/scss/' + theme_name + '-styles-fonts.scss',
        ],
        sass_AMP: [
          src + '/scss/' + theme_name + '-styles-amp.scss',
          src + '/scss/' + theme_name + '-styles-fonts-amp.scss',
        ]
      };

// -------------
// Project Tasks
// -------------

// Local Server
gulp.task('connect', () => {
  connect.server({
    root: dist,
    livereload: false
  });
});

// -- CLEAN 'dist' --
gulp.task('clean-dist', () => {
  return del( dist + '/*' );
});

// -- CLEAN 'tmp' --
gulp.task('clean-tmp', () => {
  return del( temp + '/*' );
});

// -- ASSETS --
gulp.task('assets', () => {
  return gulp.src( src + '/assets/**/**/**/*' )
    .pipe( gulp.dest( dist + '/assets/' ) );
});

// -- JS     --
gulp.task('js', () => {
  return gulp.src( paths.js )
    .pipe( concat( theme_name + theme_suffix + '.js' ) )
    .pipe( uglify())
    .pipe( rename({
      suffix: '.min'
    }))
    .pipe( gulp.dest( temp + '/compiled-js' ) );
});

// -- SASS   --
gulp.task('sass', () => {
  return gulp.src( paths.sass )
    .pipe( sass())
    .pipe( prefixer({
      browsers: [
        'last 2 versions',
        '> 1%',
        'opera 12.1',
        'bb 10',
        'android 4'
        ]
      }))
    .pipe( minifyCSS({
        level: {1: {specialComments: 0}}
      }))
    .pipe( rename({
      suffix: '.min'
    }))
    .pipe( gulp.dest( temp + '/compiled-css' ) )
    .pipe( gulp.dest( dist + '/assets/css' ) );
});

// -- SASS AMP  --
gulp.task('sass-amp', () => {
  return gulp.src( paths.sass_AMP )
    .pipe( sass())
    .pipe( prefixer({
      browsers: [
        'last 2 versions',
        '> 1%',
        'opera 12.1',
        'bb 10',
        'android 4'
        ]
      }))
    .pipe( replace( '!important', '' ) )
    .pipe( minifyCSS({
        level: {1: {specialComments: 0}}
      }))
    .pipe( rename({
      suffix: '.min'
    }))
    .pipe( gulp.dest( temp + '/compiled-css' ) );
});

// -- Vendor JS    --
gulp.task('vendor-js', () => {
  return gulp.src( paths.vendor_js )
    .pipe( concat( theme_name + theme_suffix + '-vendor' + '.js' ) )
    .pipe( uglify())
    .pipe( rename({
      suffix: '.min'
    }))
    .pipe( gulp.dest( temp + '/compiled-js' ) );
});

// -- Vendor CSS   --
gulp.task('vendor-css', () => {
  return gulp.src( paths.vendor_css )
    .pipe( concat( theme_name + theme_suffix + '-vendor' + '.css' ) )
    .pipe( minifyCSS({
      level: {1: {specialComments: 0}}
    }))
    .pipe( rename({
      suffix: '.min'
    }))
    .pipe( gulp.dest( temp + '/compiled-css' ) );
});

// -- Vendor CSS AMP  --
gulp.task('vendor-css-amp', () => {
  return gulp.src( paths.vendor_css_AMP )
    .pipe( concat( theme_name + theme_suffix + '-vendor' + '.css' ) )
    .pipe( replace( '!important', '' ) )
    .pipe( minifyCSS({
      level: {1: {specialComments: 0}}
    }))
    .pipe( rename({
      suffix: '-amp.min'
    }))
    .pipe( gulp.dest( temp + '/compiled-css' ) );
});

// -- Inline CSS   --
gulp.task('inline-css', ['sass', 'vendor-css'], ()=> {
  return gulp.src( src + '/html/*' )
     .pipe( inlinesource() )
     .pipe( htmlmin({
       collapseWhitespace: true
      }))
     .pipe( gulp.dest( dist ) )
     .pipe( connect.reload() );
});

// -- Concat CSS AMP --
gulp.task('concat-css-amp', ['sass-amp', 'vendor-css-amp'], ()=> {
  return gulp.src([
       temp + '/compiled-css/china-art-museum-vendor-amp.min.css',
       temp + '/compiled-css/china-art-museum-styles-amp.min.css',
       temp + '/compiled-css/china-art-museum-styles-fonts-amp.min.css'
     ])
     .pipe( concat(theme_name + '-amp-all.min.css'))
     .pipe( gulp.dest( temp + '/compiled-css' ));
});

// -- Inline CSS AMP  --
gulp.task('inline-css-amp', ['concat-css-amp'], ()=> {
  var cssContent = fs.readFileSync( temp + '/compiled-css/china-art-museum-amp-all.min.css');

  return gulp.src( src + '/html/amp/*' )
     .pipe( inject.after('style amp-custom>', cssContent) )
     .pipe( htmlmin({
       collapseWhitespace: true
      }))
     .pipe( gulp.dest( dist ) )
     .pipe( connect.reload() );
});

// -- Concat JS   --
gulp.task('concat-js', ['js', 'vendor-js'], () => {
  return gulp.src([
    temp + '/compiled-js/' + theme_name + '-vendor.min.js',
    temp + '/compiled-js/' + theme_name + '.min.js',
    temp + '/compiled-js/cloudimage.io-responsive.js'
  ])
  .pipe( concat(theme_name + '-all.min.js') )
  .pipe( gulp.dest( dist + '/assets/js' ) )
  .pipe( connect.reload() );
});

// -- WATCH          --
gulp.task('watch', () => {
  gulp.watch( src + '/html/*', ['inline-css', 'inline-css-amp'] );
  gulp.watch( src + '/javascript/*', ['concat-js'] );
  gulp.watch( src + '/scss/*', ['inline-css', 'inline-css-amp'] );
});

// ------------------------------
// -- Project `default` Gulp Task
// ------------------------------

gulp.task(
  'default', ['clean-dist', 'clean-tmp'], () => {
    gulp.start(
      'connect',
      'assets',
      'concat-js',
      'inline-css',
      'inline-css-amp',
      'watch'
    )
  });