// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Faucet is AccessControl{

    // 2 mins dealay added -> in real change to 86400(1 day in seconds)
    uint256 constant ONE_DAY = 120; 

    // Black List the address to stop faucet from contract
    mapping(address => bool) public blackListAddress;

    // time period to lock the address until next time 
    uint256 lockPeriod;

    // max amount that each wallet can be facuted in thier life time
    uint256 maxFaucetAmount;

    // walletAddress => token => when last faucet Time
    mapping(address =>mapping(address => uint256)) public lastFaucetTime;

    // walletAddress => token => total amount faucted in lifetime
    mapping(address =>mapping(address => uint256)) public faucetTokenAmount;

    constructor(address _defaultAdmin, uint256 _maxFaucetAmount){
        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        lockPeriod = 1 * ONE_DAY;
        maxFaucetAmount = _maxFaucetAmount;
    }

    event TokenTransfered(
        uint256 indexed timestamp,
        address indexed tokenReceiver,
        address indexed tokenAddress,
        uint256 amount
    );

    event TokenWithdrawed(
        address indexed admin,
        address indexed tokenAddress,
        uint256 amount
    );

    event BlackListAddress(
        address indexed blackListedAddress,
        bool isBlackListed
    );

    event UpdatedMaxAmount(
        uint256 indexed _previousAmount,
        uint256 indexed _newMaxAmount
    );

    // faucet token to their wallet
    // only function caller can receive token to his wallet
    function faucetToken(
        address _tokenAddress,
        uint256 _amount 
    ) external {

        require( _tokenAddress != address(0),"Address Shouldn't be zero");
        require(!_isContract(msg.sender),"Contracts Address are not allowed");
        require(!_isBlocked(msg.sender),"Address got blackListed");
        require(!_isAlreadyFauceted(msg.sender, _tokenAddress),"Address already fauceted");
        require(_isMaxFaucted(msg.sender, _tokenAddress, _amount),"Address faucted max amount");

        // store last faucted time to avoid over draning amount from faucet
        lastFaucetTime[msg.sender][_tokenAddress] = block.timestamp;

        // update the faucted value to the mapping
        faucetTokenAmount[msg.sender][_tokenAddress] += _amount;

        //transfer erc20 tokens from faucet contract to user
        IERC20(_tokenAddress).transfer(msg.sender, _amount);

        emit TokenTransfered(block.timestamp, msg.sender, _tokenAddress, _amount);

    }


    // faucet token to other wallets
    // receive token to his specified wallet address
    function faucteTokenToAnotherAddress(
        address _walletAddress,
        address _tokenAddress,
        uint256 _amount 
    ) external {

        require(_walletAddress != address(0) && _tokenAddress != address(0),"Address Shouldn't be zero");
        require(!_isContract(_walletAddress),"Contracts Address are not allowed");
        require(!_isBlocked(_walletAddress),"Address got blackListed");
        require(!_isAlreadyFauceted(_walletAddress, _tokenAddress),"Address already fauceted");
        require(_isMaxFaucted(_walletAddress, _tokenAddress, _amount),"Address faucted max amount");
        
        // store last faucted time to avoid over draning amount from faucet
        lastFaucetTime[_walletAddress][_tokenAddress] = block.timestamp;

        // update the faucted value to the mapping
        faucetTokenAmount[_walletAddress][_tokenAddress] += _amount;

        //transfer erc20 tokens from faucet contract to user
        IERC20(_tokenAddress).transfer(_walletAddress, _amount);

        emit TokenTransfered(block.timestamp, _walletAddress, _tokenAddress, _amount);

    }
    
    // admin can withdraw the locked erc20 tokens from the contract
    // these are admin actions
    function withdrawTokens(address _tokenAddress, uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE){
        //transfer erc20 tokens from faucet contract to admin
        IERC20(_tokenAddress).transfer(msg.sender, _amount);

        emit TokenWithdrawed(msg.sender, _tokenAddress, _amount);
    }

    // update the max faucet amount for liftime per wallet 
    // these are admin actions
    function updateMaxAmount(uint256 _newMaxAmount) external onlyRole(DEFAULT_ADMIN_ROLE){
        uint256 _previousAmount = maxFaucetAmount;
        maxFaucetAmount = _newMaxAmount;
        emit UpdatedMaxAmount(_previousAmount, _newMaxAmount);
    }


    // add address to the black list part
    // these are admin actions
    function blacklistAddress(address _walletAddress) external onlyRole(DEFAULT_ADMIN_ROLE){
        
        blackListAddress[_walletAddress] = true;

        emit BlackListAddress(_walletAddress, true);
    }

    // remove address from the black list part
     // these are admin actions
    function removeblacklistAddress(address _walletAddress) external onlyRole(DEFAULT_ADMIN_ROLE){
       
        blackListAddress[_walletAddress] = false;
       
        emit BlackListAddress(_walletAddress, false);
    }

    // checks that given address is a contract address are not
    // returns true if given address is a contract else false.
    function _isContract(address _address) private view returns (bool isContract){
        uint32 size;
        assembly {
            size := extcodesize(_address)
        }
        return (size > 0);
    }

    // checks address is faucted max amount for his life time .
    function _isMaxFaucted(address _walletAddress, address _tokenAddress, uint256 _amount) private view  returns (bool isBlocked){
      return (faucetTokenAmount[_walletAddress][_tokenAddress] + _amount) <= maxFaucetAmount;
    }

    // checks address is blocked / restricted to faucet the amount from contract.
    function _isBlocked(address _address) private view  returns (bool isBlocked){
      return blackListAddress[_address];
    }

    // checks address is blocked for specific lock period. (
    // external function to see or access from outside the contrcat
    function isFaucetPossible(address _walletAddress, address _tokenAddress) external view returns (bool isPossible){
      return _isAlreadyFauceted(_walletAddress, _tokenAddress);
    }

    // checks address is blocked for specific lock period.
    function _isAlreadyFauceted(address _walletAddress, address _tokenAddress) private view returns (bool isAlreadyFauceted){
      isAlreadyFauceted = false;
      if(lastFaucetTime[_walletAddress][_tokenAddress] != 0){
        isAlreadyFauceted = (lastFaucetTime[_walletAddress][_tokenAddress]  + lockPeriod) < block.timestamp ? false : true;
      }
    }
    

    // purpose of this function is to receive tokens or ethers from other external contracts / accounts
    receive() external payable{

    }

}