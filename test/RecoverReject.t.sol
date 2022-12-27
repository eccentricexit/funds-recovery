// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import 'forge-std/Test.sol';
import 'solmate/tokens/WETH.sol';

import '../src/RecoverReject.sol';

contract RecoverRejectTest is Test {
    RecoverReject recoverReject;
    address payable immutable recoverRejectAddr =
        payable(0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f);

    WETH weth;

    function setUp() public {
        payable(recoverRejectAddr).transfer(1 ether);
        recoverReject = new RecoverReject();

        weth = new WETH();
        weth.deposit{value: 1 ether}();
        weth.transfer(recoverRejectAddr, 1 ether);
    }

    function testRecoverTokens() public {
        assertEq(weth.balanceOf(recoverRejectAddr), 1 ether);
        recoverReject.arbitraryCall(
            payable(weth),
            0,
            abi.encodeWithSignature(
                'transfer(address,uint256)',
                address(this),
                1 ether
            )
        );
        assertEq(weth.balanceOf(recoverRejectAddr), 0);
    }

    receive() external payable {}
}
