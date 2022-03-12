//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract ISupportUkraine is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    bytes32 public merkleRoot;

    constructor(bytes32 _merkleRoot)
        ERC721("I Support Ukraine Verified Donation", "UA")
    {
        merkleRoot = _merkleRoot;
    }

    address payable public ukraine =
        payable(0x165CD37b4C644C2921454429E7F9358d18A45e14);

    mapping(address => bool) private hasMinted;

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmZphHmUBsChn55YMVWox9dKJWdwu8fCHgLxsbcMqVtQQ8";
    }

    function whiteListMint(bytes32[] memory _proof) public nonReentrant {
        require(
            _verifyMerkleLeaf(_generateMerkleLeaf(msg.sender), _proof),
            "Invalid proof, not on whitelist"
        );
        require(hasMinted[msg.sender] == false, "Already minted");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        hasMinted[msg.sender] = true;
        _safeMint(msg.sender, tokenId);
    }

    function donateToUkraine() public payable nonReentrant {
        require(msg.value > 0.001 ether, "Must donate at least 0.001 ether");
        require(hasMinted[msg.sender] == false, "Already minted");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        hasMinted[msg.sender] = true;
        ukraine.transfer(msg.value);
        _safeMint(msg.sender, tokenId);
    }

    function _generateMerkleLeaf(address _account)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_account));
    }

    function _verifyMerkleLeaf(bytes32 _leafNode, bytes32[] memory _proof)
        internal
        view
        returns (bool)
    {
        return MerkleProof.verify(_proof, merkleRoot, _leafNode);
    }

    function verifyMerkleLeaf(address _account, bytes32[] memory _proof)
        public
        view
        returns (bool)
    {
        return
            MerkleProof.verify(
                _proof,
                merkleRoot,
                _generateMerkleLeaf(_account)
            );
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        return _baseURI();
    }
}
