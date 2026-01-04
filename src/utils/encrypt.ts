import CryptoJS from 'crypto-js'

// 后端提供的密钥 (32字节 -> AES-256)
const KEY_STR = '0123456789abcdef0123456789abcdef'

export function encryptPassword(word: string): string {
  // 1. 处理密钥
  const key = CryptoJS.enc.Utf8.parse(KEY_STR)

  // 2. 生成随机 IV (16字节)
  // 后端解密时会截取前16字节作为 IV，所以前端必须每次随机生成
  const iv = CryptoJS.lib.WordArray.random(16)

  // 3. AES-CBC 加密
  const encrypted = CryptoJS.AES.encrypt(word, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })

  // 4. 拼接 IV + 密文
  // 后端逻辑是：return base64(iv + ciphertext)
  // 这里的 encrypted.ciphertext 只是加密后的部分，不含 IV，所以我们要手动拼
  const combined = iv.clone().concat(encrypted.ciphertext)

  // 5. 转为 Base64 返回
  return CryptoJS.enc.Base64.stringify(combined)
}