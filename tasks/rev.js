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

  grunt.registerMultiTask('rev', 'Prefix static asset file names with a content hash', function() {

    var options = this.options({
      encoding: 'utf8',
      algorithm: 'md5',
      length: 8,
      rename: false
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
          fs.createReadStream(f).pipe(fs.createWriteStream(outPath));
        }
        grunt.log.write(f + ' ').ok(renamed);

      });
    });

  });

};
