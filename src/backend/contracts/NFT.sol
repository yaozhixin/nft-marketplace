// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    // solidity init the variable as 0 automatically
    uint public tokenCount;
    constructor() ERC721("DApp NFT", "DAPP"){}

    function mint(string memory _tokenURI) external returns(uint) {
        tokenCount ++;
        // param1: the address that we're minting for
        // param2: the ID of the token
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenURI);
        return(tokenCount);
    }
}