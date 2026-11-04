import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// On ne stocke jamais un mot de passe en clair : on garde un « sel » aléatoire et
// l'empreinte calculée par scrypt (module crypto intégré à Node.js, rien à installer).
// Format stocké en base : "sel:empreinte", en hexadécimal.

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}
