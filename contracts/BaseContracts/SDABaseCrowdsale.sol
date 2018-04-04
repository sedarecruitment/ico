/// @file SDA Base Crowdsale Contract
/// @notice SDA Base Crowdsale Contract is base on Open Zeppelin
/// and modified
pragma solidity 0.4.19;

import '../../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';

contract SDABaseCrowdsale {
    using SafeMath for uint256;

    uint256 public startTime;
    uint256 public endTime;

    address public wallet;

    uint256 public tokenRaised;

    uint256 txCount = 0;
    /**
     * Logging Token Purchase
     * @param _purchaser who paid for the tokens
     * @param _beneficiary who got the tokens
     * @param _value weis paid for purchase
     * @param _amount amount of tokens purchased
     */
    event LogTokenPurchase(uint256 indexed _count, address indexed _purchaser, address indexed _beneficiary, uint256 _value, uint256 _amount, uint256 _tokenPrice);

    function SDABaseCrowdsale(uint256 _startTime, uint _endTime, address _wallet) public {
        require(_startTime >= now);
        require(_endTime >= _startTime);
        require(_wallet != address(0));

        startTime = _startTime;
        endTime = _endTime;
        wallet = _wallet;
    }

    function forwardFunds() internal {
        wallet.transfer(msg.value);
    }

    function validPurchase(uint256 tokenPurchased) internal view returns (bool) {
        bool withinPeriod = now >= startTime && now <= endTime;
        bool nonZeroPurchase = msg.value != 0;
        bool nonZeroTokenPurchase = tokenPurchased != 0;
        return withinPeriod && nonZeroPurchase && nonZeroTokenPurchase;
    }

    function hasEnded() public view returns (bool) {
        return now > endTime;
    }
}
