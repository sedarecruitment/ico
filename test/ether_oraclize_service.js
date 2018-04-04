let oraclize = artifacts.require('MockOraclizeService');

let timeoutDuration = 0;
contract('MockOraclizeService', function() {
    let sInstOraclize;

    it("UNIT TESTS - MockOraclizeService - Test Case 00: Can Deploy MockOraclizeService", function (done) {
        sInstOraclize = oraclize.new();

        var oraclizeIsDeployed = oraclize.isDeployed();
        assert.isTrue(oraclizeIsDeployed, "Oraclize service is not deployed.");
        done();
    }).timeout(timeoutDuration);

    // it("UNIT TEST - MockOraclizeService - Test Case 01: Get Ether price in USD", async function () {
    //     const evtWatcher = sInstOraclize.EvtEtherPrice(function (error, result) {
    //         if (error) {
    //             console.error(error);
    //         }

    //         if (!error) {
    //             console.log(result);
    //         }
    //     });

    //     await oraclize.new();

    //     evtWatcher.stopWatching();
    // }).timeout(timeoutDuration);
});
