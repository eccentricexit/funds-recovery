// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract RecoverReject {
    address private owner;

    constructor() {
        owner = msg.sender;
        payable(msg.sender).transfer(address(this).balance);
    }

    function arbitraryCall(
        address payable _target,
        uint256 _value,
        bytes calldata _data
    ) external payable {
        require(msg.sender == owner);
        _target.call{value: _value}(_data);
    }

    function changeOwner(address _newOwner) external {
        require(msg.sender == owner);
        owner = _newOwner;
    }
}
