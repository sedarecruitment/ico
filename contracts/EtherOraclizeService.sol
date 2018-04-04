pragma solidity 0.4.19;

import "../installed_contracts/oraclize/contracts/usingOraclize.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

contract EtherOraclizeService is usingOraclize, Ownable {
    uint private etherPriceInUSD;

    event EvtOraclizeQuery(string descriptions);
    event EvtEtherPrice(string price);

    /**
     * Constructor
     */
    function EtherOraclizeService() payable {
        oraclize_setProof(proofType_NONE);
        updateEtherPrice();
    }

    function __callback(bytes32 myid, string result, bytes proof) {
        require(msg.sender == oraclize_cbAddress());
        EvtEtherPrice(result);
        etherPriceInUSD = parseInt(result, 2);
        updateEtherPrice();
    }

    /**
     * Send a query to get the current Ether price in USD
     */
    function updateEtherPrice()
        payable
    {
        if (oraclize.getPrice("URL") > this.balance) {
            EvtOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            EvtOraclizeQuery("Sending query...");
            oraclize_query(60, "URL", "json(https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD).USD");
        }
    }

    /**
     * Returns Ether's price in USD
     */
    function getEtherPrice() public returns(uint) {
        return etherPriceInUSD;
    }

    function transferBalances(address _wallet) external onlyOwner {
        require(this.balance > 0);
        require(_wallet != address(0x0));

        _wallet.transfer(this.balance);
    }

    function () payable {}
}
