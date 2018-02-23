'use strict';

import gulp from 'gulp'
import shell from 'gulp-shell'
import plumber from 'gulp-plumber'
import gutil from 'gulp-util'
import browsersync from 'browser-sync'
import rename from 'gulp-rename'
import sass from 'gulp-sass'
import postcss from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import concat from 'gulp-concat'
import uglify from 'gulp-uglify'
import babel from 'gulp-babel'
import imagemin from 'gulp-imagemin'
import svgmin from 'gulp-svgmin'
import svgstore from 'gulp-svgstore'

// Build CSS
gulp.task('css:dist', () => {
	// PostCSS plugins
	const plugins = [
		autoprefixer({browsers: ['last 1 version']}),
		cssnano({ mergeLonghand: false, zindex: false })
	];
	return gulp.src('./src/scss/*.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(postcss(plugins))
		.pipe(rename({suffix: '.min'}))
		.pipe(plumber.stop())
		.pipe(gulp.dest('./dist/css/'))
		.pipe(browsersync.stream())
})

// Build JS
gulp.task('js:dist', () => {
	// App
	gulp.src('./src/js/*.js')
		.pipe(plumber({
			errorHandler: error => {
				gutil.beep()
				console.log(error)
			}
		}))
		.pipe(babel({
            presets: ['env']
        }))
		.pipe(concat('app.js'))
		.pipe(gulp.dest('./dist/js'))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('./dist/js/'))
})

// Minify SVGs
gulp.task('svgmin', () => {
	return gulp.src('./src/icons/**/*.svg')
        .pipe(svgmin({
      		plugins: [{
        		cleanupIDs: false
        	}, {
        		collapseGroups: false
        	}]
        }))
        .pipe(svgstore())
        .pipe(rename('sprite.svg'))
        .pipe(gulp.dest('./dist/sprite'));
})

// Build images
gulp.task('img:dist', () => {
	return gulp.src('./src/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/img'))
})

// Copy fonts to temporary directory
gulp.task('fonts:dist', () => {
	return gulp.src('./src/fonts/*')
		.pipe(gulp.dest('./dist/fonts/'))
});

// Browsersync
gulp.task('browsersync', () => {
	browsersync.init({
		server: {
			baseDir: "./"
		}
	});
})

// Browsersync reload
gulp.task('bs-reload', () => {
	browsersync.reload();
})

// Watch
gulp.task('watch', ['js:dist', 'css:dist', 'fonts:dist', 'browsersync', 'img:dist'], () => {
	gulp.watch('./*.html', ['bs-reload']);
	gulp.watch('./src/scss/**/*.scss', ['css:dist', 'bs-reload']);
	gulp.watch(['./src/js/**/*.js'], ['js:dist', 'bs-reload']);
	gulp.watch(['./src/img/**/*'], ['img:dist', 'bs-reload']);
})

// Default build
gulp.task('default', ['css:dist', 'fonts:dist', 'js:dist', 'img:dist'])