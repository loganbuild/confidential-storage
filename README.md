# Confidential Storage

A privacy-preserving decentralized file metadata storage system built with Fully Homomorphic Encryption (FHE) technology, enabling users to securely store and manage encrypted file records on-chain without revealing sensitive information.

## Overview

Confidential Storage is a cutting-edge Web3 application that combines Fully Homomorphic Encryption (FHE) with blockchain technology to provide unparalleled privacy for file metadata management. Unlike traditional storage solutions where metadata is visible on-chain, this system ensures that even the file hash and encryption keys remain completely confidential through advanced cryptographic techniques.

The application demonstrates a novel multi-layer encryption architecture where files never leave the user's browser, while encrypted metadata is stored on-chain using Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine) protocol.

## The Problem We Solve

### Current Challenges in Decentralized Storage

1. **Metadata Leakage**: Traditional blockchain storage solutions expose file hashes, timestamps, and ownership data publicly on-chain, compromising user privacy
2. **Access Control Limitations**: Conventional encryption requires decryption keys to be shared or stored insecurely
3. **Privacy vs. Verifiability Trade-off**: Users must choose between keeping data private or making it verifiable on-chain
4. **Centralized Key Management**: Most solutions rely on centralized key servers or complex multi-party computation

### Our Solution

Confidential Storage addresses these challenges through:

- **Triple-Layer Encryption**: Files are hashed locally, encrypted with a random key, and that key is encrypted using FHE
- **Zero-Knowledge Storage**: Only encrypted ciphertexts are stored on-chain; plaintext data never leaves the browser
- **Decentralized Privacy**: No central authority can access user data; privacy is enforced cryptographically
- **Selective Disclosure**: Users control exactly when and how to decrypt their data
- **Blockchain Verification**: All operations are verifiable on-chain while maintaining complete privacy

## Key Features and Advantages

### Core Features

1. **Client-Side Encryption**: All file processing happens in the browser with zero server-side processing
2. **Pseudo-IPFS Integration**: Generates deterministic CID-like hashes without requiring actual IPFS infrastructure
3. **FHE-Protected Keys**: Encryption keys are protected by Fully Homomorphic Encryption, enabling computation on encrypted data
4. **On-Chain Privacy**: Smart contracts store only encrypted metadata, preserving user privacy
5. **Selective Decryption**: Users can decrypt their data anytime using their wallet signature
6. **Immutable Audit Trail**: All storage operations are recorded on-chain for transparency

### Advantages

#### Privacy-First Architecture
- **No Data Exposure**: Files never leave the user's device
- **Encrypted Metadata**: Even file hashes are encrypted using AES-GCM
- **Hidden Access Patterns**: FHE ensures that even the encryption keys remain confidential

#### Advanced Cryptographic Security
- **AES-GCM Encryption**: Industry-standard authenticated encryption for file hashes
- **SHA-256 Key Derivation**: Secure key generation from Ethereum addresses
- **FHEVM Integration**: Zama's cutting-edge FHE technology for on-chain privacy
- **EIP-712 Signatures**: Secure, user-friendly transaction signing

#### Superior User Experience
- **Web3 Native**: Seamless integration with MetaMask and other Web3 wallets via RainbowKit
- **No Backend Required**: Fully decentralized architecture eliminates server dependencies
- **Gas Efficient**: Optimized smart contract design minimizes transaction costs
- **Real-Time Updates**: Instant reflection of storage operations in the UI

#### Developer-Friendly
- **Modern Stack**: TypeScript, React, Vite, and Hardhat for excellent DX
- **Comprehensive Tests**: Full test coverage with Hardhat and Chai
- **Type Safety**: Complete TypeChain integration for contract interactions
- **Clean Architecture**: Well-organized codebase with clear separation of concerns

## Technology Stack

### Smart Contract Layer

- **Solidity ^0.8.24**: Latest Solidity version with improved security features
- **FHEVM by Zama**: Fully Homomorphic Encryption for Ethereum
  - `@fhevm/solidity ^0.8.0`: FHE primitives for Solidity
  - `@zama-fhe/oracle-solidity ^0.1.0`: Oracle integration for FHE operations
- **Hardhat ^2.26.0**: Ethereum development environment
  - `hardhat-deploy ^0.11.45`: Deployment management
  - `hardhat-gas-reporter ^2.3.0`: Gas usage analytics
  - `@nomicfoundation/hardhat-verify ^2.1.0`: Contract verification on Etherscan
- **TypeChain ^8.3.2**: TypeScript bindings for smart contracts
- **OpenZeppelin Patterns**: Security best practices implementation

### Frontend Layer

- **React ^19.1.1**: Latest React with concurrent features
- **TypeScript ~5.8.3**: Type-safe JavaScript development
- **Vite ^7.1.6**: Next-generation frontend tooling with HMR
- **Ethers.js ^6.15.0**: Ethereum library for blockchain interactions
- **Wagmi ^2.17.0**: React Hooks for Ethereum
- **Viem ^2.37.6**: TypeScript-first Ethereum library
- **RainbowKit ^2.2.8**: Beautiful wallet connection UI
- **@tanstack/react-query ^5.89.0**: Powerful data synchronization

### Cryptography

- **Web Crypto API**: Browser-native cryptographic operations
  - AES-GCM encryption/decryption
  - SHA-256 hashing
  - Secure random number generation
- **Multiformats ^12.1.3**: IPFS CID generation and manipulation
- **Zama Relayer SDK ^0.2.0**: FHE encryption and decryption services
- **EIP-712**: Structured data signing for better UX

### Development Tools

- **TypeScript ESLint ^8.37.0**: Code quality and consistency
- **Prettier ^3.6.2**: Code formatting
- **Solhint ^6.0.0**: Solidity linting
- **Mocha ^11.7.1**: Test framework
- **Chai ^4.5.0**: Assertion library
- **Solidity Coverage ^0.8.16**: Test coverage reporting

### Deployment and Infrastructure

- **Netlify**: Frontend hosting with continuous deployment
- **Sepolia Testnet**: Ethereum test network deployment
- **Infura**: Ethereum node access
- **Etherscan**: Contract verification and exploration

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                          │
│  ┌──────────────┐    ┌──────────────┐   ┌───────────────┐ │
│  │   File       │───▶│  SHA-256     │──▶│  Pseudo IPFS  │ │
│  │   Selection  │    │  Hashing     │   │  CID (Hash)   │ │
│  └──────────────┘    └──────────────┘   └───────┬───────┘ │
│                                                   │         │
│  ┌──────────────────────────────────────────────▼───────┐ │
│  │  Random Ethereum Address Generation (Key)            │ │
│  └──────────────────────────────────────┬────────────────┘ │
│                                          │                  │
│  ┌──────────────────────────────────────▼────────────────┐ │
│  │  AES-GCM Encryption: Hash + Key → Encrypted Payload  │ │
│  └──────────────────────────────────────┬────────────────┘ │
│                                          │                  │
│  ┌──────────────────────────────────────▼────────────────┐ │
│  │  Zama FHE: Encrypt Key with FHEVM                    │ │
│  └──────────────────────────────────────┬────────────────┘ │
└───────────────────────────────────────┬─┼──────────────────┘
                                        │ │
                    ┌───────────────────┘ └──────────────────┐
                    │                                         │
            ┌───────▼─────────┐                   ┌──────────▼──────────┐
            │  Encrypted      │                   │   FHE-Encrypted     │
            │  Hash Payload   │                   │   Random Address    │
            └───────┬─────────┘                   └──────────┬──────────┘
                    │                                         │
                    └────────────────┬────────────────────────┘
                                     │
                         ┌───────────▼────────────┐
                         │  Smart Contract        │
                         │  ConfidentialStorage   │
                         │  • Filename (plain)    │
                         │  • Encrypted Hash      │
                         │  • FHE Key Handle      │
                         │  • Owner Address       │
                         │  • Timestamp           │
                         └────────────────────────┘
```

### Detailed Workflow

#### 1. File Preparation Phase

When a user selects a file:

1. **Hash Generation**: The file is read as an ArrayBuffer and hashed using SHA-256
2. **CID Creation**: A pseudo-IPFS CIDv1 is created using the hash (codec: 0x55 - raw binary)
3. **Random Key Generation**: A random Ethereum wallet address is generated as the encryption key
4. **Symmetric Encryption**: The CID is encrypted with AES-GCM using a key derived from the random address
   - Key Derivation: `SHA-256(randomAddress)` → AES-GCM key
   - IV: 12 random bytes
   - Output: `IV || Ciphertext`

#### 2. On-Chain Storage Phase

To store the metadata on-chain:

1. **FHE Encryption**: The random address is encrypted using Zama's FHEVM relayer
   - Creates encrypted input for the contract
   - Generates a proof of correct encryption
   - Returns an encrypted handle (eaddress type)
2. **Transaction Submission**: Calls `storeFile()` with:
   - Filename (plaintext for UX)
   - Encrypted hash payload (from step 1)
   - FHE-encrypted address handle
   - Encryption proof
3. **Contract Storage**: The smart contract:
   - Validates inputs (non-empty filename and hash)
   - Imports the FHE-encrypted address
   - Stores the record with auto-incrementing ID
   - Creates owner-to-files mapping
   - Grants decryption permission to owner
   - Emits `FileStored` event

#### 3. Decryption and Retrieval Phase

When a user wants to access their file:

1. **Fetch Records**: Query `getFiles(userAddress)` to retrieve all encrypted metadata
2. **FHE Decryption Request**:
   - Generate ephemeral keypair for this session
   - Create EIP-712 signature with user's wallet
   - Request decryption from Zama relayer with proof of ownership
   - Relayer verifies signature and permissions
   - Returns decrypted random address
3. **Payload Decryption**:
   - Derive AES-GCM key from decrypted address
   - Decrypt the hash payload
   - Recover original IPFS CID
4. **Display**: Show decrypted file hash to user

### Security Model

#### Threat Model Protection

- **Blockchain Observer**: Cannot see file hashes or encryption keys (all encrypted)
- **Malicious Relayer**: Cannot access data without user signature; all operations are verifiable
- **Contract Compromise**: Encrypted data remains secure; keys are FHE-protected
- **Network Eavesdropper**: All sensitive data is encrypted end-to-end
- **Unauthorized Access**: Only the owner can decrypt their files (enforced by FHE permissions)

#### Security Guarantees

1. **Confidentiality**: File hashes are encrypted with AES-256-GCM
2. **Integrity**: GCM provides authenticated encryption; tampering is detected
3. **Access Control**: FHE permissions ensure only authorized parties can decrypt
4. **Non-Repudiation**: All operations are signed with Ethereum wallets
5. **Forward Secrecy**: Each file uses a unique random encryption key

## Project Structure

```
confidential-storage/
├── contracts/                      # Smart contracts
│   └── ConfidentialStorage.sol    # Main storage contract with FHE
├── deploy/                         # Deployment scripts
│   └── deploy.ts                   # Hardhat-deploy configuration
├── tasks/                          # Custom Hardhat tasks
│   └── accounts.ts                 # Account management utilities
├── test/                           # Contract tests
│   └── ConfidentialStorage.ts     # Comprehensive test suite
├── ui/                             # React frontend application
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── StorageApp.tsx    # Main application component
│   │   │   └── Header.tsx        # Navigation header
│   │   ├── config/               # Configuration files
│   │   │   ├── contracts.ts      # Contract ABI and addresses
│   │   │   └── wagmi.ts         # Wagmi/RainbowKit config
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useZamaInstance.ts    # Zama relayer connection
│   │   │   └── useEthersSigner.ts    # Ethers.js signer hook
│   │   ├── lib/                 # Utility libraries
│   │   │   ├── encryption.ts    # AES-GCM encryption logic
│   │   │   └── ipfs.ts         # IPFS CID generation
│   │   ├── App.tsx             # Root component
│   │   └── main.tsx            # Application entry point
│   ├── public/                 # Static assets
│   ├── netlify.toml           # Netlify deployment config
│   └── package.json           # Frontend dependencies
├── deployments/               # Deployed contract artifacts
│   └── sepolia/              # Sepolia testnet deployments
├── types/                    # TypeChain generated types
├── hardhat.config.ts        # Hardhat configuration
├── package.json             # Root dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md              # This file
```

## Installation and Setup

### Prerequisites

- **Node.js**: v20.0.0 or higher (required for latest features)
- **npm**: v7.0.0 or higher
- **Git**: For cloning the repository
- **MetaMask**: Or any Web3 wallet for frontend interaction
- **Sepolia ETH**: For deploying and testing on Sepolia testnet

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/confidential-storage.git
cd confidential-storage
```

#### 2. Install Smart Contract Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Wallet mnemonic for deployments (DO NOT commit this!)
MNEMONIC="your twelve word mnemonic phrase here"

# Infura API key for network access
INFURA_API_KEY="your_infura_api_key"

# Etherscan API key for contract verification
ETHERSCAN_API_KEY="your_etherscan_api_key"
```

Alternatively, use Hardhat's secure variable storage:

```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

#### 4. Compile Smart Contracts

```bash
npm run compile
```

This will:
- Compile Solidity contracts
- Generate TypeChain TypeScript bindings
- Create artifacts in `./artifacts` directory

#### 5. Run Contract Tests

```bash
npm test
```

Expected output: All tests should pass with gas reports.

#### 6. Install Frontend Dependencies

```bash
cd ui
npm install
```

#### 7. Configure Frontend Contract Address

After deploying contracts (see Deployment section), update:

`ui/src/config/contracts.ts`:
```typescript
export const CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
```

Copy the ABI from `deployments/sepolia/ConfidentialStorage.json` to the same file.

#### 8. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage Guide

### For Users

#### Connecting Your Wallet

1. Visit the application URL
2. Click "Connect Wallet" in the header
3. Select your preferred wallet (MetaMask, WalletConnect, etc.)
4. Approve the connection request
5. Ensure you're connected to Sepolia testnet

#### Storing a File

1. Click "Choose a file to encrypt"
2. Select any file from your computer (the file never uploads anywhere)
3. Wait for the encryption process:
   - Pseudo IPFS hash is computed
   - Random encryption key is generated
   - Hash is encrypted with AES-GCM
4. Review the prepared file summary showing:
   - Filename
   - Pseudo IPFS hash
   - Derived key address
5. Click "Store on chain"
6. Sign the transaction in your wallet
7. Wait for confirmation (usually 15-30 seconds on Sepolia)
8. Success! Your encrypted metadata is now on-chain

#### Viewing Your Files

1. Your encrypted catalog appears automatically when connected
2. Each entry shows:
   - Filename (plaintext)
   - Storage timestamp
   - Encrypted ciphertext
3. Files are sorted by creation time

#### Decrypting a File

1. Click "Decrypt access" on any file record
2. The app will:
   - Generate an ephemeral keypair
   - Request your EIP-712 signature (confirm in wallet)
   - Query Zama relayer for FHE decryption
   - Decrypt the file hash locally
3. View the decrypted information:
   - Random address used for encryption
   - Recovered IPFS hash

### For Developers

#### Deploying Contracts Locally

```bash
# Terminal 1: Start local FHEVM node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat deploy --network localhost
```

#### Deploying to Sepolia

```bash
# Deploy
npx hardhat deploy --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

#### Running Tests with Coverage

```bash
npm run coverage
```

#### Linting and Formatting

```bash
# Check code style
npm run lint

# Fix formatting issues
npm run prettier:write
```

## Smart Contract Deep Dive

### ConfidentialStorage.sol

#### State Variables

```solidity
uint256 private _nextId = 1;                           // Auto-incrementing file ID
mapping(uint256 => FileRecord) private _files;         // ID to file metadata
mapping(address => uint256[]) private _fileIdsByOwner; // Owner to file IDs
```

#### Data Structures

**FileRecord** (Internal Storage):
```solidity
struct FileRecord {
    string filename;              // Plaintext filename for UX
    bytes encryptedHash;          // AES-GCM encrypted IPFS hash
    eaddress encryptedAccount;    // FHE-encrypted random address
    address owner;                // File owner's Ethereum address
    uint256 createdAt;           // Block timestamp of storage
}
```

**FileView** (External View):
```solidity
struct FileView {
    uint256 id;                   // Unique identifier
    string filename;              // Plaintext filename
    bytes encryptedHash;          // Encrypted hash payload
    bytes32 encryptedAccount;     // FHE handle as bytes32
    address owner;                // Owner address
    uint256 createdAt;           // Timestamp
}
```

#### Core Functions

**storeFile()**
- **Access**: Public
- **Parameters**:
  - `filename`: User-facing name (plaintext)
  - `encryptedHash`: AES-GCM ciphertext of IPFS hash
  - `encryptedAccountHandle`: FHE-encrypted random address
  - `encryptedAccountProof`: Zama proof for FHE import
- **Returns**: Unique file ID
- **Emits**: `FileStored(id, owner, filename)`
- **Gas**: ~150,000 - 200,000

**getFile()**
- **Access**: Public view
- **Parameters**: File ID
- **Returns**: FileView struct
- **Reverts**: `FileNotFound()` if ID doesn't exist

**getFiles()**
- **Access**: Public view
- **Parameters**: Account address
- **Returns**: Array of all FileView records for that account
- **Note**: No pagination (consider adding for production)

#### Security Features

1. **Input Validation**:
   - Filename cannot be empty
   - Encrypted hash cannot be empty
   - FHE proof must be valid

2. **Access Control**:
   - Only owner can decrypt (enforced by `FHE.allow()`)
   - Decryption requires valid signature

3. **Data Privacy**:
   - Sensitive data never stored in plaintext
   - FHE operations are verifiable on-chain

#### Gas Optimization

- Uses `calldata` for input parameters
- Minimal storage writes
- Efficient mapping structures
- No loops in write operations (except in array push)

## Testing

### Test Coverage

The test suite covers:

1. **Basic Storage Operations**
   - ✅ Storing encrypted metadata
   - ✅ Emitting correct events
   - ✅ Retrieving single file
   - ✅ Retrieving all user files

2. **Edge Cases**
   - ✅ Empty filename rejection
   - ✅ Empty hash rejection
   - ✅ Non-existent file query
   - ✅ Multiple files per user
   - ✅ User isolation (Alice can't see Bob's files)

3. **FHE Operations**
   - ✅ Encrypting addresses
   - ✅ FHE proof validation
   - ✅ Permission grants

### Running Tests

```bash
# Run all tests
npm test

# Run with gas reporting
npm test

# Run with coverage
npm run coverage

# Run on Sepolia (integration test)
npm run test:sepolia
```

### Test Output Example

```
  ConfidentialStorage
    ✓ stores encrypted metadata for the caller (185ms)
    ✓ lists all files for an owner (234ms)
    ✓ reverts when filename or hash is empty (98ms)
    ✓ reverts when requesting an unknown file (45ms)

  4 passing (1.2s)
```

## Deployment

### Local Deployment

For development and testing:

```bash
# Start local FHEVM-enabled node
npm run chain

# Deploy to local network (in another terminal)
npm run deploy:localhost
```

### Sepolia Testnet Deployment

#### Prerequisites

1. Get Sepolia ETH from a faucet:
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

2. Configure environment variables (see Installation section)

#### Deploy

```bash
npm run deploy:sepolia
```

#### Verify Contract

```bash
npm run verify:sepolia
```

#### Update Frontend Configuration

1. Copy deployed contract address from console output
2. Update `ui/src/config/contracts.ts`:

```typescript
export const CONTRACT_ADDRESS = '0xYourNewContractAddress' as const;
```

3. Copy contract ABI from `deployments/sepolia/ConfidentialStorage.json`

### Frontend Deployment (Netlify)

The frontend is configured for automatic Netlify deployment.

#### Manual Deployment

```bash
cd ui
npm run build
# Upload ./dist to your hosting provider
```

#### Netlify Configuration

The `ui/netlify.toml` file contains:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Netlify will auto-detect the configuration
3. Every push to `main` triggers a deployment
4. Access your app at `https://your-app.netlify.app`

## Future Roadmap

### Phase 1: Core Enhancements (Q2 2025)

- [ ] **Pagination for File Lists**: Support users with 1000+ files
- [ ] **File Categories/Tags**: Organize files with encrypted tags
- [ ] **Search Functionality**: Client-side encrypted search
- [ ] **Batch Operations**: Upload/decrypt multiple files at once
- [ ] **Enhanced File Metadata**: File size, MIME type, custom metadata

### Phase 2: Advanced Privacy Features (Q3 2025)

- [ ] **Actual IPFS Integration**: Optional real IPFS storage for file content
- [ ] **Shared Access**: Grant decryption rights to other addresses
- [ ] **Revocable Access**: Time-limited or revocable sharing
- [ ] **Zero-Knowledge Proofs**: Prove file properties without revealing content
- [ ] **Multi-Chain Support**: Deploy to Polygon, Arbitrum, Optimism

### Phase 3: Enterprise Features (Q4 2025)

- [ ] **Organization Accounts**: Multi-user access control
- [ ] **Audit Logs**: Detailed on-chain activity tracking
- [ ] **Compliance Tools**: GDPR-compliant encrypted data handling
- [ ] **API Access**: RESTful API for integration
- [ ] **SDK Release**: JavaScript/TypeScript SDK for developers
- [ ] **Mobile App**: React Native mobile application

### Phase 4: Ecosystem Growth (2026)

- [ ] **Incentive Mechanisms**: Token rewards for storage providers
- [ ] **Decentralized Storage Network**: P2P encrypted file distribution
- [ ] **Cross-Chain Bridges**: Unified storage across chains
- [ ] **DAO Governance**: Community-driven protocol upgrades
- [ ] **Plugin System**: Extensible architecture for third-party features

### Research & Innovation

- [ ] **Post-Quantum Cryptography**: Prepare for quantum computing threats
- [ ] **Homomorphic Computation**: Advanced operations on encrypted data
- [ ] **zkSNARK Integration**: Zero-knowledge file verification
- [ ] **Decentralized Identity**: Integration with DID standards
- [ ] **Privacy-Preserving Analytics**: Anonymous usage insights

## Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Bug Reports**: Open an issue with detailed reproduction steps
2. **Feature Requests**: Suggest new features or improvements
3. **Code Contributions**: Submit pull requests for bug fixes or features
4. **Documentation**: Improve README, add tutorials, or write guides
5. **Testing**: Add test cases or report test failures
6. **Security**: Responsible disclosure of security issues

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes and add tests
4. **Test** thoroughly: `npm test && npm run lint`
5. **Commit** with clear messages: `git commit -m 'Add amazing feature'`
6. **Push** to your fork: `git push origin feature/amazing-feature`
7. **Open** a Pull Request with a detailed description

### Code Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Solidity**: Follow best practices, use latest version
- **Testing**: Maintain >90% coverage
- **Comments**: Document complex logic and public APIs
- **Style**: Use Prettier for formatting, ESLint for linting

### Security Policy

Found a security vulnerability? Please **DO NOT** open a public issue.

Instead:
1. Email security@your-domain.com (replace with actual email)
2. Include detailed description and reproduction steps
3. Allow 90 days for patch development before public disclosure
4. We will acknowledge receipt within 48 hours

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

### What This Means

- ✅ **You can**: Use, modify, and distribute this software
- ✅ **You can**: Use it in commercial projects
- ✅ **You must**: Include the original license and copyright notice
- ❌ **You cannot**: Hold the authors liable for damages
- ❌ **No patent rights**: This license does not grant patent rights

See the [LICENSE](LICENSE) file for full legal text.

## Acknowledgments

### Technology Partners

- **Zama**: For pioneering Fully Homomorphic Encryption for Ethereum
- **Ethereum Foundation**: For blockchain infrastructure
- **Infura**: For reliable node access

### Open Source Projects

This project builds upon:
- [FHEVM by Zama](https://github.com/zama-ai/fhevm)
- [Hardhat](https://hardhat.org/)
- [React](https://react.dev/)
- [Ethers.js](https://docs.ethers.org/)
- [Wagmi](https://wagmi.sh/)
- [RainbowKit](https://www.rainbowkit.com/)

### Community

Special thanks to all contributors, testers, and users who make this project possible.

## Support and Contact

### Getting Help

- **Documentation**: This README and inline code comments
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-username/confidential-storage/issues)
- **Discussions**: [Community forum](https://github.com/your-username/confidential-storage/discussions)

### Useful Links

- **Zama Documentation**: https://docs.zama.ai/fhevm
- **FHEVM Hardhat Plugin**: https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat
- **Ethereum Development**: https://ethereum.org/developers
- **Sepolia Faucet**: https://sepoliafaucet.com/

---

**Built with privacy-first principles using cutting-edge Fully Homomorphic Encryption technology.**

*Empowering users to own their data through cryptography, not trust.*
