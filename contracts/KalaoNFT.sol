// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KalaoNFT is ERC721Enumerable, Ownable {
	uint public pos;
	mapping(uint256 => string) public _data;

	constructor() ERC721("KalaoNFT", "KLO") {
		pos = 0;
	}

	function mint(string memory data) external {
		// add validation check
		pos = pos + 1;
		_safeMint(msg.sender, pos);
		_data[pos] = data;
	}

	function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
		return _data[tokenId];
	}
}

