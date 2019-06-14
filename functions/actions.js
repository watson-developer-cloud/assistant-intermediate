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
/* eslint no-undef: 0 */

function actions() {

  var http = require('http');

  this.testForAction = function (data, sessionId) {
    return new Promise(function (resolve, reject) {
      if (data.output.hasOwnProperty('actions')) {
        data.output.actions.forEach(function (action) {
          var endPoint = '';
          var value = '';
          var sendType = '';
          if (action.name === 'ValidateAcc') {
            endPoint = '/bank/validate';
            value = action.parameters.chosen_acc;
            sendType = action.result_variable;
            bankCalls(endPoint, value, sendType, sessionId, resolve, reject);
          } else if (action.name === 'RetrieveZip') {
            endPoint = '/bank/locate';
            value = action.parameters.zip_value;
            sendType = action.result_variable;
            bankCalls(endPoint, value, sendType, sessionId, resolve, reject);
          }
        });
      } else {
        resolve(data);
      }
    });
  };

  function bankCalls(endPoint, value, sendType, sessionId, resolve, reject) {
    // construct the endpoint based on which client action
    var parameterizedEndpoint = endPoint + '?value=' + value;
    http.get({
      path: parameterizedEndpoint,
      port: process.env.PORT || 3000,
      headers: {
        'Content-type': 'application/json'
      }
    }, function (resp) {
      resp.on('data', function (res) {
        sendMessage(JSON.parse(res), value, sendType, sessionId, resolve, reject);
      });
      resp.on('end', function () {
      });
    }).on('error', function (err) {
      reject(err);
    });
  }

  function sendMessage(res, value, sendType, sessionId, resolve, reject) {
    var parameterizedEndpoint = '/api/message';

    var payloadToWatson = {
      'session_id': sessionId
    };
    
    payloadToWatson.input = {text : ''};

    if (sendType === 'input.text') {
      payloadToWatson.input.text = res.result;
    } else if (sendType.includes('context.')) {
      var name = sendType.substring(sendType.indexOf('.') + 1);
      payloadToWatson.input.text = res.result;
      payloadToWatson.context = {'skills' : {'main skill' : {'user_defined' : {}}}};
      payloadToWatson.context.skills['main skill'].user_defined[name] = value;
    }

    var dataStr = JSON.stringify(payloadToWatson);

    var req = http.request({
      path: parameterizedEndpoint,
      port: process.env.PORT || 3000,
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    }, function (resp) {
      resp.on('data', function (res) {
        resolve(JSON.parse(res));
      });
      resp.on('end', function () {
      });
    }).on('error', function (err) {
      reject(err);
    });

    req.write(dataStr);
    req.end();
  }
}

module.exports = actions;
