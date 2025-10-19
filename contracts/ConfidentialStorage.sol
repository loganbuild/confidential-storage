// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, eaddress, externalEaddress} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ConfidentialStorage
/// @notice Stores encrypted file metadata secured with FHEVM primitives.
contract ConfidentialStorage is SepoliaConfig {
    struct FileRecord {
        string filename;
        bytes encryptedHash;
        eaddress encryptedAccount;
        address owner;
        uint256 createdAt;
    }

    struct FileView {
        uint256 id;
        string filename;
        bytes encryptedHash;
        bytes32 encryptedAccount;
        address owner;
        uint256 createdAt;
    }

    error FileNotFound();
    error EmptyFilename();
    error EmptyHash();

    uint256 private _nextId = 1;
    mapping(uint256 => FileRecord) private _files;
    mapping(address => uint256[]) private _fileIdsByOwner;

    event FileStored(uint256 indexed id, address indexed owner, string filename);

    /// @notice Stores encrypted metadata for a file belonging to the caller.
    /// @param filename Plaintext filename presented to users.
    /// @param encryptedHash Symmetric ciphertext of the file's IPFS hash.
    /// @param encryptedAccountHandle Handle for the encrypted random address produced off-chain.
    /// @param encryptedAccountProof Zama proof binding the handle to the ciphertext.
    /// @return fileId Unique identifier for the stored record.
    function storeFile(
        string calldata filename,
        bytes calldata encryptedHash,
        externalEaddress encryptedAccountHandle,
        bytes calldata encryptedAccountProof
    ) external returns (uint256 fileId) {
        if (bytes(filename).length == 0) {
            revert EmptyFilename();
        }
        if (encryptedHash.length == 0) {
            revert EmptyHash();
        }

        eaddress encryptedAccount = FHE.fromExternal(encryptedAccountHandle, encryptedAccountProof);

        fileId = _nextId;
        _nextId = fileId + 1;

        FileRecord storage record = _files[fileId];
        record.filename = filename;
        record.encryptedHash = encryptedHash;
        record.encryptedAccount = encryptedAccount;
        record.owner = msg.sender;
        record.createdAt = block.timestamp;

        _fileIdsByOwner[msg.sender].push(fileId);

        FHE.allow(encryptedAccount, msg.sender);

        emit FileStored(fileId, msg.sender, filename);
    }

    /// @notice Returns metadata for a specific file identifier.
    /// @param fileId Identifier returned by {storeFile}.
    function getFile(uint256 fileId) external view returns (FileView memory) {
        FileRecord storage record = _files[fileId];
        if (record.owner == address(0)) {
            revert FileNotFound();
        }

        return FileView({
            id: fileId,
            filename: record.filename,
            encryptedHash: record.encryptedHash,
            encryptedAccount: FHE.toBytes32(record.encryptedAccount),
            owner: record.owner,
            createdAt: record.createdAt
        });
    }

    /// @notice Returns all file metadata for a given account.
    /// @param account Address whose records will be enumerated.
    function getFiles(address account) external view returns (FileView[] memory) {
        uint256[] storage fileIds = _fileIdsByOwner[account];
        uint256 length = fileIds.length;
        FileView[] memory views = new FileView[](length);

        for (uint256 i = 0; i < length; i++) {
            uint256 fileId = fileIds[i];
            FileRecord storage record = _files[fileId];
            views[i] = FileView({
                id: fileId,
                filename: record.filename,
                encryptedHash: record.encryptedHash,
                encryptedAccount: FHE.toBytes32(record.encryptedAccount),
                owner: record.owner,
                createdAt: record.createdAt
            });
        }

        return views;
    }
}
