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
    let acctFive = accounts[4];
    let acctSix = accounts[5];
    let acctSeven = accounts[6];
    let acctEight = accounts[7];
    let execAcct = accounts[9];
    let sEthGoal = 1000000;
    let saleGoal = new BigNumber(web3.toWei(sEthGoal, 'ether'));
    let sEthCap = 2000000;
    let saleCap = new BigNumber(web3.toWei(sEthCap, 'ether'));
    let invalidAcct = 0x0;
    let timeoutDuration = 0;
    let sInst;
    let index = 0;
    let oneMinute = 60;
    let oneHour = 60 * oneMinute;
    let oneDay = 24 * oneHour;
    let oneMonth = 30 * oneDay;
    let oneDayTS = 86400;
    let oneMonthTS = 2592000;
    let sStartTime;
    let sEndTime;
    let tokenInst;
    let oraclizeInst;

    // -- In order to test the tier cap test case, tier default value require to change --
    // -- Temporary replace the **default tier token cap** value to example below :     --

    // Tier[1].tokenCap = 350000 * 10 ** 18;
    // Tier[2].tokenCap = 700000 * 10 ** 18;
    // Tier[3].tokenCap = 900000 * 10 ** 18;
    // Tier[4].tokenCap = 1200000 * 10 ** 18;


    it('UNIT TESTS - SDACrowdsale - Test Case 15: Buy Token-Test Valid Purchase (ethers exceed cap amount)', async function() {
        let sendEther = web3.toWei(20, 'ether');
        let etherPrice;

        sStartTime = web3.eth.getBlock('latest').timestamp + oneDayTS;
        sEndTime = sStartTime + oneMonthTS * 2;

        tokenInst = await SDAToken.new({from: acctFour});
        oraclizeInst = await MockOraclizeService.new({from: acctFour});
        sInst = await SDACrowdsale.new(sStartTime, sEndTime, saleCap, acctEight, tokenInst.address, oraclizeInst.address, {from: acctFour});

        await sInst.setWhiteList(acctSix, {from: acctFour}).should.not.be.rejectedWith(EVMRevert);
        await sInst.setWhiteList(acctThree, {from: acctFour}).should.not.be.rejectedWith(EVMRevert);

        // Ps. the test case is using 1 ether = USD 1171.43, u may need to hardcode the value to ensure the test case run smoothly
        // 1 ether =  1171.43 USD = 16400.02 token
        // purchase with 20 ether get 328000.4 token
        //
        do {
            await sInst.getCurrentEtherPrice();
            etherPrice = await sInst.etherPrice.call();
        } while (etherPrice.toNumber() == 0);

        // T1
        increaseTimeTo(sStartTime + oneDay);
        // should not fail because it under T1 cap
        await sInst.buyTokens(acctSix, { from: acctSix, gas: 2000000, value: sendEther}).should.not.be.rejectedWith(EVMRevert);
        // should fail because it reach max cap
        await sInst.buyTokens(acctSix, { from: acctSix, gas: 2000000, value: sendEther}).should.be.rejectedWith(EVMRevert);

        // T2
        increaseTimeTo(sStartTime + 11 * oneDay); //forward to T2
        // should not fail because it under T2 cap
        await sInst.buyTokens(acctThree, { from: acctThree, gas: 2000000, value: sendEther}).should.not.be.rejectedWith(EVMRevert);
        // should fail because it reach max cap
        await sInst.buyTokens(acctThree, { from: acctThree, gas: 2000000, value: sendEther}).should.be.rejectedWith(EVMRevert);

        // T3
        increaseTimeTo(sStartTime + 21 * oneDay); //forward to T3
        // should not fail because it under T3 cap
        await sInst.buyTokens(acctSix, { from: acctSix, gas: 2000000, value: sendEther}).should.not.be.rejectedWith(EVMRevert);
        // should fail because it reach max cap
        await sInst.buyTokens(acctSix, { from: acctSix, gas: 2000000, value: sendEther}).should.be.rejectedWith(EVMRevert);

        // T4
        increaseTimeTo(sStartTime + 34 * oneDay); //forward to T4
        // should not fail because it under T4 cap
        await sInst.buyTokens(acctThree, { from: acctThree, gas: 2000000, value: sendEther}).should.not.be.rejectedWith(EVMRevert);
        // should fail because it reach max cap
        await sInst.buyTokens(acctSix, { from: acctSix, gas: 2000000, value: web3.toWei(40, 'ether')}).should.be.rejectedWith(EVMRevert);

    }).timeout(timeoutDuration);

});
