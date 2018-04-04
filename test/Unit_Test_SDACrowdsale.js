/**
 * @file SDACrowdsale Test Case
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

let timeoutDuration = 0;

contract('SDACrowdsale', function (accounts) {
    let currentTime = web3.eth.getBlock('latest').timestamp;
    let sInst;
    let sAddress;
    let acctOne = accounts[0];
    let acctTwo = accounts[1];
    let acctThree = accounts[2];
    let acctFour = accounts[3];
    let acctFive = accounts[4];
    let acctSix = accounts[5];
    let acctSeven = accounts[6];
    let acctEight = accounts[7];
    let execAcct = accounts[9];
    let blankAcct = 0x0;
    let acctOneBal;
    let acctTwoBal;
    let sEthGoal = 1000000;
    let saleGoal = new BigNumber(web3.toWei(sEthGoal, 'ether'));
    let sEthCap = 2000000;
    let saleCap = new BigNumber(web3.toWei(sEthCap, 'ether'));
    let sStartTime;
    let sEndTime;
    let oneMinute = 60;
    let oneHour = 60 * oneMinute;
    let oneDay = 24 * oneHour;
    let oneMonth = 30 * oneDay;

    let tokenInst;
    let tokenTotalSupply = new BigNumber(1e9);

    let oraclizeInst;

    it('UNIT TESTS - SDACrowdsale - Test Case 01: Cannot deploy SDACrowdsale with incorrect variables', async function () {
        currentTime = web3.eth.getBlock('latest').timestamp;
        sStartTime = currentTime + oneDay;
        sEndTime = sStartTime + oneMonth;

        let expiredStart = currentTime - oneDay;
        let invalidAcct = 0x0;
        let invalidAddr = 0x0;

        tokenInst = await SDAToken.new({from: acctFour});
        oraclizeInst = await MockOraclizeService.new({from: acctFour});

        // Should fail to create Crowdsale with expired date.
        await SDACrowdsale.new(expiredStart, sEndTime, saleCap, acctEight, tokenInst.address, oraclizeInst.address, {from: acctFour}).should.be.rejectedWith(EVMRevert);

        // Should fail to create Crowdsale with endTime before startTime
        await SDACrowdsale.new(sEndTime, sStartTime, saleCap, acctEight, tokenInst.address, oraclizeInst.address, {from: acctFour}).should.be.rejectedWith(EVMRevert);

        // Should fail to create Crowdsale with goal higher than cap
        // await SDACrowdsale.new(sStartTime, sEndTime, saleCap, saleGoal, acctEight, {from: acctFour}).should.be.rejectedWith(EVMRevert);

        // Should fail to create Crowdsale with blank/invalid wallet address (0x0)
        await SDACrowdsale.new(sStartTime, sEndTime, saleCap, invalidAcct, tokenInst.address, oraclizeInst.address, {from: acctFour}).should.be.rejectedWith(EVMRevert);

        // Should fail to create Crowdsale with blank/invalid token address (0x0)
        await SDACrowdsale.new(sStartTime, sEndTime, saleCap, acctEight, invalidAddr, oraclizeInst.address, {from: acctFour}).should.be.rejectedWith(EVMRevert);

        // Should fail to create Crowdsale with blank/invalid oraclize contract address (0x0)
        await SDACrowdsale.new(sStartTime, sEndTime, saleCap, acctEight, tokenInst.address, invalidAddr, {from: acctFour}).should.be.rejectedWith(EVMRevert);
    }).timeout(timeoutDuration);

    it('UNIT TESTS - SDACrowdsale - Test Case 02: SDACrowdsale is deployed', async function () {
        currentTime = web3.eth.getBlock('latest').timestamp;
        sStartTime = currentTime;
        sEndTime = sStartTime + oneMonth * 2;

        sInst = await SDACrowdsale.new(sStartTime, sEndTime, saleCap, acctEight, tokenInst.address, oraclizeInst.address, {from: acctFour});

        // Should not be null, if success deployed
        assert.isNotNull(sInst,
            '\n     ' +
            'UNIT TESTS - SDACROWDSALE - TEST CASE 02: Test #1\n      ' +
            'TEST DESCRIPTION: SDACrowsale not initialized\n      ' +
            'EXPECTED RESULT: not null\n      ' +
            'ACTUAL RESULT: is ' + sInst);

        let initialTokenSupply = await tokenInst.balanceOf.call(acctFour);

        assert.equal((web3.fromWei(initialTokenSupply, 'ether')).toNumber(), tokenTotalSupply.toNumber(),
            '\n     ' +
            'UNIT TESTS - SDACROWDSALE - TEST CASE 03: Test #2\n      ' +
            'TEST DESCRIPTION: SDAToken initial token supply\n      ' +
            'EXPECTED RESULT: ' + tokenTotalSupply + '\n      ' +
            'ACTUAL RESULT: ' + web3.fromWei(initialTokenSupply, 'ether'));
    }).timeout(timeoutDuration);

    it('UNIT TESTS - SDACrowdsale - Test Case 03: Set WhiteList (Failed Cases)', async function() {
        // Should fail to call function setWhiteList from different wallet
        await sInst.setWhiteList(acctTwo, {from: acctOne}).should.be.rejectedWith(EVMRevert);

        // Should fail to call function setWhiteList, if blank address was passed as parameter
        await sInst.setWhiteList(blankAcct, {from: acctFour}).should.be.rejectedWith(EVMRevert);
    }).timeout(timeoutDuration);

    it('UNIT TESTS - SDACrowdsale - Test Case 04: Set WhiteList (Success Cases)', async function() {
        // Should success to call function setWhiteList from deployed wallet
        await sInst.setWhiteList(acctTwo, {from: acctFour}).should.not.be.rejectedWith(EVMRevert);
    });

    // Variables for calculatePrice
    let tokenSaleTier = 4;
    let oneEth = web3.toWei(1, 'ether');
    let curEtherPriceInUSD = 70000;
    let curEtherPriceInUSDWithFloatingPoint = 130686;
    let serviceFee = 2; // 2%
    const multiplier = Math.pow(10, 18);
    let tmpTestValue = web3.toBigNumber((1306.86 * multiplier).toString());
    let tokenSalePrice = [
        {
            "price": 7,
            "expectedTokenAmount": web3.toBigNumber((((700 * 98) / 7) * multiplier).toString()),
            "expectedTokenAmount_case_1": 18296.04
        },
        {
            "price": 8,
            "expectedTokenAmount": web3.toBigNumber((((700 * 98) / 8) * multiplier).toString()),
            "expectedTokenAmount_case_1": 16009.035
        },
        {
            "price": 9,
            "expectedTokenAmount": web3.toBigNumber((((700 * 98) / 9) * multiplier).toString()),
            "expectedTokenAmount_case_1": 14230.253333
        },
        {
            "price": 10,
            "expectedTokenAmount": web3.toBigNumber((((700 * 98) / 10) * multiplier).toString()),
            "expectedTokenAmount_case_1": 12807.228
        }
    ];
    let decimals = 18; // 1 Ether = 10 ** 18

    it('UNIT TESTS - SDACrowdsale - Test Case 05: Cannot call calculatePrice with incorrect variables.', async function() {
        let zeroEth = 0;
        let zeroEthPriceInUSD = 0;
        let zeroServiceFee = 0;
        let zeroTokenSalePrice = 0;
        let zeroDecimals = 0;

        for (let index = 0; index < tokenSaleTier; index++) {
            const element = tokenSalePrice[index];

            // Should fail, if zero ether was received
            await sInst.calculatePrice(zeroEth, curEtherPriceInUSD, serviceFee,element.price, decimals).should.be.rejectedWith(EVMRevert);

            // Should fail, if zero service fee was received
            await sInst.calculatePrice(oneEth, curEtherPriceInUSD, zeroServiceFee, element.price, decimals).should.be.rejectedWith(EVMRevert);

            // Should fail, if zero ether price in USD was received
            await sInst.calculatePrice(oneEth, zeroEthPriceInUSD, serviceFee, element.price, decimals).should.be.rejectedWith(EVMRevert);

            // Should fail, if zero decimals was received
            await sInst.calculatePrice(oneEth, curEtherPriceInUSD, serviceFee, element.price, zeroDecimals).should.be.rejectedWith(EVMRevert);
        }

        // Should fail, if zero token price was received
        await sInst.calculatePrice(oneEth, curEtherPriceInUSD, serviceFee, zeroTokenSalePrice, decimals).should.be.rejectedWith(EVMRevert);
    }).timeout(timeoutDuration);

    it('UNIT TESTS - SDACrowdsale - Test Case 06: Call calculatePrice with correct variables', async function() {
        for (let index = 0; index < tokenSaleTier; index++) {
            const element = tokenSalePrice[index];

            const evtWatch = sInst.LogEtherToToken();

            await sInst.calculatePrice(oneEth, curEtherPriceInUSD, serviceFee, element.price, decimals);

            const watchResult = evtWatch.get();

            let actualTokenAmountCaseOne = watchResult[0].args.tokenAmount.toNumber();
            assert.equal(actualTokenAmountCaseOne, element.expectedTokenAmount.toString(),
                '\n     ' +
                'UNIT TESTS - SDACROWDSALE - TEST CASE 06: Test #' + index + '\n      ' +
                'TEST DESCRIPTION: calculatePrice is called\n      ' +
                'EXPECTED RESULT: ' + element.expectedTokenAmount.toString() + '\n      ' +
                'ACTUAL RESULT: is ' + actualTokenAmountCaseOne);
        }
    }).timeout(timeoutDuration);

    it('UNIT TESTS - SDACrowdsale - Test Case 07: Call calculatePrice with correct variables (Test decimals points)', async function() {
        for (let i = 0; i < tokenSaleTier; i++) {
            const elementCaseTwo = tokenSalePrice[i];

            const evtWatch = sInst.LogEtherToToken();

            await sInst.calculatePrice(oneEth, curEtherPriceInUSDWithFloatingPoint, serviceFee, elementCaseTwo.price, decimals);

            const watchResult = evtWatch.get();

            let actualTokenAmountCaseTwo = new BigNumber(web3.fromWei(watchResult[0].args.tokenAmount, 'ether'));
            assert.equal(actualTokenAmountCaseTwo.toFixed(3), elementCaseTwo.expectedTokenAmount_case_1.toFixed(3),
                '\n     ' +
                'UNIT TESTS - SDACROWDSALE - TEST CASE 07: Test #' + i + '\n      ' +
                'TEST DESCRIPTION: calculatePrice is called and EtherPriceInUSD come with 2 decimals point\n      ' +
                'EXPECTED RESULT: ' + elementCaseTwo.expectedTokenAmount_case_1.toString() + '\n      ' +
                'ACTUAL RESULT: is ' + actualTokenAmountCaseTwo);
        }
    }).timeout(timeoutDuration);

    it('UNIT TESTS - SDACrowdsale - Test Case 09: Buy Token (Failed Cases)', async function() {
        let sendEther = web3.toWei(20, 'ether');

        // Should fail to buy token with empty ether value
        await sInst.buyTokens(acctTwo, { from: acctTwo, gas: 1000000, value: 0}).should.be.rejectedWith(EVMRevert); // acctTwo already in whitelist
        // Should fail to buy token with blank Account
        await sInst.buyTokens(blankAcct, { from: acctTwo, gas: 1000000, value: sendEther}).should.be.rejectedWith(EVMRevert);
        // Should fail due to acctSeven not in whitelist
        await sInst.buyTokens(acctSeven, { from: acctSeven, gas: 1000000, value: sendEther}).should.be.rejectedWith(EVMRevert);

    }).timeout(timeoutDuration);

    it('UNIT TESTS - SDACrowdsale - Test Case 10: Buy Token (Success Cases)', async function() {
        let sendEther = web3.toWei(20, 'ether');
        let etherPrice;

        await console.log("Please wait...");
        do {
            await sInst.getCurrentEtherPrice();
            etherPrice = await sInst.etherPrice.call();
        } while (etherPrice.toNumber() == 0);

        const evtWatch = sInst.LogTokenPurchase();

        await sInst.buyTokens(acctTwo, {from: acctTwo, gas: 2000000, value: sendEther});

        const watchResult = evtWatch.get();

        let logResult = watchResult[0].args;
        assert.equal(sendEther, logResult._value.toNumber(),
            '\n     ' +
            'UNIT TESTS - SDACROWDSALE - TEST CASE 10: Shoud Log 2 ether after purchase\n      ' +
            'TEST DESCRIPTION: Buy Token is called\n      ' +
            'EXPECTED RESULT: ' + sendEther + '\n      ' +
            'ACTUAL RESULT: is ' + logResult._value.toNumber());
    }).timeout(timeoutDuration);

    /**
     * Just to ensure the etherPrice was updated.
     */
    // it('UNIT TESTS - SDACrowdsale - Test Case 11: Oraclize Service', async function() {
    //     let before = Date.now();
    //     let etherPrice;

    //     do {
    //         etherPrice = await sInst.etherPriceInUSD.call();
    //     } while (etherPrice.toNumber() == 0);

    //     console.log(etherPrice.toNumber());

    //     let after = Date.now();

    //     let diff = after - before;
    //     console.log(diff);
    // }).timeout(timeoutDuration);

    // Dummy new wallet address fot testing
    let newWallet = acctSeven;

    it('UNIT TESTS - SDACrowdsale - Test Case 11: Address Migration (Failed Cases)', async function() {
        // Should fail because account five not in whilist
        await sInst.addressMigrations(acctFive,  newWallet, {from: acctFour}).should.be.rejectedWith(EVMRevert);

        // Set account five into whilist, but still fail because target migrate address already have sdatoken value;
        await sInst.setWhiteList(acctFive, {from: acctFour}).should.not.be.rejectedWith(EVMRevert);
        await sInst.addressMigrations(acctFive,  acctTwo, {from: acctFour}).should.be.rejectedWith(EVMRevert);
    }).timeout(timeoutDuration);

    // it('UNIT TESTS - SDACrowdsale - Test Case 12: Address Migration (Success Cases)', async function() {
    //     let oldWallet = acctTwo; // Already received token via buy token function from test case 10
    //     let oldWalletToken = await sInst.Investor(oldWallet);

    //     const eventAddressMIgration = sInst.LogAddressMigration(function(error, result) {
    //         if (error) {
    //             console.error(error);
    //         }

    //         if (!error) {
    //             let logResult = result.args;
    //             assert.equal(newWallet, logResult.newAddress,
    //                 '\n     ' +
    //                 'UNIT TESTS - SDACROWDSALE - TEST CASE 12: Test #1 Event Log new address param should same with requested new address\n      ' +
    //                 'TEST DESCRIPTION: AddresscMigrations is called\n      ' +
    //                 'EXPECTED RESULT: ' + newWallet + '\n      ' +
    //                 'ACTUAL RESULT: is ' + logResult.newAddress);

    //             assert.equal(oldWalletToken[1].toNumber(), logResult.newSdaToken.toNumber(),
    //                 '\n     ' +
    //                 'UNIT TESTS - SDACROWDSALE - TEST CASE 12: Test #2 New wallet token should same with old walet token\n      ' +
    //                 'TEST DESCRIPTION: AddressMigrations is called\n      ' +
    //                 'EXPECTED RESULT: ' + oldWalletToken[1].toNumber() + '\n      ' +
    //                 'ACTUAL RESULT: is ' + logResult.newSdaToken.toNumber());
    //         }
    //     });

    //     await sInst.addressMigrations(oldWallet,  newWallet, {from: acctFour}); // acctTwo already in whitelist

    //     eventAddressMIgration.stopWatching();
    // }).timeout(timeoutDuration);

    it('UNIT TESTS - SDACrowdsale - Test Case 13: Buy Token Min/Max USD amount', async function() {
        let minEther = web3.toWei(2, 'ether');
        let maxEther = web3.toWei(20, 'ether');

        await sInst.setWhiteList(acctThree, {from: acctFour}).should.not.be.rejectedWith(EVMRevert);
        // Should fail to because pre-ico require min 10k USD per purchase
        await sInst.buyTokens(acctThree, { from: acctThree, gas: 1000000, value: minEther}).should.be.rejectedWith(EVMRevert);
        // should not fail because 20 ether > than 10k
        await sInst.buyTokens(acctThree, { from: acctThree, gas: 1000000, value: maxEther}).should.not.be.rejectedWith(EVMRevert);

        // increaseTimeTo(sEndTime + oneDay);
        await increaseTimeTo(sStartTime + oneMonth + oneHour); // forward to t4 first days
        // should fail because first day could not purchase more than 10 k
        await sInst.buyTokens(acctThree, { from: acctThree, gas: 1000000, value: maxEther}).should.be.rejectedWith(EVMRevert);
        // should fail because purchase with 0.00000001 ether (less than 100usd)
        await sInst.buyTokens(acctThree, { from: acctThree, gas: 1000000, value: 10000000000}).should.be.rejectedWith(EVMRevert);

        await increaseTimeTo(sStartTime + oneMonth + oneDay + oneDay); // forward to t4 seconds days
        // should not fail because seconds days unlimited sales
        await sInst.buyTokens(acctThree, { from: acctThree, gas: 1000000, value: maxEther}).should.not.be.rejectedWith(EVMRevert);
    }).timeout(timeoutDuration);

    // it('UNIT TESTS - SDACrowdsale - Test Case 14: Distributes Token (Failed Cases)', async function() {
    //     // Should fail because ico haven't finalize
    //     await sInst.distributesToken(newWallet, {from: acctFour}).should.be.rejectedWith(EVMRevert);
    //
    //     // Should fail because blank account is not allow
    //     await sInst.distributesToken(blankAcct, {from: acctFour}).should.be.rejectedWith(EVMRevert);
    //     // Should fail because account six does not in the White list
    //     await sInst.distributesToken(acctSix, {from: acctFour}).should.be.rejectedWith(EVMRevert);
    //     // now set to whitelist
    //     await sInst.setWhiteList(acctSix, {from: acctFour}).should.not.be.rejectedWith(EVMRevert);
    //
    //     increaseTimeTo(sEndTime + oneDay);
    //     await sInst.finalize({from: acctFour});
    //     // still fail because account six does not have token
    //     await sInst.distributesToken(acctSix, {from: acctFour}).should.be.rejectedWith(EVMRevert);
    //
    // }).timeout(timeoutDuration);


    // it('UNIT TESTS - SDACrowdsale - Test Case 15: Buy Token (ethers exceed cap amount) (Failed Cases)', async function() {
    //     currentTime = web3.eth.getBlock('latest').timestamp;
    //     sStartTime = currentTime;
    //     sEndTime = sStartTime + oneMonth * 2;
    //     saleCap = new BigNumber(web3.toWei(10, 'ether'));
    //     sInst = await SDACrowdsale.new(sStartTime, sEndTime, saleCap, acctEight, tokenInst.address, {from: acctFour});

    //     let sendEther = web3.toWei(30, 'ether');

    //     const evtWatch = sInst.LogTokenPurchase();
    //     await sInst.buyTokens(acctOne, {from: acctOne, gas: 2000000, value: sendEther}).should.be.rejectedWith(EVMRevert);
    //     const watchResult = evtWatch.get();
    // }).timeout(timeoutDuration);
    // let totalIndex = 4;
    // let accountIndex = [
    //   // Tier[1].endTime = _startTime + 10 minutes;
    //   // Tier[1].tokenPrice = 7;
    //   // Tier[1].tokenCap = 25000 * 10 ** 18;
    //   {
    //       "account": acctSix,
    //       "sendEther": web3.toWei(2, 'ether'),
    //       "incTime": sStartTime
    //   },
    //   // Tier[2].endTime = Tier[1].endTime + 5 minutes;
    //   // Tier[2].tokenPrice = 8;
    //   // Tier[2].tokenCap = 45000 * 10 ** 18;
    //   {
    //     "account": acctSix,
    //     "sendEther": web3.toWei(2, 'ether'),
    //     "incTime": sStartTime + 11*oneMinute
    //   },
    //   // Tier[3].endTime = Tier[2].endTime + 5 minutes;
    //   // Tier[3].tokenPrice = 9;
    //   // Tier[3].tokenCap = 68000 * 10 ** 18;
    //   {
    //       "account": acctThree,
    //       "sendEther": web3.toWei(2, 'ether'),
    //       "incTime":sStartTime + 17*oneMinute
    //   },
    //   // Tier[4].endTime = Tier[3].endTime + 15 minutes;
    //   // Tier[4].tokenPrice = 10;
    //   // Tier[4].tokenCap = 88000 * 10 ** 18;
    //   {
    //       "account": acctThree,
    //       "sendEther": web3.toWei(2, 'ether'),
    //       "incTime": sStartTime + 22*oneMinute
    //   }
    // ];
    //
    // it('UNIT TESTS - SDACrowdsale - Test Case 15: Buy Token-Test Valid Purchase (ethers exceed cap amount) (Failed Cases)', async function() {
    //     const evtWatch = sInst.LogTokenPurchase();
    //     for (let index = 0; index < totalIndex; index++){
    //       const element = accountIndex[index];
    //       await increaseTimeTo(element.incTime);
    //       console.log(element.incTime);
    //       await sInst.buyTokens(element.account, {from: element.account, gas: 2000000, value: element.sendEther}).should.be.rejectedWith(EVMRevert);
    //       console.log(index);
    //     }
    // }).timeout(timeoutDuration);

    it('UNIT TESTS - MockOraclizeService - Test Case 16: transferBalances', async function () {
        let contractBalance = web3.eth.getBalance(oraclizeInst.address, 'latest');
        let twoEther = web3.toWei(2, 'ether');

        // To ensure that the balances in contract is 0;
        assert.equal(contractBalance.toNumber(), 0,
            '\n     ' +
            'UNIT TESTS - MockOraclizeService - TEST CASE 16: Contract balance should be 0\n      ' +
            'TEST DESCRIPTION: Get contract\'s balance\n      ' +
            'EXPECTED RESULT: 0\n      ' +
            'ACTUAL RESULT: is ' + contractBalance.toNumber()
        );

        // Should fail to call transferBalances with no balances in the contract
        await oraclizeInst.transferBalances(acctOne, {from: acctFour}).should.be.rejectedWith(EVMRevert);

        web3.eth.sendTransaction({from: acctFour, to: oraclizeInst.address, value: twoEther});

        contractBalance = web3.eth.getBalance(oraclizeInst.address, 'latest');

        assert.equal(contractBalance.toNumber(), twoEther,
            '\n     ' +
            'UNIT TESTS - MockOraclizeService - TEST CASE 16: Contract balance should be 2 ether\n      ' +
            'TEST DESCRIPTION: Buy Token is called\n      ' +
            'EXPECTED RESULT: 2 ether\n      ' +
            'ACTUAL RESULT: is ' + contractBalance.toNumber()
        );

        // Should fail to call transferBalances with non-owner's account to the contract
        await oraclizeInst.transferBalances(acctOne, {from: acctFive}).should.be.rejectedWith(EVMRevert);
    }).timeout(timeoutDuration);
});
