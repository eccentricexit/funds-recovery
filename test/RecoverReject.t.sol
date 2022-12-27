// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import 'forge-std/Test.sol';
import '../src/RecoverReject.sol';

contract RecoverRejectTest is Test {
    RecoverReject recoverReject;
    address payable immutable recoverRejectAddr =
        payable(0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f);

    function setUp() public {
        payable(recoverRejectAddr).transfer(1 ether);
        recoverReject = new RecoverReject();
    }

    receive() external payable {}
}
