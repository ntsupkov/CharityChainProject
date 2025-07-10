// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


interface IDonationNFT {
    function mintDonationNFT(
        address _donor,
        uint256 _amount,
        uint256 _campaignId,
        string memory _campaignName
    ) external returns (uint256);
}


contract Donation is Ownable, ReentrancyGuard, Pausable {

    uint256 public totalDonations;
    uint256 public campaignCount;
    

    address public nftContract;
    

    uint256 public constant MIN_DONATION_FOR_NFT = 0.01 ether;
    

    address public treasuryAddress;
    uint256 public platformFee = 100; // 1% по умолчанию
    uint256 public constant MAX_PLATFORM_FEE = 200; // 2%
    uint256 public totalFeesCollected;
    

    struct Campaign {
        string name;
        string description;
        uint256 goal;
        uint256 raised;
        uint256 deadline;
        address beneficiary;
        bool active;
        bool fundsWithdrawn;
    }
    
    struct DonationInfo {
        address donor;
        uint256 amount;
        uint256 timestamp;
        uint256 campaignId;
        uint256 nftTokenId;
    }
    

    mapping(uint256 => Campaign) public campaigns;
    DonationInfo[] public allDonations;
    mapping(address => uint256[]) public donorHistory;
    

    event CampaignCreated(uint256 indexed campaignId, string name, uint256 goal, uint256 deadline);
    event DonationReceived(address indexed donor, uint256 indexed campaignId, uint256 amount);
    event CampaignCompleted(uint256 indexed campaignId, uint256 totalRaised);
    event FundsWithdrawn(uint256 indexed campaignId, address beneficiary, uint256 amount);
    event NFTContractUpdated(address indexed newNFTContract);
    event PlatformFeeUpdated(uint256 newFee);
    event TreasuryAddressUpdated(address newTreasury);
    event FeeCollected(uint256 campaignId, uint256 feeAmount);
    event EmergencyWithdraw(address to, uint256 amount);
    
    constructor(address _treasuryAddress) {
        require(_treasuryAddress != address(0), "Invalid treasury address");
        treasuryAddress = _treasuryAddress;
    }
    

    

    function setNFTContract(address _nftContract) external onlyOwner {
        require(_nftContract != address(0), "Invalid NFT contract");
        nftContract = _nftContract;
        emit NFTContractUpdated(_nftContract);
    }
    

    function setTreasuryAddress(address _treasuryAddress) external onlyOwner {
        require(_treasuryAddress != address(0), "Invalid treasury address");
        treasuryAddress = _treasuryAddress;
        emit TreasuryAddressUpdated(_treasuryAddress);
    }
    

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= MAX_PLATFORM_FEE, "Fee exceeds maximum");
        platformFee = _fee;
        emit PlatformFeeUpdated(_fee);
    }
    

    function pause() external onlyOwner {
        _pause();
    }
    

    function unpause() external onlyOwner {
        _unpause();
    }
    
    //Основные функции
    

    function createCampaign(
        string memory _name,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays,
        address _beneficiary
    ) public onlyOwner whenNotPaused returns (uint256) {
        require(_goal > 0, "Goal must be greater than 0");
        require(_durationInDays > 0, "Duration must be greater than 0");
        require(_beneficiary != address(0), "Invalid beneficiary address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        uint256 campaignId = campaignCount++;
        
        campaigns[campaignId] = Campaign({
            name: _name,
            description: _description,
            goal: _goal,
            raised: 0,
            deadline: block.timestamp + (_durationInDays * 1 days),
            beneficiary: _beneficiary,
            active: true,
            fundsWithdrawn: false
        });
        
        emit CampaignCreated(campaignId, _name, _goal, campaigns[campaignId].deadline);
        
        return campaignId;
    }
    
  
    function donateToCampaign(uint256 _campaignId) 
        public 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        require(msg.value > 0, "Donation must be greater than 0");
        require(_campaignId < campaignCount, "Campaign does not exist");
        
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.active, "Campaign is not active");
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        
        uint256 feeAmount = (msg.value * platformFee) / 10000;
        uint256 netDonation = msg.value - feeAmount;
        
        campaign.raised += netDonation;
        totalDonations += msg.value;
        totalFeesCollected += feeAmount;
        
        if (feeAmount > 0) {
            (bool feeSuccess, ) = payable(treasuryAddress).call{value: feeAmount}("");
            require(feeSuccess, "Fee transfer failed");
            emit FeeCollected(_campaignId, feeAmount);
        }
        
        uint256 nftTokenId = 0;
        if (nftContract != address(0) && msg.value >= MIN_DONATION_FOR_NFT) {
            try IDonationNFT(nftContract).mintDonationNFT(
                msg.sender,
                msg.value,
                _campaignId,
                campaign.name
            ) returns (uint256 tokenId) {
                nftTokenId = tokenId;
            } catch {
            }
        }
        

        DonationInfo memory newDonation = DonationInfo({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            campaignId: _campaignId,
            nftTokenId: nftTokenId
        });
        
        allDonations.push(newDonation);
        donorHistory[msg.sender].push(allDonations.length - 1);
        
        emit DonationReceived(msg.sender, _campaignId, msg.value);
        
        
        if (campaign.raised >= campaign.goal) {
            campaign.active = false;
            emit CampaignCompleted(_campaignId, campaign.raised);
        }
    }
    

    function withdrawCampaignFunds(uint256 _campaignId) 
        public 
        nonReentrant 
        whenNotPaused 
    {
        require(_campaignId < campaignCount, "Campaign does not exist");
        
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.beneficiary || msg.sender == owner(), "Not authorized");
        require(!campaign.fundsWithdrawn, "Funds already withdrawn");
        require(campaign.raised > 0, "No funds to withdraw");
        require(!campaign.active || block.timestamp > campaign.deadline, "Campaign still active");
        
        uint256 amount = campaign.raised;
        campaign.fundsWithdrawn = true;
        
        (bool success, ) = payable(campaign.beneficiary).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(_campaignId, campaign.beneficiary, amount);
    }
    

    function stopCampaign(uint256 _campaignId) public onlyOwner {
        require(_campaignId < campaignCount, "Campaign does not exist");
        campaigns[_campaignId].active = false;
    }
    

    function emergencyWithdraw(address _to) external onlyOwner {
        require(_to != address(0), "Invalid address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(_to).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
        
        emit EmergencyWithdraw(_to, balance);
    }
    

    

    function getCampaignInfo(uint256 _campaignId) public view returns (
        string memory name,
        string memory description,
        uint256 goal,
        uint256 raised,
        uint256 deadline,
        bool active,
        address beneficiary
    ) {
        require(_campaignId < campaignCount, "Campaign does not exist");
        Campaign memory campaign = campaigns[_campaignId];
        
        return (
            campaign.name,
            campaign.description,
            campaign.goal,
            campaign.raised,
            campaign.deadline,
            campaign.active,
            campaign.beneficiary
        );
    }
    

    function getDonorHistory(address _donor) public view returns (DonationInfo[] memory) {
        uint256[] memory donationIndices = donorHistory[_donor];
        DonationInfo[] memory donations = new DonationInfo[](donationIndices.length);
        
        for (uint256 i = 0; i < donationIndices.length; i++) {
            donations[i] = allDonations[donationIndices[i]];
        }
        
        return donations;
    }
    

    function getActiveCampaigns() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].active && block.timestamp < campaigns[i].deadline) {
                activeCount++;
            }
        }
        
 
        uint256[] memory activeCampaignIds = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].active && block.timestamp < campaigns[i].deadline) {
                activeCampaignIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return activeCampaignIds;
    }
    

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
    

    function getPlatformStats() public view returns (
        uint256 _totalDonations,
        uint256 _totalFeesCollected,
        uint256 _campaignCount,
        uint256 _currentBalance
    ) {
        return (
            totalDonations,
            totalFeesCollected,
            campaignCount,
            address(this).balance
        );
    }
    

    receive() external payable {
        revert("Please use donateToCampaign function");
    }
    
    fallback() external payable {
        revert("Please use donateToCampaign function");
    }
}