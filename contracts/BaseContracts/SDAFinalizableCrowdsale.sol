/// @file SDA Finalizable Crowdsale Contract
/// @notice SDA Finalizable Crowdsale Contract is based on Open Zeppelin
//// and extend SDA Base Crowdsale
pragma solidity 0.4.19;

import '../../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import '../../node_modules/zeppelin-solidity/contracts/ownership/Claimable.sol';
import './SDABaseCrowdsale.sol';

contract SDAFinalizableCrowdsale is SDABaseCrowdsale, Claimable {
    using SafeMath for uint256;

    bool public isFinalized = false;

    event Closed();
    event Finalized();

    function SDAFinalizableCrowdsale() {
    }

    function finalize() onlyOwner public {
        require(!isFinalized);
        require(hasEnded());

        finalization();
        Finalized();

        isFinalized = true;
    }

    function close() onlyOwner internal {
        Closed();
        wallet.transfer(this.balance);
    }

    function finalization() internal {
        close();
    }
}
