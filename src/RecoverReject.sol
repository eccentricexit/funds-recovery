// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract RecoverReject {
    constructor() {
        payable(msg.sender).transfer(address(this).balance);
    }
}
