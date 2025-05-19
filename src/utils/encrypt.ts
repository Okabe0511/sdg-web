import CryptoJS from 'crypto-js';

/** MD5 加密
 * @param data 加密内容
 * @returns
 */
export const encryptBySHA1 = (data: any) => {
  const encrypted = CryptoJS.SHA1(data).toString(CryptoJS.enc.Hex);
  return encodeURIComponent(encrypted);
};

/** DES 加密
 * @param data    加密内容
 * @param secret  密钥
 * @returns
 */
export const encryptByDES = (data: any, secret: string) => {
  const encrypted = CryptoJS.DES.encrypt(JSON.stringify(data), secret).toString();
  return encodeURIComponent(encrypted);
};

/** AES 加密
 * @param data    加密内容
 * @param secret  密钥
 * @returns
 */
export const encryptByAES = (data: string, secretKey: string) => {
  // 使用AES加密data
  const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();
  // 对加密后的字符串进行URL编码
  const encodedEncrypted = encodeURIComponent(encrypted);
  return encodedEncrypted;
};
