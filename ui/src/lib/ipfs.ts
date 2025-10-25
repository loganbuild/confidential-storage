import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';

export async function computeFakeCid(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await sha256.digest(new Uint8Array(buffer));
  const cid = CID.createV1(0x55, digest);
  return cid.toString();
}
