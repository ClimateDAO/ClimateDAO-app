// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "./@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "./@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import "./@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "./@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./@openzeppelin/contracts-upgradeable/utils/math/SafeMath.sol";

contract EARTH is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, OwnableUpgradeable, ERC20PermitUpgradeable, ERC20VotesUpgradeable {
    using SafeMath for uint256;
    
    uint256 public totalTokenCount = 100000000;
    uint256 private _reflectionsTotalCount = 0;
    //Tx fees variables
    uint256 public _initialTaxFee = 15; 
    uint256 private _previousInitialTaxFee = _initialTaxFee; 
    uint256 public _expiry = 15780000; // QUESTION: this is just a rough estimate. is that okay?
    mapping (address => uint256) internal _lastTokenTransferTime;
    mapping (address => bool) internal isExcludedFromFee;
    mapping (address => uint256) internal tokenHolderNumTokens;
    mapping (address => uint256) internal reflectionsOwed;
    mapping (address => uint256) internal reflectionCountWhenTokensObtained;

    //ClimateDAOWallet for purposes of tx fee
    address ClimateDAOWallet = 0x20c7F2a24f33cF4F02D2D185e49aC7B1C975d37f; //Change this to our gnosis safe before deploying // Also change 
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize() initializer public {
        __ERC20_init("EARTH", "EARTH");
        __ERC20Burnable_init();
        __Ownable_init();
        __ERC20Permit_init("EARTH");
        isExcludedFromFee[msg.sender] = true;

        _mint(msg.sender, 100000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        totalTokenCount = totalTokenCount + amount;
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._burn(account, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        super.transferFrom(sender, recipient, amount);
        return true;
    }

    function transfer(address recipient, uint256 amount) public 
    virtual 
    override(ERC20Upgradeable) 
    returns (bool)
    {

        if(isExcludedFromFee[msg.sender]) {
            super.transfer(recipient, amount);
            tokenHolderNumTokens[recipient] = tokenHolderNumTokens[recipient].add(amount);
        }
        else {
            //Calulate the feetaken and the new amount to be transferred;
            (uint256 feeTaken, uint256 transferAmount) = _calculateTaxFee(amount);
            //call the function to distribute the fees as described in the Whitepaper
            _distributeFees(feeTaken);
            super.transfer(recipient, transferAmount);
            tokenHolderNumTokens[recipient] = tokenHolderNumTokens[recipient].add(transferAmount);
        }
        
        _updateHoldings(msg.sender, recipient, amount);
        return true;
    }

    // The following functions will pertain to the Transaction Fee

    function setInitialTaxFee(uint256 initialTaxFee) external onlyOwner() {
        _initialTaxFee = initialTaxFee; 
    }

    // RH: 
    function _calculateTaxFee(uint256 amount) internal view returns (uint256 feeTaken, uint256 transferAmount) {
        
        /**
         *  The actual calculation is: 
         *  
         *  initialFee = (amount * initialTax) / 100 
         *  taxFraction = (expiry - timeSince) / expiry
         *  actualFee = initialFee * taxFraction 
         *  
         *  To avoid decimal issues, it's best to multiply all the numerators first, then denominators
         *  
         *  feeNumerator = amount * initialTax * (expiry - timeSince) 
         *  feeDenominator = expiry * 100           // Requires a non-zero initialTaxFee 
         *  actualFee = feeNumerator / feeDenominator 
         *  
         */

        require(amount > 0, "Must transfer a non-zero amount"); 
        
        // QUESTION: is this what the mapping was intended for? 
        if(isExcludedFromFee[msg.sender] || _initialTaxFee == 0) {
            return (0, amount); 
        }

        uint256 lastTransferTime = _lastTokenTransferTime[msg.sender]; 
        uint256 timeSince = block.timestamp - lastTransferTime; 

        if(timeSince >= _expiry) {
            return (0, amount); 
        }

        uint256 feeNumerator = amount.mul(_initialTaxFee).mul(_expiry.sub(timeSince)); 
        uint256 feeDenominator = _expiry.mul(100); 
        feeTaken = feeNumerator.div(feeDenominator); 
        transferAmount = amount.sub(feeTaken); 

        return (feeTaken, transferAmount); 

    }

    function _distributeFees(uint256 fees) internal {

        uint256 percentageConstant = 100;
        //Fees as described in the Whitepaper, these add up to 100
        uint256 climateTokenHoldersPortion = 10;
        uint256 liquidityPoolPortion = 50;
        uint256 climateDaoOpsPortion = 10;
        uint256 climateDaoTreasuryPortion = 10;
        uint256 reflectionToHoldersPortion = 20;

        _reflectionsTotalCount = fees.mul(percentageConstant).div(reflectionToHoldersPortion);
        
    }

    function _updateHoldings(address sender, address recipient, uint256 amount) internal {
        
        // We divide 100 by the total number of tokens by how many tokens the user transferred to get the percentage of tokens the user moved
        // ex. there are 200 tokens total and the user transfers 5
        // -- We first do 200/5 = 40
        // -- Then we do 100/40 = 2.5 meaning the user is transferring 2.5% of their tokens so 2.5% of the reflections they can take should be removed as well
        //revist to clean up percantages and possible divide by 0
        uint256 percentageConstant = 100;
        uint256 reflectionsPercentage = percentageConstant.div((totalTokenCount.div(amount)));
        uint256 reflections = reflectionsOwed[sender].mul(reflectionsPercentage).div(percentageConstant);
        reflectionsOwed[sender] = reflectionsOwed[sender].sub(reflections);

        reflectionCountWhenTokensObtained[recipient] = _reflectionsTotalCount;

        tokenHolderNumTokens[sender] = tokenHolderNumTokens[sender].sub(amount);


    }

    function withdrawReflections() public {
        calculateReflections(msg.sender);
        transferFrom(address(this), msg.sender, reflectionsOwed[msg.sender]);
    }

    function calculateReflections(address account) internal {
        //Take the amount of new reflections since the tokens were transferred and transfer it to their wallet
        uint256 tokensSincePurchase = _reflectionsTotalCount.sub(reflectionCountWhenTokensObtained[account]);
        uint256 reflectAmount = tokensSincePurchase.div((totalTokenCount.div(tokenHolderNumTokens[account])));
        reflectionsOwed[account] = reflectAmount;
    }
}
