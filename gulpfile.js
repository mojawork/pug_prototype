'use strict';

// --- require ---
const gulp = require('gulp');
const sass = require('gulp-sass');
const gulpPug = require('gulp-pug');
const gulpRename = require("gulp-rename");
const mergeStream = require('merge-stream');
const fs = require('fs');
const yaml = require('js-yaml');
const browserSync = require('browser-sync').create();
// --- require ---

// --- config ---
const baseDir = "./dist";
const pugConfig = {
    pugViews: './src/pages/*.pug',
    pugWatchFiles: ['./src/**' + '/**/*.pug', './src/**' + '/**/*.html'],
    pugExport: {
        folder: './dist/',
        fileType: '.html'
    },
    pugData: {
        folder: './src/data/',
        // file: './src/data/index.yml',
        pugDataWatchFiles: ['./src/**' + '/**/*.yml'],
        encoding: 'utf8'
    }
};
const scssConfig = {
    scssFile: './src/scss/index.scss',
    scssWatchFiles: './src/**' + '/**/*.scss',
    scssExport: {
        folder: './dist/css/',
        fileType: '.css'
    }
};

const imageConf = {
    mainPath: 'http://'
};
// --- config ---

// --- tasks ---


gulp.task('renderPug', function (done) {

    const dataFiles = fs.readdirSync(pugConfig.pugData.folder);
    const tasks = [];
    for (var counter in dataFiles) {
        var data = yaml.safeLoad(fs.readFileSync(pugConfig.pugData.folder + dataFiles[counter], pugConfig.pugData.encoding));
        tasks.push(
            gulp.src(data.template)
                .pipe(gulpPug(
                    {
                        pretty: true,
                        data: {
                            mainPath: imageConf.mainPath,
                            data: data
                        }
                    })
                )
                .pipe(gulpRename(data.pageName + '.html'))
                .pipe(gulp.dest(pugConfig.pugExport.folder))
        );
    }
    return mergeStream(tasks);
});
gulp.task('renderScss', function () {
    return gulp.src(scssConfig.scssFile)
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(gulp.dest(scssConfig.scssExport.folder));
});

gulp.task('browser-sync', function () {
    browserSync.init({
        port : 3200,
        server: {
            baseDir: baseDir
        }
    });
});
// --- tasks ---

// --- watch task ---
gulp.task('serve', ['renderScss', 'renderPug'], function () {
    browserSync.init({
        server: {
            baseDir: baseDir
        }
    });
    gulp.watch(pugConfig.pugWatchFiles, ['renderPug']).on('change', browserSync.reload);
    gulp.watch(pugConfig.pugData.pugDataWatchFiles, ['renderPug']).on('change', browserSync.reload);
    gulp.watch(scssConfig.scssWatchFiles, ['renderScss']).on('change', browserSync.reload);

});
// --- watch task ---
