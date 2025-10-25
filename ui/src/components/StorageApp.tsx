import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Contract, Wallet, getBytes, hexlify } from 'ethers';
import type { JsonRpcSigner } from 'ethers';
import type { Address } from 'viem';

import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { computeFakeCid } from '../lib/ipfs';
import { decryptHashWithAddress, encryptHashWithAddress } from '../lib/encryption';
import { Header } from './Header';

type PreparedFile = {
  file: File;
  cid: string;
  encryptedPayload: string;
  encryptionAddress: string;
};

type StoredFile = {
  id: bigint;
  filename: string;
  encryptedHash: string;
  encryptedAccount: string;
  owner: Address;
  createdAt: bigint;
};

type DecryptedRecord = {
  address: string;
  hash: string;
};

export function StorageApp() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { address } = useAccount();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();

  const [prepared, setPrepared] = useState<PreparedFile | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [decryptingId, setDecryptingId] = useState<bigint | null>(null);
  const [decrypted, setDecrypted] = useState<Record<string, DecryptedRecord>>({});

  const {
    data: filesData,
    refetch: refetchFiles,
    isFetching: isFetchingFiles,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getFiles',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const files = useMemo<StoredFile[]>(() => {
    if (!filesData) {
      return [];
    }

    const raw = filesData as readonly any[];
    return raw.map((item) => ({
      id: item.id as bigint,
      filename: item.filename as string,
      encryptedHash: item.encryptedHash as string,
      encryptedAccount: item.encryptedAccount as string,
      owner: item.owner as Address,
      createdAt: item.createdAt as bigint,
    }));
  }, [filesData]);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const prepareFile = useCallback(async (file: File) => {
    setIsPreparing(true);
    setError(null);
    setStatus('Preparing file and generating fake IPFS hash...');

    try {
      const cid = await computeFakeCid(file);
      const wallet = Wallet.createRandom();
      const encryptedPayload = await encryptHashWithAddress(wallet.address, cid);

      setPrepared({
        file,
        cid,
        encryptedPayload,
        encryptionAddress: wallet.address,
      });
      setStatus('File encrypted locally. Ready to store on-chain.');
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to prepare file';
      setError(message);
      setPrepared(null);
      setStatus(null);
    } finally {
      setIsPreparing(false);
    }
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      if (!file) {
        setPrepared(null);
        setStatus(null);
        return;
      }
      await prepareFile(file);
    },
    [prepareFile],
  );

  const storePreparedFile = useCallback(async () => {
    if (!prepared) {
      setError('Select a file first.');
      return;
    }
    if (!address) {
      setError('Connect your wallet to store files.');
      return;
    }
    if (!instance) {
      setError('Encryption service is not ready yet.');
      return;
    }
    const signer = (await signerPromise) as JsonRpcSigner | undefined;
    if (!signer) {
      setError('Wallet signer not available.');
      return;
    }

    setIsStoring(true);
    setStatus('Encrypting access key with Zama relayer...');
    setError(null);

    try {
      const buffer = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      buffer.addAddress(prepared.encryptionAddress);
      const encryptedInput = await buffer.encrypt();

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.storeFile(
        prepared.file.name,
        getBytes(prepared.encryptedPayload),
        hexlify(encryptedInput.handles[0]),
        encryptedInput.inputProof,
      );

      setStatus('Waiting for transaction confirmation...');
      await tx.wait();
      setStatus('Stored file metadata on-chain.');
      setPrepared(null);
      resetFileInput();
      setTimeout(() => setStatus(null), 4000);
      await refetchFiles();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to store file';
      setError(message);
    } finally {
      setIsStoring(false);
    }
  }, [prepared, address, instance, signerPromise, refetchFiles]);

  const decryptRecord = useCallback(
    async (record: StoredFile) => {
      if (!instance || !address) {
        setError('Connect wallet and wait for encryption service.');
        return;
      }
      const signer = (await signerPromise) as JsonRpcSigner | undefined;
      if (!signer) {
        setError('Wallet signer not available.');
        return;
      }

      setDecryptingId(record.id);
      setError(null);

      try {
        const keypair = instance.generateKeypair();
        const startTimestamp = Math.floor(Date.now() / 1000).toString();
        const durationDays = '7';
        const contractAddresses = [CONTRACT_ADDRESS];
        const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimestamp, durationDays);

        const signature = await signer.signTypedData(
          eip712.domain,
          { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
          eip712.message,
        );

        const result = await instance.userDecrypt(
          [{ handle: record.encryptedAccount, contractAddress: CONTRACT_ADDRESS }],
          keypair.privateKey,
          keypair.publicKey,
          signature.replace(/^0x/, ''),
          contractAddresses,
          address,
          startTimestamp,
          durationDays,
        );

        const decryptedAddress = result[record.encryptedAccount];
        if (!decryptedAddress) {
          throw new Error('Decryption result is empty.');
        }

        const hash = await decryptHashWithAddress(decryptedAddress, record.encryptedHash);
        setDecrypted((prev) => ({
          ...prev,
          [record.id.toString()]: { address: decryptedAddress, hash },
        }));
      } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'Failed to decrypt file';
        setError(message);
      } finally {
        setDecryptingId(null);
      }
    },
    [instance, address, signerPromise],
  );

  const renderPreparedSummary = () => {
    if (!prepared) {
      return null;
    }

    return (
      <div className="card">
        <h3>Prepared File</h3>
        <dl className="details-grid">
          <div>
            <dt>Filename</dt>
            <dd>{prepared.file.name}</dd>
          </div>
          <div>
            <dt>Pseudo IPFS Hash</dt>
            <dd className="mono">{prepared.cid}</dd>
          </div>
          <div>
            <dt>Derived Key Address</dt>
            <dd className="mono">{prepared.encryptionAddress}</dd>
          </div>
        </dl>
      </div>
    );
  };

  return (
    <div className="app-wrapper">
      <Header />

      <main className="app-main">
        <section className="card upload-card">
          <h2>Register a confidential document</h2>
          <p className="section-description">
            Files never leave your browser. We compute a deterministic pseudo IPFS hash, encrypt it with a random
            address, and store only the ciphertext on-chain.
          </p>

          <label className="file-picker">
            <span>Choose a file to encrypt</span>
            <input ref={fileInputRef} type="file" onChange={handleFileChange} disabled={isPreparing || isStoring} />
          </label>

          {status && <p className="status-message">{status}</p>}
          {error && <p className="error-message">{error}</p>}
          {zamaError && <p className="error-message">{zamaError}</p>}

          <div className="actions-row">
            <button
              type="button"
              className="primary-button"
              onClick={storePreparedFile}
              disabled={!prepared || zamaLoading || isPreparing || isStoring}
            >
              {zamaLoading ? 'Connecting to relayer...' : isStoring ? 'Submitting transaction...' : 'Store on chain'}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setPrepared(null);
                setStatus(null);
                resetFileInput();
              }}
              disabled={isPreparing || isStoring}
            >
              Clear selection
            </button>
          </div>

          {renderPreparedSummary()}
        </section>

        <section className="card">
          <div className="section-heading">
            <h2>Your encrypted catalog</h2>
            {address ? null : <p className="section-description">Connect your wallet to view stored files.</p>}
          </div>

          {address && (
            <div className="files-list">
              {isFetchingFiles ? (
                <p className="status-message">Loading encrypted records...</p>
              ) : files.length === 0 ? (
                <p className="status-message">No files stored yet.</p>
              ) : (
                files.map((file) => {
                  const decryptedRecord = decrypted[file.id.toString()];
                  return (
                    <article key={file.id.toString()} className="file-row">
                      <div className="file-row__meta">
                        <h3>{file.filename}</h3>
                        <p className="file-row__date">
                          Stored {new Date(Number(file.createdAt) * 1000).toLocaleString()}
                        </p>
                        <p className="file-row__cipher mono">Ciphertext: {file.encryptedHash}</p>
                      </div>
                      <div className="file-row__actions">
                        {decryptedRecord ? (
                          <div className="decrypted-panel">
                            <p className="mono">Decrypted address: {decryptedRecord.address}</p>
                            <p className="mono">Recovered IPFS hash: {decryptedRecord.hash}</p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() => decryptRecord(file)}
                            disabled={decryptingId === file.id || zamaLoading}
                          >
                            {decryptingId === file.id ? 'Decrypting...' : 'Decrypt access' }
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
