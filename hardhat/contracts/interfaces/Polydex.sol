// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

interface Polydex{
    function swapExactTokensForTokens(
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint amountOutMin,
        address[] memory path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
}
