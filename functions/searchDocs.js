/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint no-console: 0 */

var fs = require('fs');

function searchDocs() {
  // create search documents that can be opened to show full results
  this.addDocs = function (data, callback) {
    // make sure docs is there
    if (!fs.existsSync('public/docs')) {
      fs.mkdirSync('public/docs');
    }

    if (data.output.hasOwnProperty('generic')) {
      var generic = data.output.generic;
      generic.forEach(function (gen) {
        if (gen.response_type === 'search') {
          var results = gen.results;
          for (var i = 0; i < results.length && i < 3; i += 1) {
            var res = results[i];
            var htmlRes = res.highlight.contentHtml;

            var text = '<html><head><title>' + res.title + '</title></head><body><strong>' +
              res.title + '</strong><br>' + htmlRes.join('') + '</body></html>';
            var path = 'public/docs/doc' + (i + 1) + '.html';
            fs.writeFile(path, text, function (err) {
              if (err) {
                console.log(err);
              }
            });
          }
        }
      });
    }
    callback();
  };
}

module.exports = searchDocs;