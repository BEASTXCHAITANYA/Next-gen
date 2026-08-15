// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCredit is ERC721, Ownable {
    uint256 private _totalTokens;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("CarbonCredit", "CARBON") Ownable(msg.sender) {}

    function mintCredit(address to, string memory uri) external onlyOwner returns (uint256) {
        _totalTokens++;
        uint256 newId = _totalTokens;
        _safeMint(to, newId);
        _tokenURIs[newId] = uri;
        return newId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    function totalSupply() external view returns (uint256) {
        return _totalTokens;
    }
}
