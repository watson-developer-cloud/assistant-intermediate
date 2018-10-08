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

'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var AssistantV1 = require('watson-developer-cloud/assistant/v1'); // watson sdk

var Actions = require('./functions/actions');
var actions = new Actions();

var BankFunctions = require('./functions/bankFunctions');
var bankFunctions = new BankFunctions();

var app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Create the service wrapper

var assistant = new AssistantV1({
  version: '2018-07-10'
});

var nextMonth = ((new Date().getMonth() + 1) % 12) + 1;
var accountData = {
  acc_minamt: 50,
  acc_currbal: 430,
  acc_paydue: '2018-' + nextMonth + '-26 12:00:00',
  accnames: [
    5624,
    5893,
    9225,
  ],
  private: {
    function_creds: {
      user: process.env.CLOUD_FUNCTION_USER,
      password: process.env.CLOUD_FUNCTION_PASS,
    },
  },
};

// Endpoint to be call from the client side
app.post('/api/message', function (req, res) {
  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }

  var contextWithAcc = Object.assign({}, req.body.context, accountData);

  var payload = {
    workspace_id: workspace,
    context: contextWithAcc || {},
    input: req.body.input || {}
  };

  // Send the input to the assistant service
  assistant.message(payload, function (err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }
    actions.testForAction(data).then(function (d) {
      return res.json(d);
    }).catch(function (error) {
      return res.json(error);
    });

  });
});

app.get('/bank/validate', function (req, res) {
  var value = req.query.value;
  var isAccValid = bankFunctions.validateAccountNumber(Number(value));
  // if accountNum is in list of valid accounts
  if (isAccValid === true) {
    res.send({ result: 'acc123valid' });
  } else {
    // return invalid by default
    res.send({ result: 'acc123invalid' });
  }
});

app.get('/bank/locate', function (req, res) {
  res.send({ result: 'zip123retrieved' });
});

module.exports = app;