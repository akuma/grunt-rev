/*
 * grunt-rev
 * https://github.com/cbas/grunt-rev
 *
 * Copyright (c) 2013 Sebastiaan Deckers
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var BUF_LENGTH = 8 * 1024;

module.exports = function(grunt) {

  function getHash(filepath, encoding, options) {
    var hash = crypto.createHash(options.algorithm);
    grunt.log.verbose.write('Hashing ' + filepath + '...');
    hash.update(grunt.file.read(filepath), options.encoding);
    hash = hash.digest(encoding);
    return hash.slice(0, options.length);
  }

  function copyFileSync(src, dest) {
    var buff = new Buffer(BUF_LENGTH);
    var input = fs.openSync(src, "r");
    var output = fs.openSync(dest, "w");

    var bytesRead, pos;

    while (bytesRead = fs.readSync(input, buff, 0, BUF_LENGTH, pos)) {
      fs.writeSync(output, buff, 0, bytesRead);
      pos += bytesRead;
    }
    fs.closeSync(input);
    return fs.closeSync(output);
  }

  grunt.registerMultiTask('rev', 'Add a content hash to static asset file names', function() {

    var options = this.options({
      encoding: 'utf8',
      algorithm: 'md5',
      length: 8,
      rename: true,
      version: undefined
    });

    var versions = {};

    this.files.forEach(function(filePair) {
      filePair.src.forEach(function(f) {

        var rev = getHash(f, 'hex', options);
        var ext = path.extname(f);
        var basename = path.basename(f, ext);
        var renamed = basename + '.' + rev + ext;
        var outPath = path.join(path.dirname(f), renamed);

        //grunt.verbose.ok().ok(rev);

        if (options.rename) {
          fs.renameSync(f, outPath);
        } else {
          copyFileSync(f, outPath);
        }

        if (options.version) {
          // Get the origin file path, e.g. js/global.min.js
          var origin = f.split(path.sep).slice(1).join(path.sep);
          // Mapping origin file path to hashed file path
          versions[origin] = outPath.split(path.sep).slice(1).join(path.sep);
        }

        grunt.log.write(f + ' ').ok(outPath);
      });
    });

    if (options.version) {
      grunt.file.write(options.version, JSON.stringify(versions, null, ' '));
      grunt.log.write('Version file ' + options.version + ' created.').ok();
    }
  });

};
