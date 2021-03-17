// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../contracts/QUSDImplementation.sol"; // Workaround Truffle duplicate artifacts different paths issues

/**
 * @title QUSDIssuer
 * @dev This contract will be the issuer for QUSD. It provides a check and balance on
 * token issuance by requiring mints to be first proposed and a certain number of blocks
 * to have passed before it can be executed. This gives other issuers a time to check
 * that the issuance is valid and if not, reject the mint.
 */
contract QUSDIssuer {
    using SafeMath for uint256;

    // IMPLEMENTATION
    QUSDImplementation internal _implementation;
    event ImplementationChange(
        address oldImplementation,
        address newImplementation
    );

    // CONSTANTS
    uint8 internal constant _maxMembers = 255;

    // MEMBERSHIP DATA
    mapping(address => bool) internal _members;
    uint8 internal _numMembers;
    event AddMember(address indexed member);
    event RemoveMember(address indexed member);

    // WAIT TIME
    uint256 internal _mintWaitBlocks;
    event MintWaitBlocksUpdated(
        uint256 oldMintWaitBlocks,
        uint256 newMintWaitBlocks
    );

    // PENDING TXS
    struct PendingMint {
        address recipient;
        uint256 value;
        uint32 label;
        uint256 canMintAtBlock;
    }
    // NOTE: pendingMints is public and will generate a getter automatically
    // Current solidity version does not support returning structs so we fall back to this
    mapping(uint256 => PendingMint) public pendingMints;
    uint256 internal _pendingMintsIndex;
    event MintProposed(address indexed proposer, uint256 pendingMintsIndex);
    event MintSent(address indexed sender, uint256 pendingMintsIndex);
    event MintRejected(address indexed sender, uint256 pendingMintsIndex);

    // OWNER
    address internal _owner;
    address internal _proposedOwner;
    event OwnershipTransferProposed(
        address indexed currentOwner,
        address indexed proposedOwner
    );
    event OwnershipTransferDisregarded(address indexed oldProposedOwner);
    event OwnershipTransferred(
        address indexed oldOwner,
        address indexed newOwner
    );

    // CONSTRUCTOR

    constructor(address initialImplementation, uint256 initialMintWaitBlocks)
        public
    {
        _numMembers = 0;
        _mintWaitBlocks = initialMintWaitBlocks;
        _pendingMintsIndex = 0;
        _owner = msg.sender;
        _proposedOwner = address(0);
        _implementation = QUSDImplementation(initialImplementation);
    }

    // IMPLEMENTATION LOGIC

    /**
     * @return The address of the implementation.
     */
    function implementation() external view returns (address) {
        return address(_implementation);
    }

    /**
     * @dev Sets the implementation contract address.
     * @param implementationAddress The address of the implementation to point to.
     */
    function setImplementation(address implementationAddress)
        external
        onlyOwner
    {
        emit ImplementationChange(
            address(_implementation),
            implementationAddress
        );
        _implementation = QUSDImplementation(implementationAddress);
    }

    // MEMBERSHIP LOGIC

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyMember() {
        require(_members[msg.sender], "onlyMember");
        _;
    }

    /**
     * @return Whether the address is a member.
     */
    function isMember(address addr) external view returns (bool) {
        return _members[addr];
    }

    /**
     * @return The maximum members allowed.
     */
    function maxMembers() external pure returns (uint8) {
        return _maxMembers;
    }

    /**
     * @return The current number of members.
     */
    function numMembers() external view returns (uint8) {
        return _numMembers;
    }

    /**
     * @dev Adds a new member.
     * @param addr The address to add.
     */
    function addMember(address addr) external onlyOwner {
        require(_numMembers < _maxMembers, "exceeds the membership limit");
        require(!_members[addr], "already a member");
        _members[addr] = true;
        _numMembers += 1;
        emit AddMember(addr);
    }

    /**
     * @dev Removes an existing member.
     * @param addr The address to remove.
     */
    function removeMember(address addr) external onlyOwner {
        require(_members[addr], "not a member");
        _members[addr] = false;
        _numMembers -= 1;
        emit RemoveMember(addr);
    }

    // WAIT TIME

    /**
     * @return The minimum number of blocks a pending mint must wait before it can be sent.
     */
    function mintWaitBlocks() external view returns (uint256) {
        return _mintWaitBlocks;
    }

    function setMintWaitBlocks(uint256 newMintWaitBlocks)
        external
        onlyOwner
        returns (bool)
    {
        emit MintWaitBlocksUpdated(_mintWaitBlocks, newMintWaitBlocks);
        _mintWaitBlocks = newMintWaitBlocks;

        return true;
    }

    // MINT FUNCTIONALITY

    /**
     * @return The index of the next new pending mint.
     */
    function pendingMintsIndex() external view returns (uint256) {
        return _pendingMintsIndex;
    }

    /**
     * @dev Creates a mint proposal that must wait _mintWaitBlocks blocks before it can be executed.
     * @param to The recipient of the minted tokens.
     * @param value The number of tokens to mint.
     * @return A uint256 that represents the index of the mint proposal.
     */
    function proposeMint(address to, uint256 value)
        external
        onlyMember
        returns (uint256)
    {
        pendingMints[_pendingMintsIndex] = PendingMint(
            to,
            value,
            0,
            block.number + _mintWaitBlocks
        );
        emit MintProposed(msg.sender, _pendingMintsIndex);
        uint256 proposedIndex = _pendingMintsIndex;
        _pendingMintsIndex += 1;

        return proposedIndex;
    }

    /**
     * @dev Creates a mint proposal with a label that must wait _mintWaitBlocks blocks before it can be executed.
     * @param to The recipient of the minted tokens.
     * @param value The number of tokens to mint.
     * @param label The label to mint under
     * @return A uint256 that represents the index of the mint proposal.
     */
    function proposeMintForLabel(
        address to,
        uint256 value,
        uint32 label
    ) external onlyMember returns (uint256) {
        pendingMints[_pendingMintsIndex] = PendingMint(
            to,
            value,
            label,
            block.number + _mintWaitBlocks
        );
        emit MintProposed(msg.sender, _pendingMintsIndex);
        uint256 proposedIndex = _pendingMintsIndex;
        _pendingMintsIndex += 1;

        return proposedIndex;
    }

    /**
     * @dev Executes a mint proposal that has waited sufficient blocks.
     * @param index The index of the _pendingMints to execute.
     * @return A boolean that indicates if the operation was successful.
     */
    function sendMint(uint256 index) external onlyMember returns (bool) {
        require(
            block.number >= pendingMints[index].canMintAtBlock,
            "cannot send mint until sufficient blocks have passed"
        );

        _implementation.mintToForLabel(
            pendingMints[index].recipient,
            pendingMints[index].value,
            pendingMints[index].label
        );
        emit MintSent(msg.sender, index);
        delete pendingMints[index];

        return true;
    }

    /**
     * @dev Deletes the mint proposal, can be called by any issuer on any mint proposal, provides a check
     * and balance on token minting.
     * @param index The index of the _pendingMints to delete.
     * @return A boolean that indicates if the operation was successful.
     */
    function rejectMint(uint256 index) external onlyMember returns (bool) {
        require(
            pendingMints[index].value > 0,
            "this pending mint does not exist"
        );

        emit MintRejected(msg.sender, index);
        delete pendingMints[index];

        return true;
    }

    // OWNER FUNCTIONALITY

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == _owner, "onlyOwner");
        _;
    }

    /**
     * @dev Current owner
     */
    function owner() external view returns (address) {
        return _owner;
    }

    /**
     * @dev Proposed new owner
     */
    function proposedOwner() external view returns (address) {
        return _proposedOwner;
    }

    /**
     * @dev Allows the current owner to begin transferring control of the contract to a proposedOwner
     * @param newProposedOwner The address to transfer ownership to.
     */
    function proposeOwner(address newProposedOwner) external onlyOwner {
        require(
            newProposedOwner != address(0),
            "cannot transfer ownership to address zero"
        );
        require(msg.sender != newProposedOwner, "caller already is owner");

        _proposedOwner = newProposedOwner;
        emit OwnershipTransferProposed(_owner, _proposedOwner);
    }

    /**
     * @dev Allows the current owner or proposed owner to cancel transferring control of the contract to a proposedOwner
     */
    function disregardProposeOwner() external {
        require(
            msg.sender == _proposedOwner || msg.sender == _owner,
            "only proposedOwner or owner"
        );
        require(
            _proposedOwner != address(0),
            "can only disregard a proposed owner that was previously set"
        );

        address oldProposedOwner = _proposedOwner;
        _proposedOwner = address(0);
        emit OwnershipTransferDisregarded(oldProposedOwner);
    }

    /**
     * @dev Allows the proposed owner to complete transferring control of the contract to the proposedOwner.
     */
    function claimOwnership() external {
        require(msg.sender == _proposedOwner, "onlyProposedOwner");

        address oldOwner = _owner;
        _owner = _proposedOwner;
        _proposedOwner = address(0);
        emit OwnershipTransferred(oldOwner, _owner);
    }

    // LABEL MANAGEMENT

    function addLabel(uint32 label) external onlyMember returns (bool) {
        return _implementation.addLabel(label);
    }

    function removeLabel(uint32 label) external onlyMember returns (bool) {
        return _implementation.removeLabel(label);
    }
}
