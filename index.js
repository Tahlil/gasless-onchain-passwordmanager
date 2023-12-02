let generator = require("generate-password");
const aes256 = require("aes256");
const fs = require("fs");
const falcon = require("falcon-crypto");

const bcrypt = require("bcrypt");

const keyFilePath = "key.txt";
const textToEncrypt = "Hello, this is a secret message!";

async function falconEncryption(msg) {
  const keyPair /*: {privateKey: Uint8Array; publicKey: Uint8Array} */ =
    await falcon.keyPair();
  const message /*: Uint8Array */ = new Uint8Array([
    104, 101, 108, 108, 111, 0,
  ]); // "hello"
  const signed = await falcon.sign(message, keyPair.privateKey);
  const verified = await falcon.open(signed, keyPair.publicKey); 
  
  console.log({message, signed, verified});
}

async function encryptWithAES256(textToEncrypt) {
  // Check if the key file exists
  if (fs.existsSync(keyFilePath)) {
    // If the key file exists, read the key from the file
    const key = fs.readFileSync(keyFilePath, "utf-8");
    console.log("Key read from key.txt");

    // Use the existing key to encrypt text
    return encryptAES256Text(key, textToEncrypt);
  } else {
    // If the key file doesn't exist, create a new key and save it to the file
    const key = await generateAESKey();
    fs.writeFileSync(keyFilePath, key);
    console.log("New key generated and saved in key.txt");

    // Use the generated key to encrypt text
    return encryptAES256Text(key, textToEncrypt);
  }
}

function decryptWithAES256(textToDecrypt) {
  if (fs.existsSync(keyFilePath)) {
    // If the key file exists, read the key from the file
    const key = fs.readFileSync(keyFilePath, "utf-8");
    console.log("Key read from key.txt");

    // Use the existing key to encrypt text
    return decryptAES256Text(key, textToDecrypt);
  } else {
    throw Error("Key not found");
  }
}

// Function to encrypt text using the AES key
function encryptAES256Text(key, text) {
  const encrypted = aes256.encrypt(key, text);
  return encrypted;
}

function decryptAES256Text(key, text) {
  const decrypted = aes256.decrypt(key, text);
  return decrypted;
}

function generatePassword() {
  return generator.generate({
    length: 14,
    numbers: true,
  });
}

// Function to generate a strong AES key using bcrypt and async/await
async function generateAESKey() {
  const randomString = Math.random().toString(36).substring(2); // Generate a random string
  const saltRounds = 10; // Salt rounds for bcrypt

  try {
    const hash = await bcrypt.hash(randomString, saltRounds);
    return hash;
  } catch (err) {
    throw new Error("Error generating AES key: " + err);
  }
}

async function main() {
  // AES 256 encryption and decryption
//   const encryptedAES = await encryptWithAES256(textToEncrypt);
//   const decryptedAES = decryptWithAES256(encryptedAES);
//   console.log({ encryptedAES, decryptedAES });

   falconEncryption("")
}

main();
