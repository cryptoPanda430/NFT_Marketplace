// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "solidity-bytes-utils/contracts/BytesLib.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract KalaoSignature {
	/*
	*  Storage
	*/
    using BytesLib for bytes;
    using ECDSA for bytes32;

    address private signer;

    constructor() {
        _setSigner(msg.sender);
    }

	/*
	* Internal functions
	*/
	/// @dev Set the new signer
	/// @param _signer Address of new signer.
    function _setSigner(address _signer) internal {
        signer = _signer;
    }

	/// @dev Get hash from message
    function getMessageHash(
        address _to,
        uint256 _amount,
        uint256 _duration,
        uint256 _extra,
        uint256 _nonce
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_to, _amount, _duration,_extra, _nonce));
    }

	/// @dev Hash and Signature
    function parseParams(bytes memory data) internal pure returns (bytes32, address, uint256, uint256, uint256, uint256) {
        // extract hash, address, amount, duration, extra, nonce from bytes
        require(data.length == 320, "Invalid size");
        // 32 bytes for bytes length
        // 32 bytes for address + padding
        // 32*4 bytes for amount, duration, extra, nonce
        // 32 bytes for signature bytes prefix
        // 96 bytes for signature data (65 bytes + padding);
        // == 320

        // step 1 parse seller
        address seller;
        assembly {
            seller := mload(add(add(data, 32), 0))
        }

        // parse amount, duration, nonce
        uint256 amount;
        uint256 duration;
        uint256 extra;
        uint256 nonce;
        assembly{
            amount := mload(add(data, 64))
            duration := mload(add(data, 96))
            extra := mload(add(data, 128))
            nonce := mload(add(data, 160))
        }

        // add 32 for the size of the bytes array
        bytes32 hash = getMessageHash(seller, amount, duration, extra, nonce);
        return (hash, seller, amount, duration, extra, nonce);
    }

	/// @dev Parse the signature
	function parseSignature(bytes memory data) internal pure returns (bytes memory) {
       	return data.slice(224, 65);//data.length-148);
	}

	/*
	* Public functions
	*/
	/// @dev Parse the message
    function parseCheck(bytes memory _data) public view returns (address, uint256, uint256, uint256, uint256) {
        bytes32 hash;
        bytes memory sig;
        address seller;
        uint256 amount;
        uint256 duration;
        uint256 nonce;
        uint256 extra;
        (hash,seller, amount, duration, extra, nonce) = parseParams(_data);
		sig = parseSignature(_data);
        address recov = hash.toEthSignedMessageHash().recover(sig);
        require(recov == signer, "Data was not signed by onwer");
        return (seller, amount, duration, extra, nonce);
    }
}
