//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./Knowtfolio.sol";

contract KnowtfolioV2 is
    Knowtfolio
{
    /**
     * @dev Get token id of the NFT of `articleId`
     */
    function getTokenId(string memory articleId) public view returns (uint256) {
        uint256 _tokenId = tokenIdOf[articleId];
        return _tokenId;
    }
}
