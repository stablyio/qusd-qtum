// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";

/**
 * @title QUSDImplementation
 * @dev This contract is a Pausable ERC20 token with issuance
 * controlled by a central Issuer. By implementing QUSDImplementation
 * this contract also includes external methods for setting
 * a new implementation contract for the Proxy.
 * NOTE: The storage defined here will actually be held in the Proxy
 * contract and all calls to this contract should be made through
 * the proxy, including admin actions done as owner or issuer.
 * Any call to transfer against this contract should fail
 * since the contract is paused and there are no balances.
 */
contract QUSDImplementation is IERC20, Initializable {
    /**
     * MATH
     */

    using SafeMath for uint256;

    /**
     * @dev DATA
     *
     * NOTE: Do NOT reorder any declared variables and ONLY append variables.
     * The proxy relies on existing variables to remain in the same address space.
     */

    // ERC20 CONSTANT DETAILS
    string internal _name;
    string internal _symbol;
    uint8 internal constant _decimals = 6;

    // ERC20 DATA
    uint256 internal _totalSupply;
    mapping(address => mapping(address => uint256)) internal _allowances;

    // LABELED TOKEN DATA
    mapping(uint32 => bool) public _labelExistence;
    mapping(uint32 => uint256) public _labelSupply;
    mapping(address => mapping(uint256 => uint32)) internal _userLabelQueue;
    mapping(address => uint256) internal _userLabelQueueHeadIndex;
    mapping(address => uint256) internal _userLabelQueueTailIndex;
    mapping(uint32 => mapping(address => uint256)) public _labelUserBalances;
    mapping(uint32 => mapping(address => bool)) public _labelUserExistence;
    mapping(address => uint256) internal _userBalances;
    uint32 internal _consolidationLabel;
    uint256 public _consolidationThreshold;

    // OWNER DATA
    address internal _owner;
    address internal _proposedOwner;

    // PAUSABILITY DATA
    bool internal _paused;

    // COMPLIANCE DATA
    address internal _complianceRole;
    mapping(address => bool) internal _frozen;

    // ISSUER DATA
    address internal _issuer;

    /**
     * EVENTS
     */

    // ERC20 EVENTS
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    // NON-STANDARD EVENTS
    event ChangeName(string oldName, string newName);
    event ChangeSymbol(string oldSymbol, string newSymbol);

    // OWNABLE EVENTS
    event OwnershipTransferProposed(
        address indexed currentOwner,
        address indexed proposedOwner
    );
    event OwnershipTransferDisregarded(address indexed oldProposedOwner);
    event OwnershipTransferred(
        address indexed oldOwner,
        address indexed newOwner
    );

    // PAUSABLE EVENTS
    event Pause();
    event Unpause();

    // COMPLIANCE EVENTS
    event FreezeAddress(address indexed addr);
    event UnfreezeAddress(address indexed addr);
    event WipeFrozenAddress(address indexed addr);
    event ComplianceRoleSet(
        address indexed oldComplianceRole,
        address indexed newComplianceRole
    );

    // ISSUER EVENTS
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);
    event IssuerSet(address indexed oldIssuer, address indexed newIssuer);

    // LABELED EVENTS
    event SetConsolidationThreshold(uint256 threshold);
    event SetConsolidationLabel(uint32 label);

    /**
     * FUNCTIONALITY
     */

    // INITIALIZATION FUNCTIONALITY

    /**
     * @dev sets 0 initial tokens, the owner, and the issuer.
     * this serves as the constructor for the proxy but compiles to the
     * memory model of the Implementation contract.
     */
    function initialize() public initializer {
        _name = "QUSD";
        _symbol = "QUSD";
        _owner = msg.sender;
        _proposedOwner = address(0);
        _complianceRole = address(0);
        _totalSupply = 0;
        _issuer = msg.sender;
        _consolidationLabel = 0;
        _consolidationThreshold = 0;
        _labelExistence[_consolidationLabel] = true;
    }

    // ERC20 GETTERS & SETTERS

    /**
     * @return The name of the token.
     */
    function name() external view returns (string memory) {
        return _name;
    }

    function changeName(string memory newName)
        external
        onlyOwner
        returns (bool)
    {
        emit ChangeName(_name, newName);
        _name = newName;
        return true;
    }

    /**
     * @return The symbol of the token.
     */
    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function changeSymbol(string memory newSymbol)
        external
        onlyOwner
        returns (bool)
    {
        emit ChangeSymbol(_symbol, newSymbol);
        _symbol = newSymbol;
        return true;
    }

    /**
     * @return The number of decimals of the token.
     */
    function decimals() external pure returns (uint8) {
        return _decimals;
    }

    /**
     * @return The total number of tokens in existence
     */
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Gets the balance of the specified address.
     * @param addr The address to query the balance of.
     * @return A uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address addr) external view override returns (uint256) {
        return _userBalances[addr];
    }

    // APPROVAL FUNCTIONALITY

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     */
    function approve(address spender, uint256 value)
        external
        override
        whenNotPaused
        returns (bool)
    {
        _approve(msg.sender, spender, value);

        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     * @param spender The address that will spend the tokens.
     * @param addedValue The increase in the number of tokens that can be spent.
     *
     * This mitigates the problem described in:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     */
    function increaseAllowance(address spender, uint256 addedValue)
        external
        whenNotPaused
        returns (bool)
    {
        _approve(
            msg.sender,
            spender,
            _allowances[msg.sender][spender].add(addedValue)
        );
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     * @param spender The address that will spend the tokens.
     * @param subtractedValue The decrease in the number of tokens that can be spent.
     *
     * This mitigates the problem described in:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     */
    function decreaseAllowance(address spender, uint256 subtractedValue)
        external
        whenNotPaused
        returns (bool)
    {
        _approve(
            msg.sender,
            spender,
            _allowances[msg.sender][spender].sub(subtractedValue)
        );
        return true;
    }

    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param owner address The address which owns the funds.
     * @param spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(address owner, address spender)
        external
        view
        override
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    /**
     * @dev Approve an address to spend another addresses' tokens.
     * @param owner The address that owns the tokens.
     * @param spender The address that will spend the tokens.
     * @param value The number of tokens that can be spent.
     */
    function _approve(
        address owner,
        address spender,
        uint256 value
    ) internal {
        require(!_frozen[owner] && !_frozen[spender], "address frozen");
        require(
            spender != address(0),
            "cannot approve allowance for zero address"
        );
        emit Approval(owner, spender, value);

        _allowances[owner][spender] = value;
    }

    // TRANSFER FUNCTIONALITY

    /**
     * @dev Transfer token to a specified address from msg.sender
     * Note: the use of Safemath ensures that value is nonnegative.
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function transfer(address to, uint256 value)
        external
        override
        whenNotPaused
        returns (bool)
    {
        emit Transfer(msg.sender, to, value);
        _transfer(msg.sender, to, value);

        return true;
    }

    /**
     * @dev Transfers a specific labeled token only.
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     * @param label The label to transfer under.
     */
    function transferForLabel(
        address to,
        uint256 value,
        uint32 label
    ) external whenNotPaused returns (bool) {
        emit Transfer(msg.sender, to, value);
        _transferForLabel(msg.sender, to, value, label);

        return true;
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     * @param value uint256 the amount of tokens to be transferred
     */
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external override whenNotPaused returns (bool) {
        require(
            value <= _allowances[from][msg.sender],
            "insufficient allowance"
        );
        emit Transfer(from, to, value);

        _allowances[from][msg.sender] = _allowances[from][msg.sender].sub(
            value
        );
        _transfer(from, to, value);

        return true;
    }

    function _transfer(
        address from,
        address to,
        uint256 value
    ) internal {
        require(value <= _userBalances[from], "insufficient funds");

        uint256 remainder = value;
        while (remainder > 0) {
            uint32 headLabel = _peekUserLabelQueue(from);
            uint256 availableUnderLabel = _labelUserBalances[headLabel][from];
            if (availableUnderLabel >= remainder) {
                // We've fulfilled the whole tx
                _transferForLabelQueueHead(from, to, remainder);
                return;
            } else {
                // We will need to keep iterating to fulfill the tx
                _transferForLabelQueueHead(from, to, availableUnderLabel);
                remainder = remainder.sub(availableUnderLabel);
            }
        }
    }

    function _transferForLabelQueueHead(
        address from,
        address to,
        uint256 value
    ) internal whenNotPaused {
        uint32 label = _peekUserLabelQueue(from);
        _transferForLabel(from, to, value, label);
        if (_labelUserBalances[label][from] == 0) {
            _dequeueUserLabelQueue(from);
        }
    }

    function _transferForLabel(
        address from,
        address to,
        uint256 value,
        uint32 label
    ) internal whenNotPaused {
        require(to != address(0), "cannot transfer to address zero");
        require(!_frozen[from] && !_frozen[to], "address frozen");
        require(value <= _userBalances[from], "insufficient funds");

        _labelUserBalances[label][from] = _labelUserBalances[label][from].sub(
            value
        );
        _userBalances[from] = _userBalances[from].sub(value);

        uint32 destinationLabel = label;
        if (
            !_labelExistence[destinationLabel] ||
            value <= _consolidationThreshold
        ) {
            destinationLabel = _consolidationLabel;
            _labelSupply[label] = _labelSupply[label].sub(value);
            _labelSupply[destinationLabel] = _labelSupply[_consolidationLabel]
                .add(value);
        }
        if (!_labelUserExistence[destinationLabel][to]) {
            _enqueueUserLabelQueue(to, destinationLabel);
        }
        _labelUserBalances[destinationLabel][to] = _labelUserBalances[
            destinationLabel
        ][to]
            .add(value);
        _userBalances[to] = _userBalances[to].add(value);
    }

    // OWNER FUNCTIONALITY

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == _owner, "only the owner can call this function");
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
        emit OwnershipTransferProposed(_owner, newProposedOwner);

        _proposedOwner = newProposedOwner;
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
        emit OwnershipTransferDisregarded(_proposedOwner);

        _proposedOwner = address(0);
    }

    /**
     * @dev Allows the proposed owner to complete transferring control of the contract to the proposedOwner.
     */
    function claimOwnership() external {
        require(msg.sender == _proposedOwner, "onlyProposedOwner");
        emit OwnershipTransferred(_owner, _proposedOwner);

        _owner = _proposedOwner;
        _proposedOwner = address(0);
    }

    // PAUSABILITY FUNCTIONALITY

    /**
     * @dev Pause status
     */
    function paused() external view returns (bool) {
        return _paused;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not _paused.
     */
    modifier whenNotPaused() {
        require(!_paused, "whenNotPaused");
        _;
    }

    /**
     * @dev called by the owner to pause, triggers stopped state
     */
    function pause() external onlyOwner {
        require(!_paused, "already _paused");
        emit Pause();

        _paused = true;
    }

    /**
     * @dev called by the owner to unpause, returns to normal state
     */
    function unpause() external onlyOwner {
        require(_paused, "already un_paused");
        emit Unpause();

        _paused = false;
    }

    // COMPLIANCE FUNCTIONALITY

    /**
     * @dev Current compliance role
     */
    function complianceRole() external view returns (address) {
        return _complianceRole;
    }

    /**
     * @dev Gets the frozen status of the specified address.
     * @param addr The address to query the the status of.
     * @return A bool representing whether the address is frozen.
     */
    function frozen(address addr) external view returns (bool) {
        return _frozen[addr];
    }

    /**
     * @dev Sets a new compliance role address.
     * @param newComplianceRole The new address allowed to freeze/unfreeze addresses and seize their tokens.
     */
    function setComplianceRole(address newComplianceRole) external {
        require(
            msg.sender == _complianceRole || msg.sender == _owner,
            "only complianceRole or Owner"
        );
        emit ComplianceRoleSet(_complianceRole, newComplianceRole);

        _complianceRole = newComplianceRole;
    }

    modifier onlyComplianceRole() {
        require(msg.sender == _complianceRole, "onlyComplianceRole");
        _;
    }

    /**
     * @dev Freezes an address balance from being transferred.
     * @param addr The new address to freeze.
     */
    function freeze(address addr) external onlyComplianceRole {
        require(!_frozen[addr], "address already frozen");
        emit FreezeAddress(addr);

        _frozen[addr] = true;
    }

    /**
     * @dev Unfreezes an address balance allowing transfer.
     * @param addr The new address to unfreeze.
     */
    function unfreeze(address addr) external onlyComplianceRole {
        require(_frozen[addr], "address already unfrozen");
        emit UnfreezeAddress(addr);

        _frozen[addr] = false;
    }

    /**
     * @dev Wipes the balance of a frozen address, burning the tokens
     * and setting the approval to zero.
     * @param addr The new frozen address to wipe.
     */
    function wipeFrozenAddress(address addr) external onlyComplianceRole {
        require(_frozen[addr], "address is not frozen");
        emit Burn(addr, _userBalances[addr]);
        emit Transfer(addr, address(0), _userBalances[addr]);
        emit WipeFrozenAddress(addr);

        _burn(addr, _userBalances[addr]);
    }

    // ISSUER FUNCTIONALITY

    /**
     * @dev Current issuer
     */
    function issuer() external view returns (address) {
        return _issuer;
    }

    /**
     * @dev Sets a new issuer address.
     * @param newIssuer The address allowed to mint tokens to control supply.
     */
    function setIssuer(address newIssuer) external onlyOwner {
        require(newIssuer != address(0), "cannot set issuer to address zero");
        emit IssuerSet(_issuer, newIssuer);

        _issuer = newIssuer;
    }

    modifier onlyIssuer() {
        require(msg.sender == _issuer, "onlyIssuer");
        _;
    }

    // MINT FUNCTIONALITY

    /**
     * @dev Increases the total supply by minting the specified number of tokens to the issuer account.
     * @param value The number of tokens to add.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(uint256 value) external onlyIssuer returns (bool) {
        _mintForLabel(msg.sender, value, _consolidationLabel);

        return true;
    }

    function mintForLabel(uint256 value, uint32 label)
        external
        onlyIssuer
        returns (bool success)
    {
        _mintForLabel(msg.sender, value, label);

        return true;
    }

    /**
     * @dev Increases the total supply by minting the specified number of tokens to the specified account.
     * @param value The number of tokens to add.
     * @return A boolean that indicates if the operation was successful.
     */
    function mintTo(address to, uint256 value)
        external
        onlyIssuer
        returns (bool)
    {
        _mintForLabel(to, value, _consolidationLabel);

        return true;
    }

    function mintToForLabel(
        address to,
        uint256 value,
        uint32 label
    ) external onlyIssuer returns (bool) {
        _mintForLabel(to, value, label);

        return true;
    }

    /**
     * @dev Internal function that mints an amount of the token and assigns it to
     * an account. This encapsulates the modification of _userBalances such that the
     * proper events are emitted.
     * @param to The account that will receive the created tokens.
     * @param value The amount that will be created.
     * @param label The label to mint under
     */
    function _mintForLabel(
        address to,
        uint256 value,
        uint32 label
    ) internal onlyIssuer whenNotPaused {
        require(to != address(0), "cannot mint to address zero");
        require(!_frozen[to], "address frozen");
        emit Mint(to, value);
        emit Transfer(address(0), to, value);

        if (!_labelUserExistence[label][to]) {
            _enqueueUserLabelQueue(to, label);
        }
        _labelUserBalances[label][to] = _labelUserBalances[label][to].add(
            value
        );
        _userBalances[to] = _userBalances[to].add(value);
        _totalSupply = _totalSupply.add(value);
        _labelSupply[label] = _labelSupply[label].add(value);
    }

    // BURN FUNCTIONALITY

    /**
     * @dev Decreases the total supply by burning the specified number of tokens.
     * @param value The number of tokens to remove.
     * @return A boolean that indicates if the operation was successful.
     */
    function burn(uint256 value) external returns (bool) {
        require(!_frozen[msg.sender], "address frozen");
        require(value <= _userBalances[msg.sender], "insufficient funds");
        emit Burn(msg.sender, value);
        emit Transfer(msg.sender, address(0), value);

        _burn(msg.sender, value);

        return true;
    }

    /**
     * @dev Burns tokens only under a specific label.
     * @param value The number of tokens to remove.
     * @param label The label to burn for.
     * @return A boolean that indicates if the operation was successful.
     */
    function burnForLabel(uint256 value, uint32 label) external returns (bool) {
        require(!_frozen[msg.sender], "address frozen");
        require(value <= _userBalances[msg.sender], "insufficient funds");
        emit Burn(msg.sender, value);
        emit Transfer(msg.sender, address(0), value);

        _burnForLabel(msg.sender, value, label);

        return true;
    }

    /**
     * @dev Decreases the total supply by burning the specified number of tokens from the specified address.
     * @param value The number of tokens to remove.
     * @return A boolean that indicates if the operation was successful.
     */
    function burnFrom(address from, uint256 value) external returns (bool) {
        require(!_frozen[from] && !_frozen[msg.sender], "address frozen");
        require(value <= _userBalances[from], "insufficient funds");
        require(
            value <= _allowances[from][msg.sender],
            "insufficient allowance"
        );
        emit Burn(from, value);
        emit Transfer(from, address(0), value);

        _burn(from, value);
        _allowances[from][msg.sender] = _allowances[from][msg.sender].sub(
            value
        );

        return true;
    }

    /**
     * @dev Internal function that burns an amount of the token of a given
     * account.
     * @param addr The account whose tokens will be burnt.
     * @param value The amount that will be burnt.
     */
    function _burn(address addr, uint256 value) internal {
        uint256 remainder = value;
        while (remainder >= 0) {
            uint32 label = _peekUserLabelQueue(addr);
            uint256 availableUnderLabel = _labelUserBalances[label][addr];
            if (availableUnderLabel >= remainder) {
                // We've fulfilled the whole tx
                _burnForLabelQueueHead(addr, remainder);
                return;
            } else {
                // We will need to keep iterating to fulfill the tx
                _burnForLabelQueueHead(addr, availableUnderLabel);
                remainder = remainder.sub(availableUnderLabel);
            }
        }
    }

    function _burnForLabelQueueHead(address addr, uint256 value)
        internal
        whenNotPaused
    {
        uint32 label = _peekUserLabelQueue(addr);
        _burnForLabel(addr, value, label);
        if (_labelUserBalances[label][addr] == 0) {
            _dequeueUserLabelQueue(addr);
        }
    }

    /**
     * @dev Internal function that burns an amount of the token of a given
     * account.
     * @param addr The account whose tokens will be burnt.
     * @param value The amount that will be burnt.
     * @param label The label to burn under
     */
    function _burnForLabel(
        address addr,
        uint256 value,
        uint32 label
    ) internal whenNotPaused {
        _labelUserBalances[label][addr] = _labelUserBalances[label][addr].sub(
            value
        );
        _userBalances[addr] = _userBalances[addr].sub(value);
        _totalSupply = _totalSupply.sub(value);
        _labelSupply[label] = _labelSupply[label].sub(value);
    }

    // LABEL FUNCTIONALITY

    function labelSupply(uint32 label) external view returns (uint256) {
        return _labelSupply[label];
    }

    function labelBalanceOf(address addr, uint32 label)
        external
        view
        returns (uint256)
    {
        return _labelUserBalances[label][addr];
    }

    function setConsolidationThreshold(uint256 newConsolidationThreshold)
        external
        onlyOwner
        returns (bool)
    {
        emit SetConsolidationThreshold(newConsolidationThreshold);
        _consolidationThreshold = newConsolidationThreshold;

        return true;
    }

    function setConsolidationLabel(uint32 newConsolidationLabel)
        external
        onlyOwner
        returns (bool)
    {
        emit SetConsolidationLabel(newConsolidationLabel);
        _consolidationLabel = newConsolidationLabel;

        return true;
    }

    function consolidationLabel() external view returns (uint32) {
        return _consolidationLabel;
    }

    function balanceOfUserForLabel(address addr, uint32 label)
        external
        view
        returns (uint256)
    {
        return _labelUserBalances[label][addr];
    }

    function addLabel(uint32 label) external onlyIssuer returns (bool) {
        _labelExistence[label] = true;
        return true;
    }

    function removeLabel(uint32 label) external onlyIssuer returns (bool) {
        _labelExistence[label] = false;
        return true;
    }

    function _enqueueUserLabelQueue(address user, uint32 label) internal {
        require(
            !_labelUserExistence[label][user],
            "label already exists for user"
        );
        if (_userLabelQueueTailIndex[user] == 0) {
            // New queue init
            _userLabelQueueHeadIndex[user] = 1;
        }
        _userLabelQueueTailIndex[user] = _userLabelQueueTailIndex[user].add(1);
        uint256 newTailIndex = _userLabelQueueTailIndex[user];
        _userLabelQueue[user][newTailIndex] = label;
        _labelUserExistence[label][user] = true;
    }

    function _dequeueUserLabelQueue(address user) internal {
        require(
            _userLabelQueueHeadIndex[user] <= _userLabelQueueTailIndex[user],
            "empty queue"
        );

        uint256 oldHeadIndex = _userLabelQueueHeadIndex[user];
        uint32 oldLabel = _userLabelQueue[user][oldHeadIndex];
        _labelUserExistence[oldLabel][user] = false;
        _userLabelQueueHeadIndex[user] = _userLabelQueueHeadIndex[user].add(1);
        _userLabelQueue[user][oldHeadIndex] = 0;
    }

    function _peekUserLabelQueue(address user) internal view returns (uint32) {
        uint256 headIndex = _userLabelQueueHeadIndex[user];
        return _userLabelQueue[user][headIndex];
    }

    function userLabelQueueLength(address user)
        external
        view
        returns (uint256)
    {
        return
            _userLabelQueueTailIndex[user] - _userLabelQueueHeadIndex[user] + 1;
    }
}
