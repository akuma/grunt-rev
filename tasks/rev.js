/*
 * grunt-rev
 * https://github.com/cbas/grunt-rev
 *
 * Copyright (c) 2013 Sebastiaan Deckers
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs'),
  path = require('path'),
  crypto = require('crypto');

module.exports = function(grunt) {

  function md5(filepath, algorithm, encoding, fileEncoding) {
    var hash = crypto.createHash(algorithm);
    grunt.log.verbose.write('Hashing ' + filepath + '...');
    hash.update(grunt.file.read(filepath), fileEncoding);
    return hash.digest(encoding);
  }

  function getNameAndExtension(filename) {
    var i = filename.lastIndexOf('.'),
        name = (i < 0) ? filename : filename.substr(0, i),
        ext = (i < 0) ? '' : filename.substr(i + 1);
    return {name: name, ext: ext};
  }

  function copyFileSync(src, dest) {
    var BUF_LENGTH = 8 * 1024, 
        buff = new Buffer(BUF_LENGTH),
        input = fs.openSync(src, "r"),
        output = fs.openSync(dest, "w");

    var bytesRead, pos;

    while (bytesRead = fs.readSync(input, buff, 0, BUF_LENGTH, pos)) {
      fs.writeSync(output, buff, 0, bytesRead);
      pos += bytesRead;
    }
    fs.closeSync(input);
    return fs.closeSync(output);
  }

  grunt.registerMultiTask('rev', 'Prefix static asset file names with a content hash', function() {

    var options = this.options({
      encoding: 'utf8',
      algorithm: 'md5',
      length: 8,
      rename: true
    });

    this.files.forEach(function(filePair) {
      filePair.src.forEach(function(f) {

        var hash = md5(f, options.algorithm, 'hex', options.encoding),
            prefix = hash.slice(0, options.length),
            filename = path.basename(f),
            nameAndExt = getNameAndExtension(filename),
            renamed = [nameAndExt.name, prefix, nameAndExt.ext].join('.'),
            outPath = path.resolve(path.dirname(f), renamed);

        grunt.verbose.ok().ok(hash);

        if (options.rename) {
          fs.renameSync(f, outPath);
        } else {
          copyFileSync(f, outPath);
        }
        grunt.log.write(f + ' ').ok(renamed);

      });
    });

  });

};
