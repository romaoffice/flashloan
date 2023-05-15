// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/UniswapRouterInterfaceV5.sol";
import "./interfaces/IPoolAddressesProvider.sol";
import "./interfaces/IPool.sol";


contract Executor is Ownable {

    IPoolAddressesProvider public ADDRESSES_PROVIDER;
    IPool public POOL;

    struct Arbitrage {
        uint        firstAmount;
        address     targetAddress;
        address[]   paths;
        address[]   routers;
    }

    constructor (
        address provider,
        address pool
        ) {
            ADDRESSES_PROVIDER = IPoolAddressesProvider(provider);
            POOL = IPool(pool);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool rt){
        (Arbitrage memory arbData) = abi.decode(params, (Arbitrage));

        arbData.firstAmount = amount;
        //execute arbitrage
        _executeswap(arbData);

        //refund borrowed and fee
        ERC20(asset).approve(address(POOL),amount+premium);
        ERC20(asset).transfer(address(POOL),amount+premium);

        //return profit to wallet
        uint remain = ERC20(asset).balanceOf(address(this));
        ERC20(asset).approve(initiator,remain);
        ERC20(asset).transfer(initiator,remain);
        rt = true;
    }
    
    function executeswap(
        Arbitrage memory arbData
    ) external  {
        ERC20(arbData.paths[0]).transferFrom(msg.sender, address(this), arbData.firstAmount);
        _executeswap(arbData);
    }

    function _executeswap(
        Arbitrage memory arbData
    )internal {
        uint inAmount ;
        uint outAmount = arbData.firstAmount;
        address[] memory _path = new address[](2);
        uint[] memory amounts;
        address toAddress;
        for(uint i=0;i<arbData.routers.length;i++){
            _path[0] = arbData.paths[i];
            _path[1] = arbData.paths[i+1];
            inAmount = outAmount;
            if(i<=arbData.routers.length-1) {
                toAddress = arbData.targetAddress;
            }else{
                toAddress = arbData.routers[i+1];
            }
            ERC20(_path[0]).approve(address(arbData.routers[i]), inAmount);
            amounts = UniswapRouterInterfaceV5(arbData.routers[i]).swapExactTokensForTokens(
                inAmount,
                0,
                _path,
                toAddress,
                block.timestamp + 900
                );
            outAmount = amounts[1];
        }
        
    }


}