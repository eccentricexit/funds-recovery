// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import 'forge-std/Test.sol';
import 'solmate/tokens/WETH.sol';

import '../src/RecoverReject.sol';

contract RecoverRejectTest is Test {
    RecoverReject recoverReject;
    address payable immutable recoverRejectAddr =
        payable(0x2e234DAe75C793f67A35089C9d99245E1C58470b);

    WETH weth;

    function setUp() public {
        payable(recoverRejectAddr).transfer(1 ether);

        weth = new WETH();
        weth.deposit{value: 1 ether}();
        weth.transfer(recoverRejectAddr, 1 ether);
    }

    function testRecoverTokens() public {
        assertEq(recoverRejectAddr.balance, 1 ether);
        recoverReject = new RecoverReject();
        assertEq(recoverRejectAddr.balance, 0);

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
