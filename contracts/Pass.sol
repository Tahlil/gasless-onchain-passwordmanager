//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.15;

import "hardhat/console.sol";

contract Pass {
    // platform name + user hash
    mapping(bytes32 => string) paltformPasswords;
    mapping (address => bool) whitelisted;
    mapping (string => bool) whitelistedPlatforms;

    function registerFunction(address addressToCheck) external{
        require(!whitelisted[addressToCheck], "Already reged");
        whitelisted[addressToCheck] = true;
    }

    function registerPlatform(string calldata platform) external{
        require(!whitelistedPlatforms[platform], "Already reged");
        whitelistedPlatforms[platform] = true;
    }

}