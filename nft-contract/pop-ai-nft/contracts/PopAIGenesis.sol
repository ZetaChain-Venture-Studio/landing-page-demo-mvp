// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title PopAIGenesis
 * @dev Simple ERC721 for POP AI Genesis Members
 * @notice Image stored on IPFS, points displayed on frontend via Snag API
 */
contract PopAIGenesis is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    
    // Base URI for metadata (your API endpoint)
    string public baseURI;
    
    // One NFT per wallet
    mapping(address => uint256) public walletToToken;
    mapping(uint256 => address) public tokenToWallet;
    
    // Authorized minter (your backend)
    address public minter;

    event GenesisMinted(address indexed to, uint256 indexed tokenId);

    constructor(string memory _baseURI) ERC721("POP AI Genesis Member", "POPGEN") Ownable(msg.sender) {
        baseURI = _baseURI;
        minter = msg.sender;
    }

    modifier onlyMinter() {
        require(msg.sender == minter || msg.sender == owner(), "Not authorized");
        _;
    }

    // ============ Admin Functions ============

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
    }

    // ============ Mint Functions ============

    function mint(address to) external onlyMinter returns (uint256) {
        require(walletToToken[to] == 0, "Already minted");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _mint(to, tokenId);
        walletToToken[to] = tokenId;
        tokenToWallet[tokenId] = to;
        
        emit GenesisMinted(to, tokenId);
        return tokenId;
    }

    function batchMint(address[] calldata recipients) external onlyMinter {
        for (uint256 i = 0; i < recipients.length; i++) {
            if (walletToToken[recipients[i]] == 0) {
                _tokenIdCounter++;
                uint256 tokenId = _tokenIdCounter;
                
                _mint(recipients[i], tokenId);
                walletToToken[recipients[i]] = tokenId;
                tokenToWallet[tokenId] = recipients[i];
                
                emit GenesisMinted(recipients[i], tokenId);
            }
        }
    }

    // ============ View Functions ============

    function hasMinted(address wallet) public view returns (bool) {
        return walletToToken[wallet] != 0;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenToWallet[tokenId] != address(0), "Token does not exist");
        return string(abi.encodePacked(baseURI, tokenId.toString()));
    }
}
