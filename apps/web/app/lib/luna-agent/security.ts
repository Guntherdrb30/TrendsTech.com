import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const secret = process.env.LUNA_AGENT_ENCRYPTION_KEY ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing LUNA_AGENT_ENCRYPTION_KEY or NEXTAUTH_SECRET.");
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const key = getEncryptionKey();
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decryptSecret(payload: string) {
  const [ivHex, tagHex, encryptedHex] = payload.split(":");
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error("Invalid encrypted payload.");
  }

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}

export function createRemoteToken() {
  return randomBytes(24).toString("base64url");
}

export function hashRemoteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createRunnerToken() {
  return createRemoteToken();
}

export function hashRunnerToken(token: string) {
  return hashRemoteToken(token);
}
