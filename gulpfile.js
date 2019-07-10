const mainconfig = {
   combinejs : true 
};
//Подключаем галп
const gulp = require('gulp');
//Объединение файлов
const concat = require('gulp-concat');
//Добапвление префиксов
const autoprefixer = require('gulp-autoprefixer');
//Оптимизация стилей
const cleanCSS = require('gulp-clean-css');
//Оптимизация скриптов
const uglify = require('gulp-uglify');
//Удаление файлов
const del = require('del');
//Синхронизация с браузером
const browserSync = require('browser-sync').create();
//Для препроцессоров стилей
const sourcemaps = require('gulp-sourcemaps');
//Sass препроцессор
const sass = require('gulp-sass');
//Less препроцессор
const less = require('gulp-less');
//Stylus препроцессор
const stylus = require('gulp-stylus');
//Модуль для сжатия изображений
const imagemin = require('gulp-imagemin');
//Модуль переименовывания файлов
const rename = require('gulp-rename');
//Модуль для группировки медиа-запросов
const gcmq = require('gulp-group-css-media-queries');
//модуль инклуда файлов
const fileinclude = require('gulp-file-include');

//Порядок подключения файлов со стилями
const styleFiles = [   
   // './src/scss/lib.scss', 
   './src/scss/main.scss'
];
//Порядок подключения js файлов
const scriptFiles = [
   './src/js/lib.js',
   './src/js/main.js'
];

//Таск для обработки стилей
gulp.task('styles', () => {
   //Шаблон для поиска файлов CSS
   //Всей файлы по шаблону './src/css/**/*.css'
   return gulp.src(styleFiles)
      .pipe(sourcemaps.init())
      //Указать stylus() , sass() или less()
      .pipe(sass())
      //Объединение файлов в один
      .pipe(concat('style.css'))
      //Объединение медиа-запросов
      .pipe(gcmq())
      //Добавить префиксы
      .pipe(autoprefixer({
         browsers: ['last 2 versions'],
         cascade: false
      }))
      //Минификация CSS
      .pipe(cleanCSS({
         level: 2
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(rename({
         suffix: '.min'
      }))
      //Выходная папка для стилей
      .pipe(gulp.dest('./build/css'))
      .pipe(browserSync.stream());
});
//Таск для обработки html
gulp.task('html', () => {
  
   return gulp.src('./src/[^_]*.html')

      .pipe(fileinclude({
         prefix: '@@',
         basepath: '@file'
      }))
      .pipe(gulp.dest('./build'))
    
      .pipe(browserSync.stream());
});

//Таск для обработки шрифтов
gulp.task('fonts', () => {
   return gulp.src('./src/fonts/**/*.*')
      .pipe(gulp.dest('./build/fonts'))
      .pipe(browserSync.stream());
});

//Таск для обработки скриптов
gulp.task('scripts', () => {
   //Шаблон для поиска файлов JS
   //Всей файлы по шаблону './src/js/**/*.js'
   if(mainconfig.combinejs){

      return gulp.src(scriptFiles)
      //Объединение файлов в один
      .pipe(concat('script.js'))
      //Минификация JS
       .pipe(uglify({
          toplevel: true
      }))
      .pipe(rename({
          suffix: '.min'
       }))
      .pipe(gulp.dest('./build/js'))
      .pipe(browserSync.stream());
   }else{

      return gulp.src('./src/js/**/*.js')
      //Объединение файлов в один
      .pipe(gulp.dest('./build/js'))
      .pipe(browserSync.stream());
   }

});

//Таск для очистки папки build
gulp.task('del', () => {
   return del(['build/*'])
});

//Таск для сжатия изображений
gulp.task('img-compress', ()=> {
   return gulp.src('./src/images/**')
   .pipe(imagemin({
      progressive: true
   }))
   .pipe(gulp.dest('./build/images/'))
});

//Таск для отслеживания изменений в файлах
gulp.task('watch', () => {
   browserSync.init({
      server: {
         baseDir: "build"
      }
   });
   //Следить за добавлением новых изображений
   gulp.watch('./src/images/**', gulp.series('img-compress'))
   //Следить за файлами со стилями с нужным расширением
   gulp.watch('./src/scss/**/*.scss', gulp.series('styles'))
   //Следить за JS файлами
   gulp.watch('./src/js/**/*.js', gulp.series('scripts'))
   
   gulp.watch('./src/*.html', gulp.series('html'))

   gulp.watch('./src/fonts/*.*', gulp.series('fonts'))
   //При изменении HTML запустить синхронизацию
   //gulp.watch("./src/*.html").on('change', browserSync.reload);
});

//Таск по умолчанию, Запускает del, styles, scripts, img-compress и watch
gulp.task('default', gulp.series('del', gulp.parallel('styles', 'scripts', 'img-compress','html','fonts'), 'watch'));
