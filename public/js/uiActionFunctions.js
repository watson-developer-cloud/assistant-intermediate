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
/* eslint no-unused-vars: "off" */

var UiActions = (function () {

  // Publicly accessible methods defined
  return {
    getUiAction: getUiAction,
  };

  function getCurrencyFormat() {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  }

  function getUiAction(ui_action, responses) {
    if (ui_action.hasOwnProperty('cc_displaystatement')) {
      var dis = ui_action.cc_displaystatement;
      var balance = dis['Total Balance'];
      var recPay = dis['Payment Amount'];
      var accountId = dis.Account;
      var html = getRemainingStatementBalance(balance, accountId, 0, recPay);
      responses.push({
        'type': 'ui-action',
        'innerhtml': html
      });
    } else if (ui_action.hasOwnProperty('cc_selecteddisplay')) {
      var elements = '';
      var cardCriteria = ui_action.cc_selecteddisplay.CardCriteria;

      var cards = getDisplayCard(cardCriteria);

      cards.forEach(function (card) {
        var element = getSelectedDisplay(card);
        elements += element;
      });
      responses.push({
        'type': 'ui-action',
        'innerhtml': elements
      });
    } else if (ui_action.hasOwnProperty('appointment_display')) {
      var app = ui_action.appointment_display;
      responses.push({
        'type': 'ui-action',
        'innerhtml': getAppoitmentDisplay(app)
      });
    }
  }

  function getAppoitmentDisplay(app) {
    var zipcode = app.address;
    zipcode = zipcode.substring(0, zipcode.indexOf(','));
    var element = '<div class="card">' +
      '<div class="card-header">' +
      '<p>Local Bank</p>' +
      '<p>132 14th Ave.</p>' +
      '<p>Local Town, ' + zipcode + '</p>' +
      '</div>' +
      '<div class="card-content">' +
      '<div class="appoitment-item">' +
      '<div>' +
      '<p>' + app.date + '</p>' +
      '<p>' + app.time + '</p>' +
      '<p>With Emma Banker</p>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
    return element;
  }

  function getSelectedDisplay(card) {
    var element = '<div class="card">' +
      '<div class="card-header">' +
      '<p>' + card.cardName + '</p>' +
      '</div>' +
      '<div class="card-content">' +
      '<div class="card-item">' +
      '<p>' + card.description + '</p>' +
      '</div>' +
      '</div>' +
      '</div><br>';
    return element;
  }

  function getDisplayCard(displayCards) {
    var cards = [
      {
        id: 0,
        value: 'Travel Rewards',
        cardName: 'Travel Rewards',
        description: '$150 online cash rewards bonus offer',
      },
      {
        id: 1,
        value: 'Saving',
        cardName: 'The Mega Saver',
        description: 'Save on interest to help pay down your balance faster',
      },
      {
        id: 2,
        value: 'Credit Level',
        cardName: 'Mega Credit Card',
        description: 'For users with good credit.',
      },
      {
        id: 3,
        value: 'Cash Rewards',
        cardName: 'The Ultimate Cash Back Card',
        description: 'Get the most cash back for your purchases',
      },
      {
        id: 4,
        value: 'General Rewards',
        cardName: 'The Balanced Rewards Card',
        description: 'Just the right amount of all rewards',
      },
    ];

    return cards.filter(function (card) {
      return displayCards.includes(card.value);
    });
  }

  function getRemainingStatementBalance(balance, accountId, minPayment, recPayment) {
    var cf = getCurrencyFormat();
    var element = '<div class="card">' +
      '<div class="card-header">' +
      '<p>Remaining Statement Balance</p>' +
      '<p>' + cf.format(balance) + '</p>' +
      '</div>' +
      '<div class="card-content">' +
      '<div class="card-item">' +
      '<p>Account ending in ' + accountId + '</p>' +
      '</div>' +
      '<div class="card-item">' +
      '<p>Minimum payment due</p>' +
      '<p>' + cf.format(minPayment) + '</p>' +
      '</div>' +
      '<div class="card-item">' +
      '<p>Recent payments</p>' +
      '<p>' + cf.format(recPayment) + '</p>' +
      '</div>' +
      '</div>' +
      '</div>';
    return element;
  }
}());