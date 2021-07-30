pragma solidity ^0.4.18;

/* taking ideas from FirstBlood token */
contract SafeMath {
    function SafeMath() public {}

    function safeAdd(uint256 _x, uint256 _y) internal pure returns (uint256) {
        uint256 z = _x + _y;
        assert(z >= _x);
        return z;
    }

    function safeSub(uint256 _x, uint256 _y) internal pure returns (uint256) {
        assert(_x >= _y);
        return _x - _y;
    }

    function safeMul(uint256 _x, uint256 _y) internal pure returns (uint256) {
        uint256 z = _x * _y;
        assert(_x == 0 || z / _x == _y);
        return z;
    }
}

/**
    QRC20Token Standard Token implementation
*/
contract QRC20Token is SafeMath {
    string public constant standard = "Token 0.1";
    uint8 public constant decimals = 8; // it's recommended to set decimals to 8 in QTUM

    // you need change the following three values
    string public constant name = "Stably USD";
    string public constant symbol = "QUSD";
    //Default assumes totalSupply can't be over max (2^256 - 1).
    //you need multiply 10^decimals by your real total supply.
    uint256 public totalSupply = 10**9 * 10**uint256(decimals);
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Mint(address indexed _to, uint256 _value);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Burn(address indexed _from, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    function QRC20Token() public {
        balanceOf[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    // validates an address - currently only checks that it isn't null
    modifier validAddress(address _address) {
        require(_address != 0x0);
        _;
    }
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function transfer(address _to, uint256 _value)
        public
        validAddress(_to)
        returns (bool success)
    {
        balanceOf[msg.sender] = safeSub(balanceOf[msg.sender], _value);
        balanceOf[_to] = safeAdd(balanceOf[_to], _value);
        Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public validAddress(_from) validAddress(_to) returns (bool success) {
        allowance[_from][msg.sender] = safeSub(
            allowance[_from][msg.sender],
            _value
        );
        balanceOf[_from] = safeSub(balanceOf[_from], _value);
        balanceOf[_to] = safeAdd(balanceOf[_to], _value);
        Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value)
        public
        validAddress(_spender)
        returns (bool success)
    {
        // To change the approve amount you first have to reduce the addresses`
        //  allowance to zero by calling `approve(_spender, 0)` if it is not
        //  already 0 to mitigate the race condition described here:
        //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
        require(_value == 0 || allowance[msg.sender][_spender] == 0);
        allowance[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev Increases the total supply by minting the specified number of tokens to the specified account.
     * @param value The number of tokens to add.
     * Returns a boolean that indicates if the operation was successful.
     */
    function mintTo(address to, uint256 value)
        external
        onlyOwner
        returns (bool)
    {
        _mint(to, value);

        return true;
    }

    /**
     * @dev Internal function that mints an amount of the token and assigns it to
     * an account. This encapsulates the modification of _balances such that the
     * proper events are emitted.
     * @param to The account that will receive the created tokens.
     * @param value The amount that will be created.
     */
    function _mint(address to, uint256 value) internal {
        require(to != address(0));
        //require(!_frozen[to], "address frozen");

        totalSupply = safeAdd(totalSupply, value);
        balanceOf[to] = safeAdd(balanceOf[to], value);
        Mint(to, value);
        Transfer(address(0), to, value);
    }

    /**
     * @dev Decreases the total supply by burning the specified number of tokens.
     * @param value The number of tokens to remove.
     * Returns a boolean that indicates if the operation was successful.
     */
    function burn(uint256 value) external returns (bool) {
        // require(!_frozen[msg.sender], "address frozen");
        _burn(msg.sender, value);

        return true;
    }

    /**
     * @dev Internal function that burns an amount of the token of a given
     * account.
     * @param addr The account whose tokens will be burnt.
     * @param value The amount that will be burnt.
     */
    function _burn(address addr, uint256 value) internal {
        totalSupply = safeSub(totalSupply, value);
        balanceOf[addr] = safeSub(balanceOf[addr], value);
        Burn(addr, value);
        Transfer(addr, address(0), value);
    }

    // disable pay QTUM to this contract
    function() public payable {
        revert();
    }
}
