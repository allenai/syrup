/**
 * Default paths for a typical syrup installation.
 */
 module.exports = {
   base: process.cwd(),
   src: 'app',
   html: 'app/index.html',
   allLess: 'app/**/*.less',
   less: 'app/main.less',
   jshint: 'app/**/*.js',
   js: 'app/app.js',
   assets: 'app/assets/**/*',
   fonts: 'node_modules/syrup/fonts/**/*',
   build: 'build',
   watch: 'app',
   tmp: 'tmp',
   unitTests: 'app/**/*-test.js',
   unitTestConfig: 'unit-tests.conf.js',
   integrationTestConfig: 'integration-tests.conf.js',
   integrationTests: 'integration-tests/**/*-it.js'
 };
