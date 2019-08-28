/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Gulp script to build Blockly for Node & NPM.
 * Run this script by calling "npm install" in this directory.
 */

var gulp = require('gulp');
gulp.shell = require('gulp-shell');
gulp.concat = require('gulp-concat');
gulp.replace = require('gulp-replace');
gulp.rename = require('gulp-rename');
gulp.insert = require('gulp-insert');
gulp.umd = require('gulp-umd');
gulp.bump = require('gulp-bump');
gulp.git = require('gulp-git');

var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var execSync = require('child_process').execSync;
var semver = require('semver');


// Rebuilds Blockly, including the following:
//  - blockly_compressed.js
//  - blocks_compressed.js
//  - Localization string tables in msg/js/*.js
//  - Generators in generators/*.js
// These files are already up-to-date in the master branch.
gulp.task('build', gulp.shell.task([
  'python build.py'
]));

// Concatenates the necessary files to load Blockly in a Node.js VM.  Blockly's
// individual libraries target use in a browser, where globals (via the window
// objects) are used to share state and APIs.  By concatenating all the
// necessary components into a single file, Blockly can be loaded as a Node.js
// module.
//
// This task builds Node with the assumption that the app needs English blocks
// and JavaScript code generation.  If you need another localization or
// generator language, just copy and edit the srcs. Only one localization
// language can be included.
gulp.task('blockly_node_javascript_en', function() {
  var srcs = [
    'blockly_compressed.js',
    'blocks_compressed.js',
    'javascript_compressed.js',
    'msg/js/en.js'
  ];
  // Concatenate the sources, appending the module export at the bottom.
  // Override textToDomDocument, providing Node alternative to DOMParser.
  return gulp.src(srcs)
      .pipe(gulp.concat('blockly_node_javascript_en.js'))
      .pipe(gulp.insert.append(`
if (typeof DOMParser !== 'function') {
  var JSDOM = require('jsdom').JSDOM;
  var window = (new JSDOM()).window;
  var document = window.document;
  var Element = window.Element;
  Blockly.utils.xml.textToDomDocument = function(text) {
    var jsdom = new JSDOM(text, { contentType: 'text/xml' });
    return jsdom.window.document;
  };
}
if (typeof module === 'object') { module.exports = Blockly; }
if (typeof window === 'object') { window.Blockly = Blockly; }\n`))
      .pipe(gulp.dest('.'));
});

/**
 * Task-builder for the watch function. Currently any change invokes the whole
 * build script. Invoke with "gulp watch".
 *
 * @param {?string=} concatTask Name of the concatenating task for node usage.
 */
// TODO: Only run the necessary phases of the build script for a given change.
function buildWatchTaskFn(concatTask) {
  return function() {
    // Tasks to trigger.
    var tasks = ['build'];
    if (concatTask) {
      tasks.push(concatTask);
    }

    // Currently any changes invokes the whole build script. (To fix.)
    var srcs = [
      'core/**/*.js',                      // Blockly core code
      'blocks/*.js',                       // Block definitions
      'generators/**/*.js',                // Code generation
      'msg/messages.js', 'msg/json/*.json' // Localization data
    ];
    var options = {
      debounceDelay: 2000  // Milliseconds to delay rebuild.
    };
    gulp.watch(srcs, options, gulp.parallel(tasks));
  };
}

// Watch Blockly files for changes and trigger automatic rebuilds, including
// the Node-ready blockly_node_javascript_en.js file.
gulp.task('watch', buildWatchTaskFn('blockly_node_javascript_en'));

////////////////////////////////////////////////////////////
//                        Typings                         //
////////////////////////////////////////////////////////////

// Generates the TypeScript definition file (d.ts) for Blockly.
// As well as generating the typings of each of the files under core/ and msg/,
// the script also pulls in a number of part files from typings/parts.
// This includes the header (incl License), additional useful interfaces
// including Blockly Options and Google Closure typings
gulp.task('typings', function (cb) {
  const tmpDir = './typings/tmp';
  const blocklySrcs = [
    "core/",
    "core/theme",
    "core/utils",
    "msg/"
  ];
  // Clean directory if exists
  if (fs.existsSync(tmpDir)) {
    rimraf.sync(tmpDir);
  }
  fs.mkdirSync(tmpDir);

  // Find all files that will be included in the typings file
  let files = [];
  blocklySrcs.forEach((src) => {
	fs.mkdirSync(path.join(tmpDir, src));
    files = files.concat(fs.readdirSync(src)
      .filter(fn => fn.endsWith('.js'))
      .map(fn => path.join(src, fn)));
  });

  // Generate typings file for each file
  files.forEach((file) => {
    const typescriptFileName = `${path.join(tmpDir, file)}.d.ts`;
    const cmd = `node ./node_modules/typescript-closure-tools/definition-generator/src/main.js --include_private true ${file} ${typescriptFileName}`;
    console.log(`Generating typings for ${file}`);
    execSync(cmd, { stdio: 'inherit' });
  });

  const srcs = [
    'typings/parts/**',
    `${tmpDir}/core/**`,
    `${tmpDir}/core/utils/**`,
    `${tmpDir}/core/theme/**`,
    `${tmpDir}/msg/**`
  ];
  return gulp.src(srcs)
    .pipe(gulp.concat('blockly.d.ts'))
    .pipe(gulp.dest('typings'))
    .on('end', function () {
      // Clean up tmp directory
      if (fs.existsSync(tmpDir)) {
        rimraf.sync(tmpDir);
      }
    });
});


////////////////////////////////////////////////////////////
//                        PXT                             //
////////////////////////////////////////////////////////////


function pxtPublishTask() {
	if (fs.existsSync('../pxt')) {
		pxtPublishTsTask();
		gulp.src('./blocks_compressed.js').pipe(gulp.dest('../pxt/webapp/public/blockly/'));
		gulp.src('./blockly_compressed.js').pipe(gulp.dest('../pxt/webapp/public/blockly/'));
		gulp.src('./msg/js/en.js').pipe(gulp.dest('../pxt/webapp/public/blockly/msg/js/'));
		gulp.src('./msg/json/en.json').pipe(gulp.dest('../pxt/webapp/public/blockly/msg/json/'));
		return gulp.src('./media/**/*').pipe(gulp.dest('../pxt/webapp/public/blockly/media/'));
	}
}

function pxtPublishTsTask() {
	if (fs.existsSync('../pxt')) {
		return gulp.src('./typings/blockly.d.ts').pipe(gulp.dest('../pxt/localtypings/'));
	}
}

// Task for building pxt-blockyl, and copying files over to pxt
gulp.task('publish', gulp.series(['build', pxtPublishTask]));

// Task for bumping patch version and tagging commit. Travis will upload to npm.
gulp.task('bump', function (done) {
  var v = semver.inc(JSON.parse(fs.readFileSync('./package.json', 'utf8')).version, 'patch');
  gulp.src('./package.json')
    .pipe(gulp.bump({ "version": v }))
    .pipe(gulp.dest('./'));

  gulp.src('.')
    .pipe(gulp.git.add())
    .pipe(gulp.git.commit(v))
    .on('end', function () {
      gulp.git.tag('v' + v, v, function (error) {
        if (error) {
          return done(error);
        }
        gulp.git.push('origin', '', { args: '--tags' }, done);
      })
    });
});

// The default task concatenates files for Node.js, using English language
// blocks and the JavaScript generator.
gulp.task('default', gulp.series(['build', 'blockly_node_javascript_en']));