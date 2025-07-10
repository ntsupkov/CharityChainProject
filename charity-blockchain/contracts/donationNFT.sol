// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract DonationNFT is ERC721URIStorage, ERC2981, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    using Strings for uint256; 


    Counters.Counter private _tokenIdCounter;
    
    address public donationContract;
    
    string private _baseTokenURI;
    
    uint256 public constant MAX_SUPPLY = 100000;
    
    struct NFTMetadata {
        address donor;
        uint256 amount;
        uint256 campaignId;
        uint256 timestamp;
        string campaignName;
        string donorLevel;
    }
    
    mapping(uint256 => NFTMetadata) public nftMetadata;
    
    event NFTMinted(
        address indexed donor, 
        uint256 indexed tokenId, 
        uint256 campaignId, 
        uint256 amount,
        string donorLevel
    );
    event RoyaltyUpdated(address receiver, uint96 feeNumerator);
    event BaseURIUpdated(string newBaseURI);
    event DonationContractUpdated(address newContract);
    
    modifier onlyDonationContract() {
        require(msg.sender == donationContract, "Only donation contract can call");
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        address royaltyReceiver,
        uint96 royaltyFeeNumerator
    ) ERC721(name, symbol) {
        require(royaltyReceiver != address(0), "Invalid royalty receiver");
        require(royaltyFeeNumerator <= 10000, "Royalty fee too high");
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator);
    }
    
        //Admin функции 
    
   
    function setDonationContract(address _donationContract) external onlyOwner {
        require(_donationContract != address(0), "Invalid address");
        donationContract = _donationContract;
        emit DonationContractUpdated(_donationContract);
    }
    

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }
    
  
    function updateDefaultRoyalty(
        address receiver, 
        uint96 feeNumerator
    ) external onlyOwner {
        require(receiver != address(0), "Invalid royalty receiver");
        require(feeNumerator <= 10000, "Royalty fee too high");
        _setDefaultRoyalty(receiver, feeNumerator);
        emit RoyaltyUpdated(receiver, feeNumerator);
    }
    
 
    function pause() external onlyOwner {
        _pause();
    }
    
  
    function unpause() external onlyOwner {
        _unpause();
    }
    
    //Основные функции
    
   
    function mintDonationNFT(
        address donor,
        uint256 amount,
        uint256 campaignId,
        string calldata campaignName
    ) external onlyDonationContract whenNotPaused returns (uint256) {
        require(donor != address(0), "Invalid donor address");
        require(amount > 0, "Invalid donation amount");
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        string memory level = getDonorLevel(amount);
        
        _safeMint(donor, tokenId);
        
        nftMetadata[tokenId] = NFTMetadata({
            donor: donor,
            amount: amount,
            campaignId: campaignId,
            timestamp: block.timestamp,
            campaignName: campaignName,
            donorLevel: level
        });
        
        string memory uri = string(
            abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json")
        );
        _setTokenURI(tokenId, uri);
        
        emit NFTMinted(donor, tokenId, campaignId, amount, level);
        
        return tokenId;
    }
    
    function getDonorLevel(uint256 amount) public pure returns (string memory) {
        if (amount >= 10 ether) return "Diamond";
        if (amount >= 5 ether) return "Platinum";
        if (amount >= 1 ether) return "Gold";
        if (amount >= 0.5 ether) return "Silver";
        return "Bronze";
    }
    function getNFTMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return nftMetadata[tokenId];
    }
    
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        if (balance == 0) return new uint256[](0);
        
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
                if (index == balance) break;
            }
        }
        
        return tokens;
    }
    
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }
    
    function getTokenFullInfo(uint256 tokenId) external view returns (
        address owner,
        string memory uri,
        NFTMetadata memory metadata
    ) {
        require(_exists(tokenId), "Token does not exist");
        return (
            ownerOf(tokenId),
            tokenURI(tokenId),
            nftMetadata[tokenId]
        );
    }
    
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721URIStorage) {
        super._burn(tokenId);
        delete nftMetadata[tokenId];
    }
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721URIStorage, ERC2981) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    receive() external payable {
        revert("This contract does not accept payments");
    }
    
    fallback() external payable {
        revert("This contract does not accept payments");
    }
}