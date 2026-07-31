import { hash, verify, type Options } from '@node-rs/argon2';

const ARGON2_OPTIONS: Options = {
  algorithm: 2,
  memoryCost: 65_536,
  timeCost: 3,
  parallelism: 4,
  outputLen: 32
};

export function hashPassword(password: string) {
  return hash(password, ARGON2_OPTIONS);
}

export function verifyPassword({ password, hash: passwordHash }: { password: string; hash: string }) {
  return verify(passwordHash, password, ARGON2_OPTIONS);
}
