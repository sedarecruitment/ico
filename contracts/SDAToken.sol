pragma solidity 0.4.19;

// ----------------------------------------------------------------------------
// SDA token contract
//
// Symbol : SDA
// Name : Secondary Data Attestation Token
// Total supply : 1,000,000,000.000000000000000000
// Decimals : 18
//
// ----------------------------------------------------------------------------

import './BaseContracts/SDAMintableToken.sol';
import './BaseContracts/SDABurnableToken.sol';
import './BaseContracts/SDAMigratableToken.sol';

contract SDAToken is SDAMintableToken, SDABurnableToken, SDAMigratableToken {
    string public name;
    string public symbol;
    uint8 public decimals;

    function SDAToken() public {
        name = "Secondary Data Attestation Token";
        symbol = "SEDA";
        decimals = 18;

        totalSupply_ = 1000000000 * 10 ** uint(decimals);

        balances[owner] = totalSupply_;
        Transfer(address(0), owner, totalSupply_);
    }

    function() public payable {
        revert();
    }
}
