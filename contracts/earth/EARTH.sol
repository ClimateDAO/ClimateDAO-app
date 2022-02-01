// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./@openzeppelin/contracts/access/Ownable.sol";
import "./@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "./@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "./@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Earth is ERC20, Ownable, ERC20Permit, ERC20Votes {
    using SafeMath for uint256;

    //Tx fees variables
    uint256 public _initialTaxFee = 15; 
    uint256 private _previousInitialTaxFee = _initialTaxFee; 
    uint256 public _expiry = 15780000;
    mapping (address => uint256) internal _lastTokenTransferTime;
    mapping (address => bool) internal isExcludedFromFee;

    //opsClimateDAOWallet for purposes of tx fee
    address opsClimateDAOWallet = 0x20c7F2a24f33cF4F02D2D185e49aC7B1C975d37f; //Change this to our gnosis safe before deploying // 
    address treasuryClimateDAOWallet = 0x20c7F2a24f33cF4F02D2D185e49aC7B1C975d37f; //Change this to our gnosis safe before deploying
    
    constructor() ERC20("Earth", "EARTH") ERC20Permit("Earth") {
        _mint(msg.sender, 100000000 * 10 ** decimals());
        isExcludedFromFee[msg.sender] = true;
        isExcludedFromFee[opsClimateDAOWallet] = true;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }

    function transfer(address recipient, uint256 amount) public 
    virtual 
    override(ERC20) 
    returns (bool)
    {

        if(isExcludedFromFee[msg.sender]) {
            super.transfer(recipient, amount);
        }
        else {
            //Calulate the feetaken and the new amount to be transferred;
            (uint256 feeTaken, uint256 transferAmount) = _calculateTaxFee(amount);
            //call the function to distribute the fees as described in the Whitepaper
            _distributeFees(feeTaken);
            super.transfer(recipient, transferAmount);
        }
        
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
         *  initialFee = amount / initialTax 
         *  taxFraction = (expiry - timeSince) / expiry
         *  actualFee = initialFee * taxFraction 
         *  
         *  To avoid decimal issues, it's best to multiply all the numerators first, then denominators
         *  
         *  feeNumerator = amount * (expiry - timeSince) 
         *  feeDenominator = expiry * initialTax            // Requires a non-zero initialTaxFee 
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

        uint256 feeNumerator = amount.mul(_expiry.sub(timeSince)); 
        uint256 feeDenominator = _expiry.mul(_initialTaxFee); 
        feeTaken = feeNumerator.div(feeDenominator); 
        transferAmount = amount.sub(feeTaken); 

        return (feeTaken, transferAmount); 

    }

    function _distributeFees(uint256 fees) internal {

        uint256 percentageConstant = 100;
        //Fees as described in the Whitepaper, these add up to 100
        uint256 liquidityPoolPortion = fees.mul(60).div(percentageConstant);
        uint256 climateDaoOpsPortion = fees.mul(20).div(percentageConstant);
        uint256 climateDaoTreasuryPortion = fees.mul(20).div(percentageConstant);

        transfer(opsClimateDAOWallet, climateDaoOpsPortion);
        transfer(treasuryClimateDAOWallet, climateDaoTreasuryPortion);
        
    }
}
