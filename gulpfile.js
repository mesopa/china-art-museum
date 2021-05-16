
// -----------------
// Project Variables
// -----------------

const { src, dest, series, parallel, watch } = require('gulp');

const sass         = require('gulp-sass'),
      uglify       = require('gulp-uglify'),
      minifyCSS    = require('gulp-clean-css'),
      htmlmin      = require('gulp-htmlmin'),
      connect      = require('gulp-connect'),
      concat       = require('gulp-concat'),
      replace      = require('gulp-replace'),
      inlinesource = require('gulp-inline-source'),
      inject       = require('gulp-inject-string'),
      rename       = require('gulp-rename'),
      fs           = require('fs'),
      del          = require('del');

const theme_name   = 'china-art-museum',
      theme_suffix = '';

const base_path  = '',
      source     = base_path + '_dev',
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
          source + '/javascript/' + theme_name + '-javascript.js',
        ],
        sass: [
          source + '/scss/' + theme_name + '-styles.scss',
          source + '/scss/' + theme_name + '-styles-fonts.scss',
        ],
        sass_AMP: [
          source + '/scss/' + theme_name + '-styles-amp.scss',
          source + '/scss/' + theme_name + '-styles-fonts-amp.scss',
        ]
      };

// -------------
// Project Tasks
// -------------

// Local Server
function connectServer() {
  connect.server({
    root: dist,
    livereload: false
  });
};

// -- CLEAN 'dist' --
function cleanDist() {
  return del( dist + '/*' );
};

// -- CLEAN 'tmp' --
function cleanTmp(){
  return del( temp + '/*' );
};

// -- ASSETS --
function assets() {
  return src( source + '/assets/**/**/**/*' )
    .pipe( dest( dist + '/assets/' ) );
};

// -- JS     --
function js() {
  return src( paths.js )
    .pipe( concat( theme_name + theme_suffix + '.js' ) )
    .pipe( uglify())
    .pipe( rename({
      suffix: '.min'
    }))
    .pipe( dest( temp + '/compiled-js' ) );
};

// -- SASS   --
function sassStyles() {
  return src( paths.sass )
    .pipe( sass())
    .pipe( minifyCSS({
        level: {1: {specialComments: 0}}
      }))
    .pipe( rename({
      suffix: '.min'
    }))
    .pipe( dest( temp + '/compiled-css' ) )
    .pipe( dest( dist + '/assets/css' ) );
};

// -- SASS AMP  --
function sassAmp() {
  return src( paths.sass_AMP )
    .pipe( sass())
    .pipe( replace( '!important', '' ) )
    .pipe( minifyCSS({
        level: {1: {specialComments: 0}}
      }))
    .pipe( rename({
      suffix: '.min'
    }))
    .pipe( dest( temp + '/compiled-css' ) );
};

// -- Vendor JS    --
function vendorJs() {
  return src( paths.vendor_js )
    .pipe( concat( theme_name + theme_suffix + '-vendor' + '.js' ) )
    .pipe( uglify())
    .pipe( rename({
      suffix: '.min'
    }))
    .pipe( dest( temp + '/compiled-js' ) );
};

// -- Vendor CSS   --
function vendorCss() {
  return src( paths.vendor_css )
    .pipe( concat( theme_name + theme_suffix + '-vendor' + '.css' ) )
    .pipe( minifyCSS({
      level: {1: {specialComments: 0}}
    }))
    .pipe( rename({
      suffix: '.min'
    }))
    .pipe( dest( temp + '/compiled-css' ) );
};

// -- Vendor CSS AMP  --
function vendorCssAmp() {
  return src( paths.vendor_css_AMP )
    .pipe( concat( theme_name + theme_suffix + '-vendor' + '.css' ) )
    .pipe( replace( '!important', '' ) )
    .pipe( minifyCSS({
      level: {1: {specialComments: 0}}
    }))
    .pipe( rename({
      suffix: '-amp.min'
    }))
    .pipe( dest( temp + '/compiled-css' ) );
};

// -- Inline CSS   --
function inlineCss() {
  return src( source + '/html/*' )
     .pipe( inlinesource() )
     .pipe( htmlmin({
       collapseWhitespace: true
      }))
     .pipe( dest( dist ) )
     .pipe( connect.reload() );
};

// -- Concat CSS AMP --
function concatCssAmp() {
  return src([
       temp + '/compiled-css/china-art-museum-vendor-amp.min.css',
       temp + '/compiled-css/china-art-museum-styles-amp.min.css',
       temp + '/compiled-css/china-art-museum-styles-fonts-amp.min.css'
     ])
     .pipe( concat(theme_name + '-amp-all.min.css'))
     .pipe( dest( temp + '/compiled-css' ));
};

// -- Inline CSS AMP  --
function inlineCssAmp() {
  var cssContent = fs.readFileSync( temp + '/compiled-css/china-art-museum-amp-all.min.css');

  return src( source + '/html/amp/*' )
     .pipe( inject.after('style amp-custom>', cssContent) )
     .pipe( htmlmin({
       collapseWhitespace: true
      }))
     .pipe( dest( dist ) )
     .pipe( connect.reload() );
};

// -- Concat JS   --
function concatJs() {
  return src([
    temp + '/compiled-js/' + theme_name + '-vendor.min.js',
    temp + '/compiled-js/' + theme_name + '.min.js',
  ])
  .pipe( concat(theme_name + '-all.min.js') )
  .pipe( dest( dist + '/assets/js' ) )
  .pipe( connect.reload() );
};

// -- WATCH          --
function watchFiles() {
  watch( source + '/html/*', series(inlineCss, inlineCssAmp) );
  watch( source + '/javascript/*', concatJs );
  watch( source + '/scss/*', series(inlineCss, inlineCssAmp) );
};

// ------------------------------
// -- Project `default` Gulp Task
// ------------------------------

exports.default = series(
  cleanDist,
  cleanTmp,
  assets,
  js,
  vendorJs,
  concatJs,
  sassStyles,
  vendorCss,
  inlineCss,
  sassAmp,
  vendorCssAmp,
  concatCssAmp,
  inlineCssAmp,
  parallel(
    watchFiles,
    connectServer,
  ),
);