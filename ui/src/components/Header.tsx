import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header__content">
        <div>
          <h1 className="app-title">Confidential Storage</h1>
          <p className="app-subtitle">Encrypt, register, and decrypt file access keys with FHE</p>
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}
