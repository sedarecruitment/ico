pragma solidity 0.4.19;

import '../../node_modules/zeppelin-solidity/contracts/token/ERC827/ERC827Token.sol';
import '../../node_modules/zeppelin-solidity/contracts/ownership/Claimable.sol';

contract SDABasicToken is ERC827Token, Claimable {
    mapping (address => bool) public isHolder;
    address[] public holders;

    function addHolder(address _addr) internal returns (bool) {
        if (isHolder[_addr] != true) {
            holders[holders.length++] = _addr;
            isHolder[_addr] = true;
            return true;
        }
        return false;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(this)); // Prevent transfer to contract itself
        bool ok = super.transfer(_to, _value);
        addHolder(_to);
        return ok;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(this)); // Prevent transfer to contract itself
        bool ok = super.transferFrom(_from, _to, _value);
        addHolder(_to);
        return ok;
    }
}
