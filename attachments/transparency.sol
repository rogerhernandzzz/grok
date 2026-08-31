// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TransparencyAudit
 * @dev Contrato de transparencia para la resistencia de Venezuela
 * Registra todas las transacciones y decisiones públicamente
 */

contract TransparencyAudit {

    // Eventos
    event DonationReceived(
        address indexed donor,
        uint256 amount,
        string currency,
        uint256 timestamp
    );

    event FundsTransferred(
        address indexed from,
        address indexed to,
        uint256 amount,
        string purpose,
        uint256 timestamp
    );

    event DecisionMade(
        uint256 indexed decisionId,
        string description,
        address proposedBy,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 timestamp
    );

    event AuditLog(
        uint256 indexed logId,
        string action,
        address actor,
        uint256 timestamp
    );

    // Estructura de Donación
    struct Donation {
        address donor;
        uint256 amount;
        string currency;
        string method;
        uint256 timestamp;
        string status; // pending, confirmed, used
    }

    // Estructura de Transacción
    struct Transaction {
        address from;
        address to;
        uint256 amount;
        string purpose;
        uint256 timestamp;
        string status; // pending, approved, completed
    }

    // Estructura de Decisión
    struct Decision {
        string description;
        address proposedBy;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 timestamp;
        string status; // voting, approved, rejected, implemented
    }

    // Estructura de Registro de Auditoría
    struct AuditEntry {
        string action;
        address actor;
        uint256 timestamp;
        string details;
    }

    // Variables de estado
    address public owner;
    bool public paused = false;

    // Contadores
    uint256 public donationCount = 0;
    uint256 public transactionCount = 0;
    uint256 public decisionCount = 0;
    uint256 public auditLogCount = 0;

    // Mappings
    mapping(uint256 => Donation) public donations;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => Decision) public decisions;
    mapping(uint256 => AuditEntry) public auditLogs;

    mapping(address => bool) public isAdmin;
    mapping(address => uint256) public totalDonatedByAddress;

    // Variables públicas de estadísticas
    uint256 public totalDonationsUSD = 0;
    uint256 public totalDonationsBTC = 0;
    uint256 public totalDonationsETH = 0;

    // Modificadores
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede ejecutar esto");
        _;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender] || msg.sender == owner, "Solo administradores");
        _;
    }

    modifier notPaused() {
        require(!paused, "Contrato pausado");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
        isAdmin[msg.sender] = true;
        _logAudit("Contrato creado", "Contrato de transparencia inicializado");
    }

    // ===== DONACIONES =====

    function recordDonation(
        address _donor,
        uint256 _amount,
        string memory _currency,
        string memory _method
    ) public onlyAdmin notPaused {
        require(_amount > 0, "La cantidad debe ser mayor a 0");
        require(_donor != address(0), "Dirección de donante inválida");

        Donation memory newDonation = Donation({
            donor: _donor,
            amount: _amount,
            currency: _currency,
            method: _method,
            timestamp: block.timestamp,
            status: "confirmed"
        });

        donations[donationCount] = newDonation;
        totalDonatedByAddress[_donor] += _amount;

        // Actualizar totales por moneda
        if (keccak256(bytes(_currency)) == keccak256(bytes("USD"))) {
            totalDonationsUSD += _amount;
        } else if (keccak256(bytes(_currency)) == keccak256(bytes("BTC"))) {
            totalDonationsBTC += _amount;
        } else if (keccak256(bytes(_currency)) == keccak256(bytes("ETH"))) {
            totalDonationsETH += _amount;
        }

        emit DonationReceived(_donor, _amount, _currency, block.timestamp);
        _logAudit("Donación registrada", string(abi.encodePacked(
            "Cantidad: ", _toString(_amount), " ", _currency
        )));

        donationCount++;
    }

    // ===== TRANSACCIONES =====

    function recordTransaction(
        address _from,
        address _to,
        uint256 _amount,
        string memory _purpose
    ) public onlyAdmin notPaused {
        require(_amount > 0, "La cantidad debe ser mayor a 0");
        require(_from != address(0) && _to != address(0), "Direcciones inválidas");

        Transaction memory newTransaction = Transaction({
            from: _from,
            to: _to,
            amount: _amount,
            purpose: _purpose,
            timestamp: block.timestamp,
            status: "completed"
        });

        transactions[transactionCount] = newTransaction;
        emit FundsTransferred(_from, _to, _amount, _purpose, block.timestamp);
        _logAudit("Transferencia registrada", _purpose);

        transactionCount++;
    }

    // ===== DECISIONES =====

    function proposeDecision(
        string memory _description
    ) public onlyAdmin notPaused {
        Decision memory newDecision = Decision({
            description: _description,
            proposedBy: msg.sender,
            votesFor: 0,
            votesAgainst: 0,
            timestamp: block.timestamp,
            status: "voting"
        });

        decisions[decisionCount] = newDecision;
        emit DecisionMade(decisionCount, _description, msg.sender, 0, 0, block.timestamp);
        _logAudit("Decisión propuesta", _description);

        decisionCount++;
    }

    function voteOnDecision(
        uint256 _decisionId,
        bool _voteFor
    ) public notPaused {
        require(_decisionId < decisionCount, "Decisión no existe");

        if (_voteFor) {
            decisions[_decisionId].votesFor++;
        } else {
            decisions[_decisionId].votesAgainst++;
        }

        _logAudit("Voto registrado", string(abi.encodePacked(
            "Decisión ", _toString(_decisionId)
        )));
    }

    // ===== AUDITORÍA =====

    function getDonationHistory(
        uint256 _start,
        uint256 _count
    ) public view returns (Donation[] memory) {
        require(_start + _count <= donationCount, "Rango inválido");

        Donation[] memory history = new Donation[](_count);
        for (uint256 i = 0; i < _count; i++) {
            history[i] = donations[_start + i];
        }
        return history;
    }

    function getTransactionHistory(
        uint256 _start,
        uint256 _count
    ) public view returns (Transaction[] memory) {
        require(_start + _count <= transactionCount, "Rango inválido");

        Transaction[] memory history = new Transaction[](_count);
        for (uint256 i = 0; i < _count; i++) {
            history[i] = transactions[_start + i];
        }
        return history;
    }

    function getAuditLog(
        uint256 _start,
        uint256 _count
    ) public view returns (AuditEntry[] memory) {
        require(_start + _count <= auditLogCount, "Rango inválido");

        AuditEntry[] memory logs = new AuditEntry[](_count);
        for (uint256 i = 0; i < _count; i++) {
            logs[i] = auditLogs[_start + i];
        }
        return logs;
    }

    function getStatistics() public view returns (
        uint256 totalDonors,
        uint256 totalAmount,
        uint256 totalTransactions,
        uint256 totalDecisions
    ) {
        return (
            donationCount,
            totalDonationsUSD + totalDonationsBTC + totalDonationsETH,
            transactionCount,
            decisionCount
        );
    }

    // ===== ADMIN FUNCTIONS =====

    function setAdmin(address _address, bool _isAdmin) public onlyOwner {
        isAdmin[_address] = _isAdmin;
        _logAudit("Admin actualizado", _isAdmin ? "Agregado" : "Removido");
    }

    function pauseContract() public onlyOwner {
        paused = true;
        _logAudit("Contrato pausado", "Por seguridad");
    }

    function unpauseContract() public onlyOwner {
        paused = false;
        _logAudit("Contrato reanudado", "Operacional");
    }

    // ===== FUNCIONES INTERNAS =====

    function _logAudit(
        string memory _action,
        string memory _details
    ) internal {
        AuditEntry memory entry = AuditEntry({
            action: _action,
            actor: msg.sender,
            timestamp: block.timestamp,
            details: _details
        });

        auditLogs[auditLogCount] = entry;
        emit AuditLog(auditLogCount, _action, msg.sender, block.timestamp);
        auditLogCount++;
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // ===== FALLBACK =====

    receive() external payable {
        // Acepta ETH directo
        _logAudit("ETH recibido", "Donación directa");
    }

    fallback() external payable {
        // Fallback para ETH directo
        _logAudit("ETH fallback recibido", "Donación indirecta");
    }
}
