import { customAlphabet } from "nanoid"

export const generateId = (length = 16) => {
  const alphabet = "0123456789abcdefghijkmnopqrstuvwxyz"
  const nanoid = customAlphabet(alphabet, length)

  return nanoid()
}

/**
 * Get the key names of the object
 */
export const getObjectKeys = <T extends object>(obj: T): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[]
}

/**
 * Get the values of the object
 */
export const getObjectValues = <T extends object>(obj: T): T[keyof T][] => {
  return Object.values(obj)
}

/**
 * Get the entries of the object
 */
export const getObjectEntries = <T extends object>(obj: T): [keyof T, T[keyof T]][] => {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}
