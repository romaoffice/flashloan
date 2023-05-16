// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

interface UniswapNew{
	function swapExactTokensForTokens(
		uint amountIn,
		uint amountOutMin,
		address[] calldata path,
		address to
	) external returns (uint amounts);

	function swapTokensForExactTokens(
		uint amountOut,
		uint amountInMax,
		address[] calldata path,
		address to
	) external returns (uint amounts);
}

interface UniswapV3 {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
	function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
	
}