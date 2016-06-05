var gulp         = require('gulp'),
    del          = require('del'),
    run          = require('gulp-run'),
    less         = require('gulp-less'),
    cssmin       = require('gulp-minify-css'),
    browserify   = require('browserify'),
    uglify       = require('gulp-uglify'),
    concat       = require('gulp-concat'),
    jshint       = require('gulp-jshint'),
    source       = require('vinyl-source-stream'),
    buffer       = require('vinyl-buffer'),
    reactify     = require('reactify'),
    glob         = require('glob'),
    babel        = require('gulp-babel'),
    sourcemaps   = require('gulp-sourcemaps'),
    environments = require('gulp-environments'),
    coffee       = require('coffee-script'),
    fs           = require('fs'),
    path         = require('path'),
    pack         = require('./package.json');

var development = environments.development;
var production  = environments.production;

gulp.task('less', function() {
    return gulp.src(pack.paths.source.less)
        .pipe(less())
        .pipe(concat(pack.paths.build.css))
        .pipe(production(cssmin()))
        .pipe(gulp.dest(pack.paths.build.dir));
});

gulp.task('scripts', function() {
    glob(pack.paths.source.js, function(err, files) {
        var opts = {
            entries: files,
            debug:   development()
        };
        
        return browserify(opts)
            .transform(reactify)
            .bundle()
            .pipe(development(source(pack.paths.build.js)))
            .pipe(production(source(pack.paths.build.js)))
            .pipe(buffer())
            .pipe(production(uglify()))
            .pipe(gulp.dest(pack.paths.build.dir));
    });
});

gulp.task('babel', function() {
    return gulp.src(pack.paths.source.babel)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ["es2015-loose"],
            plugins: ["add-module-exports", "transform-es2015-destructuring", "transform-es2015-for-of"]
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(pack.paths.build.babel));
});

gulp.task('build-player', function() {
    var order = [
        'base.coffee',
        'vimeo.coffee',
        'youtube.coffee',
        'dailymotion.coffee',
        'videojs.coffee',
        'raw-file.coffee',
        'soundcloud.coffee',
        'embed.coffee',
        'twitch.coffee',
        'livestream.com.coffee',
        'custom-embed.coffee',
        'rtmp.coffee',
        'hitbox.coffee',
        'ustream.coffee',
        'imgur.coffee',
        'gdrive-youtube.coffee',
        'update.coffee'
    ];
    
    var buffer = '';
    order.forEach(function (file) {
        buffer += fs.readFileSync(path.join('player', file)) + '\n';
    });
    
    fs.writeFileSync(path.join('www', 'js', 'player.js'), coffee.compile(buffer));
});

gulp.task('default', ['less', 'scripts']);

gulp.task('watch', ['default'], function() {
    var dirs = [
        pack.paths.source.js,
        pack.paths.source.less
    ];
    
    gulp.watch(dirs, ['default']);
    gulp.watch([pack.paths.source.babel], ['babel']);
});

