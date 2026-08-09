/**
 * BigInt serialization helper.
 *
 * Prisma mengembalikan BigInt untuk kolom id yang pakai BIGSERIAL (Laravel default).
 * JSON.stringify() tidak bisa serialize BigInt secara native.
 *
 * serializeBigInt() mengkonversi BigInt -> Number secara rekursif.
 * Aman untuk id < Number.MAX_SAFE_INTEGER (9 kuadriliun baris — lebih dari cukup).
 */

// Tipe helper untuk BigInt serialization recursive
type Serialized<T> = T extends bigint
  ? number
  : T extends Array<infer U>
  ? Array<Serialized<U>>
  : T extends object
  ? { [K in keyof T]: Serialized<T[K]> }
  : T;

export function serializeBigInt<T>(obj: T): Serialized<T> {
  if (obj === null || obj === undefined) return obj as Serialized<T>;
  if (typeof obj === "bigint") return Number(obj) as Serialized<T>;
  if (Array.isArray(obj)) return obj.map(serializeBigInt) as Serialized<T>;
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeBigInt(value);
    }
    return result as Serialized<T>;
  }
  return obj as Serialized<T>;
}
