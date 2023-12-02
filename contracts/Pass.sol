//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.15;

import "hardhat/console.sol";

contract Pass {
    // platform name + user hash
    mapping(bytes32 => string) paltformPasswords;
    mapping (address => bool) whitelisted;
    mapping (string => bool) whitelistedPlatforms;
    address owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner  = msg.sender;
    }

    function registerFunction(address addressToCheck) external{
        require(!whitelisted[addressToCheck], "Already reged");
        whitelisted[addressToCheck] = true;
    }

    function registerPlatform(string calldata platform) external{
        require(!whitelistedPlatforms[platform], "Already reged");
        whitelistedPlatforms[platform] = true;
    }

    function storePassword(string calldata platformName, string calldata encryptedPass) external {
        require(whitelisted[msg.sender], "user not listed");
        require(whitelistedPlatforms[platformName], "platform not listed");
        bytes memory concatenatedData = abi.encodePacked(msg.sender, platformName);
        paltformPasswords[keccak256(concatenatedData)] = encryptedPass;
    }

}