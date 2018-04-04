/**
 * @file Helpers Test Case
 */

'use strict'

import { increaseTime, increaseTimeTo, duration } from './helpers/increaseTime';
import EVMRevert from './helpers/EVMRevert';
import EVMInvalidAddress from './helpers/EVMInvalidAddress';
import EVMThrow from './helpers/EVMThrow';

const SDACrowdsale = artifacts.require("SDACrowdsale");
const SDAToken = artifacts.require("SDAToken");
const MockOraclizeService = artifacts.require("MockOraclizeService");
const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();


contract('SDACrowdsale', function(accounts) {
    let currentTime = web3.eth.getBlock('latest').timestamp;
    let acctOne = accounts[0];
    let acctTwo = accounts[1];
    let acctThree = accounts[2];
    let acctFour = accounts[3];
    let sEthGoal = 1000000;
    let saleGoal = new BigNumber(web3.toWei(sEthGoal, 'ether'));
    let sEthCap = 2000000;
    let saleCap = new BigNumber(web3.toWei(sEthCap, 'ether'));
    let sStartTime;
    let sEndTime;
    let oneDayTS = 86400;
    let oneMonthTS = 2592000;
    let invalidAcct = 0x0;
    let timeoutDuration = 0;
    let sInst;
    let index = 0;

    let tokenInst;
    let oraclizeInst;

    it('UNIT TESTS - SDACrowdsale - Test Case 01: Test Set WhiteList by using invalid account (Failed Cases)', async function() {
        currentTime = web3.eth.getBlock('latest').timestamp;
        sStartTime = currentTime + oneDayTS;
        sEndTime = sStartTime + oneMonthTS;

        tokenInst = await SDAToken.new({from: acctFour});
        oraclizeInst = await MockOraclizeService.new({from: acctFour});

        sInst = await SDACrowdsale.new(sStartTime, sEndTime, saleCap, acctThree, tokenInst.address, oraclizeInst.address, {from: acctFour});
        await sInst.setWhiteList(acctOne, {from: invalidAcct}).should.be.rejectedWith(EVMInvalidAddress);

    }).timeout(timeoutDuration);

    let totalIndex = 2;
    let accountIndex = [
      {
          "account": acctOne
      },
      {
          "account": acctTwo
      },
      {
          "account": acctThree
      }
    ];

    it('UNIT TESTS - SDACrowdsale - Test Case 02: Test Set WhiteList with not whitelisted accounts (Success Cases)', async function() {

      for (let index = 0; index < totalIndex; index++){
        const element = accountIndex[index];
        await sInst.setWhiteList(element.account, {from: acctFour});
              const eventGetWhiteList = sInst.LogWhiteList(function(error, result) {
                  if (error) {
                      console.error(error);
                  }
                  if (!error) {
                      let actualInvestor = result.args.whitelisted;
                      assert.equal(actualInvestor, element.account,
                          '\n     ' +
                          'UNIT TESTS - SDACROWDSALE - TEST CASE 02: Test #' + '\n      ' +
                          'TEST DESCRIPTION: SetWhiteList and getwhiteListByIndex is called\n      ' +
                          'EXPECTED RESULT: ' + element.account + '\n      ' +
                          'ACTUAL RESULT: is ' + actualInvestor);
                  }
              });
              await sInst.getwhiteListByIndex(index);
              eventGetWhiteList.stopWatching();
          }
    }).timeout(timeoutDuration);

    it('UNIT TESTS - SDACrowdsale - Tests Case 03: Test Get WhiteList with not whitelisted account (Failed Cases)', async function(){
        await sInst.getwhiteListByIndex(2).should.be.rejectedWith(EVMRevert);
    }).timeout(timeoutDuration);

});
