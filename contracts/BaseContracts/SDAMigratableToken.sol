pragma solidity 0.4.19;

import '../../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import './SDABasicToken.sol';

contract MigrationAgent {
    function migrateFrom(address from, uint256 value) public returns (bool);
}

contract SDAMigratableToken is SDABasicToken {
    using SafeMath for uint256;

    address public migrationAgent;
    uint256 public migrationCountComplete;

    event Migrate(address indexed owner, uint256 value);

    function setMigrationAgent(address agent) public onlyOwner {
        migrationAgent = agent;
    }

    function migrate() public returns (bool) {
        require(migrationAgent != address(0));

        uint256 value = balances[msg.sender];
        balances[msg.sender] = balances[msg.sender].sub(value);
        totalSupply_ = totalSupply_.sub(value);
        MigrationAgent(migrationAgent).migrateFrom(msg.sender, value);

        Migrate(msg.sender, value);
        return true;
    }

    function migrateHolders(uint256 count) public onlyOwner returns (bool) {
        require(count > 0);
        require(migrationAgent != address(0));

        count = migrationCountComplete + count;

        if (count > holders.length) {
            count = holders.length;
        }

        for (uint256 i = migrationCountComplete; i < count; i++) {
            address holder = holders[i];
            uint256 value = balances[holder];
            balances[holder] = balances[holder].sub(value);
            totalSupply_ = totalSupply_.sub(value);
            MigrationAgent(migrationAgent).migrateFrom(holder, value);

            Migrate(holder, value);
            return true;
        }
    }
}
