import { customAlphabet } from "nanoid"

export function generateId(prefix?: string, length = 21) {
  const alphabet = "0123456789abcdefghijkmnopqrstuvwxyz"
  const nanoid = customAlphabet(alphabet, length)

  return `${prefix ? `${prefix}_` : ""}${nanoid()}`
}

/**
 * @description: Create an image element
 * @param {String} str Image URL or base64 image
 * @return {Promise} element Image element
 */
export const insertImgFile = (str: string) => {
  return new Promise(resolve => {
    const imgEl = document.createElement("img")
    imgEl.src = str
    // Insert into page
    document.body.appendChild(imgEl)
    imgEl.onload = () => {
      resolve(imgEl)
    }
  })
}

export const downFile = (fileStr: string, fileType: string) => {
  const anchorEl = document.createElement("a")
  anchorEl.href = fileStr
  anchorEl.download = `${generateId()}.${fileType}`
  document.body.appendChild(anchorEl) // required for firefox
  anchorEl.click()
  anchorEl.remove()
}

export default {
  downFile,
  insertImgFile,
}
