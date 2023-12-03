//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.15;

import "hardhat/console.sol";

contract Pass {
    // platform name + user hash
    mapping(bytes32 => string) paltformPasswords;
    mapping(address => bool) whitelisted;
    mapping(string => bool) whitelistedPlatforms;
    mapping(bytes32 => bool) usedSignatures;
    mapping(address => address) freeze;
    address immutable owner;
    bytes constant prefix = "\x19Ethereum Signed Message:\n32";

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function isWhitelist(address userAddreses) external view returns (bool) {
        return whitelisted[userAddreses];
    }

    function isWhitelistPlatform(
        string calldata platform
    ) external view returns (bool) {
        return whitelistedPlatforms[platform];
    }

    function registerFunction(address addressToCheck) external onlyOwner {
        require(!whitelisted[addressToCheck], "Already reged");
        whitelisted[addressToCheck] = true;
    }

    function registerPlatform(string calldata platform) external onlyOwner {
        require(!whitelistedPlatforms[platform], "Already reged");
        whitelistedPlatforms[platform] = true;
    }

    function storePassword(
        string calldata platformName,
        string calldata encryptedPass,
        bytes32 _hashedMessage,
        uint8 _v,
        bytes32 _r,
        bytes32 _s,
        address userAddress
    ) external onlyOwner {
        require(whitelisted[userAddress], "user not listed");
        require(whitelistedPlatforms[platformName], "platform not listed");
        bytes32 prefixedHashMessage = keccak256(
            abi.encodePacked(prefix, _hashedMessage)
        );

        require(!usedSignatures[_hashedMessage], "already used");
        usedSignatures[_hashedMessage] = true;

        require(
            userAddress == ecrecover(prefixedHashMessage, _v, _r, _s),
            "Invalid signature"
        );

        bytes memory concatenatedData = abi.encodePacked(
            userAddress,
            platformName
        );
        paltformPasswords[keccak256(concatenatedData)] = encryptedPass;
    }

    function getPassword(string calldata platform) external view returns(string memory){
        require(whitelisted[msg.sender], "not listed");
        require(whitelistedPlatforms[platform], "platform not listed");

        bytes memory concatenatedData = abi.encodePacked(
            msg.sender,
            platform
        );
        return paltformPasswords[keccak256(concatenatedData)];
    }

    function freezeAccount(
        address userAddress,
        address backupAddress,
        bytes32 _hashedMessage,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external onlyOwner {
        require(whitelisted[userAddress], "not listed");
        require(userAddress != backupAddress, "can not be same");
        bytes32 prefixedHashMessage = keccak256(
            abi.encodePacked(prefix, _hashedMessage)
        );
        require(!usedSignatures[_hashedMessage], "already used");
        usedSignatures[_hashedMessage] = true;
        require(
            userAddress == ecrecover(prefixedHashMessage, _v, _r, _s),
            "Invalid signature"
        );

        freeze[userAddress] = backupAddress;
    }
}
