//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

contract Knowtfolio is OwnableUpgradeable, ERC721URIStorageUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter internal _tokenIds;

    mapping(string => uint256) internal tokenIdOf;

    function initialize() public initializer {
        __ERC721_init("Knowtfolio", "PON");
        __Ownable_init();
        __ERC721URIStorage_init();
    }

    function mintNFT(
        address recipient,
        string memory _tokenURI,
        string memory _articleId
    ) public onlyOwner returns (uint256) {
        require(bytes(_articleId).length > 0 && tokenIdOf[_articleId] == 0);
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        tokenIdOf[_articleId] = newItemId;

        return newItemId;
    }

    function isOwnerOfArticle(address editor, string memory articleId)
        public
        view
        onlyOwner
        returns (bool)
    {
        uint256 _tokenId = tokenIdOf[articleId];
        require(_tokenId != 0);
        address owner = ownerOf(_tokenId);
        return owner == editor;
    }
}
