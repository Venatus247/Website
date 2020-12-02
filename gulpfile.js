const   gulp        = require('gulp'),
        plumber     = require('gulp-plumber'),
        gUtil       = require('gulp-util'),
        clean       = require('gulp-clean'),
        sourcemaps  = require('gulp-sourcemaps'),
        sass        = require('gulp-sass'),
        cleanCss    = require('gulp-clean-css'),
        rename      = require('gulp-rename'),
        htmlMin     = require('gulp-htmlmin'),
        browserify = require('browserify'),
        source = require('vinyl-source-stream'),
        tsify = require('tsify'),
        uglifyEs    = require('uglify-es'),
        composer    = require('gulp-uglify/composer'),
        uglify      = composer(uglifyEs, console),
        buffer = require('vinyl-buffer')

const   src         = './src',
        dist        = './dist'

gulp.task('clean', _ => {
    return gulp.src(`${dist}/*`)
        .pipe(plumber())
        .pipe(clean({force: true}))
})

gulp.task('html', _ => {
    return gulp.src(`${src}/*.html`)
        .pipe(plumber((error) => {
            gUtil.log(error.message)
        }))
        .pipe(htmlMin({
            collapseWhitespace: true,
            removeComments: true,
            html5: true,
            removeEmptyAttributes: true,
            removeTagWhitespace: true,
            sortAttributes: false,
            sortClassName: false
        }))
        .pipe(gulp.dest(`${dist}`))
})

gulp.task('sass', _ => {
    return gulp.src(`${src}/sass/**/*.sass`)
        .pipe(plumber((error) => {
            gUtil.log(error.message)
        }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        //.pipe(gulp.dest(`${src}/assets/css`))
        .pipe(cleanCss())
        .pipe(rename( {suffix: '.min'} ))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(`${dist}/css`))
})

gulp.task('ts', _ => {
    return browserify({
        basedir: '.',
        debug: true,
        entries: [`${src}/ts/main.ts`],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest(`${dist}/js`))
    //return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest(`${dist}/js`))
})

gulp.task('watch', _ => {
    gulp.watch([`${src}/*.html`], gulp.series('html'))
    gulp.watch([`${src}/sass/**/*.sass`], gulp.series('sass'))
});

gulp.task('default', gulp.parallel('html', 'sass', 'ts'))