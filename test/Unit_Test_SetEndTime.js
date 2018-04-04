/// @file SetEndTime Unit Test
'use strict'

import EVMRevert from './helpers/EVMRevert';
import EVMInvalidAddress from './helpers/EVMInvalidAddress';
import EVMThrow from './helpers/EVMThrow';
import { increaseTimeTo } from './helpers/increaseTime';

const SDACrowdsale = artifacts.require("SDACrowdsale");
const SDAToken = artifacts.require("SDAToken");
const MockOraclizeService = artifacts.require("MockOraclizeService");
const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

let timeoutDuration = 0;
contract('SDACrowdsale', function (accounts) {
    let currentTime = web3.eth.getBlock('latest').timestamp;
    let sInst;
    let acctOne = accounts[0];
    let acctTwo = accounts[1];
    let acctThree = accounts[2];
    let acctFour = accounts[3];
    let acctFive = accounts[4];
    let acctSix = accounts[5];
    let acctSeven = accounts[6];
    let acctEight = accounts[7];
    let execAcct = accounts[9];
    let tokenCap = 300000000;
    let sTokenCap = web3.toWei(tokenCap, 'ether');
    let sStartTime;
    let sEndTime;

    let oneMinute = 60;
    let oneHour = oneMinute * 60;
    let oneDay = oneHour * 24;
    let oneMonth = oneDay * 30;

    let tokenInst;
    let oraclizeInst;

    let oneEther = web3.toWei(1, 'ether');
    let halfEther = web3.toWei(0.5, 'ether');

    let wallet = acctEight;

    it('UNIT TESTS - SDACrowdsale - Test Case 01: SetEndTime will revert with incorrect variable', async function () {
        sStartTime = currentTime + 120; // start after 120 seconds/2 minutes
        sEndTime = sStartTime + oneMonth;

        oraclizeInst = await MockOraclizeService.new({from: acctFour, value: oneEther});
        tokenInst = await SDAToken.new({from: acctFour});

        sInst = await SDACrowdsale.new(sStartTime, sEndTime, sTokenCap, wallet, tokenInst.address, oraclizeInst.address, {from: acctFour});

        // Should fail to set end time to a timestamp before Crowdsale start.
        let beforeStartTime = sStartTime - oneDay;
        await sInst.setEndTime(beforeStartTime).should.be.rejectedWith(EVMRevert);

        // fast-forward evm's timestamp
        let threeDaysAfterStartCrowdsale = sStartTime + (oneDay * 3);
        await increaseTimeTo(threeDaysAfterStartCrowdsale);

        // Should fail to set a timestamp to a moment in the past
        let twoDaysAfterStartCrowdsale = sStartTime + (oneDay * 2);
        await sInst.setEndTime(twoDaysAfterStartCrowdsale).should.be.rejectedWith(EVMRevert);
    }).timeout(timeoutDuration);

    it('UNIT TESTS - SDACrowdsale - Test Case 01: SetEndTime with correct variable', async function () {
        // extend Crowdsale to another 10 days
        let extendedEndTime = sEndTime + (10 * oneDay);
        await sInst.setEndTime(extendedEndTime, {from: acctFour});

        let actualExtendedTimestamp = await sInst.endTime.call();
        assert.equal(actualExtendedTimestamp, extendedEndTime,
            '\n      ' +
            'UNIT TESTS - SDACROWDSALE - TEST CASE 01: Test #1\n      ' +
            'TEST DESCRIPTION: Success extend Crowdsale\'s ending timestamp\n      ' +
            'EXPECTED RESULT: ' + extendedEndTime + '\n      ' +
            'ACTUAL RESULT: is ' + actualExtendedTimestamp);
    }).timeout(timeoutDuration);
});
