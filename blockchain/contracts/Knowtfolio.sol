//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./ERC721URIStorageEnumerableUpgradeable.sol";

contract Knowtfolio is OwnableUpgradeable, ERC721URIStorageEnumerableUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter internal _tokenIds;

    mapping(string => uint256) internal tokenIdOf;

    function initialize() public initializer {
        __ERC721_init("Knowtfolio", "FOLIO");
        __Ownable_init();
        __ERC721URIStorage_init();
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`.
     */
    function _baseURI() internal view virtual override(ERC721Upgradeable) returns (string memory) {
        return "https://knowtfolio.com/articles/";
    }

    function mintNFT(
        address recipient,
        string memory _articleId
    ) public onlyOwner returns (uint256) {
        require(bytes(_articleId).length > 0 && tokenIdOf[_articleId] == 0);
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, _articleId);
        tokenIdOf[_articleId] = newItemId;

        return newItemId;
    }

    /**
     * @dev Get owner of the Article NFT of `articleId`.
     * If there's no NFT for `articleId`, the function returns an empty address.
     */
    function getOwnerOfArticle(string memory articleId)
        public
        view
        returns (address)
    {
        uint256 _tokenId = tokenIdOf[articleId];
        if (_tokenId == 0) {
            return address(0);
        } else {
            return ownerOf(_tokenId);
        }
    }

    /**
     * @dev Collects all article ids that is owned by `user`.
     */
    function getArticlesOwnedBy(address user)
    public
    view
    returns (string[] memory)
    {
        uint256 numberOfTokens = balanceOf(user);
        string[] memory articleIds = new string[](numberOfTokens);
        for (uint256 index = 0; index < numberOfTokens; index++) {
            uint256 token = tokenOfOwnerByIndex(user, index);
            articleIds[index] = tokenURI(token);
        }
        return articleIds;
    }
}
