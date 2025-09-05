// videoData.js

// Encrypted video link (replace with your actual encrypted link)
const encryptedVideoLink = "U2FsdGVkX1+5VJX1JkU8K1eN7V8p7U3Vb2K7xQZkR1A=";

// Secret key for decryption (keep this secure)
const secretKey = "yourSecretKey";

// Function to decrypt the encrypted link
function decrypt(encryptedText, key) {
    return CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8);
}
