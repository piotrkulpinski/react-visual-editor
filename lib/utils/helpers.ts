import { customAlphabet } from "nanoid"

export function generateId(length = 16) {
  const alphabet = "0123456789abcdefghijkmnopqrstuvwxyz"
  const nanoid = customAlphabet(alphabet, length)

  return nanoid()
}
