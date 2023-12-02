let generator = require("generate-password");
const aes256 = require("aes256");
const fs = require("fs");
const falcon = require("falcon-crypto");

const bcrypt = require("bcrypt");
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const keyFilePath = "key.txt";
const keyPair1FilePath = "keyPr1.bin";
const keyPair2FilePath = "keyPr2.bin";
const textToEncrypt = "hello";

async function falconEncryption(message) {
    message = convertUintArrayFromString(message);
    if (fs.existsSync(keyPair1FilePath) && fs.existsSync(keyPair2FilePath)) {
        // If the key file exists, read the key from the file
        const key1 = fs.readFileSync(keyPair1FilePath);
        const uintArrayFromFile = new Uint8Array(key1);
        console.log("Reading from file");
        return await falcon.sign(message, uintArrayFromFile);
      } else {
        // If the key file doesn't exist, create a new key and save it to the file
        const keyPair /*: {privateKey: Uint8Array; publicKey: Uint8Array} */ =
        await falcon.keyPair();
        fs.writeFileSync(keyPair1FilePath, keyPair.privateKey);
        fs.writeFileSync(keyPair2FilePath, keyPair.publicKey);
        console.log("New key generated and saved in .bin files");
        return await falcon.sign(message, keyPair.privateKey);
      }
 
    // const message /*: Uint8Array */ = new Uint8Array([
    //     104, 101, 108, 108, 111, 0,
    // ]); // "hello"
    // const signed = await falcon.sign(message, keyPair.privateKey);
    // const verified = await falcon.open(signed, keyPair.publicKey);

    // console.log({ message, signed, verified });
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

function convertStringFromUintArray(uintArray) {
  return decoder.decode(uintArray);
}

function convertUintArrayFromString(str) {
  return encoder.encode(str);
  // return Buffer.from(str, 'utf-8');
}

async function main() {
  // AES 256 encryption and decryption
  //   const encryptedAES = await encryptWithAES256(textToEncrypt);
  //   const decryptedAES = decryptWithAES256(encryptedAES);
  //   console.log({ encryptedAES, decryptedAES });

//   const arr = convertUintArrayFromString("hello");
//   console.log(arr);
//   console.log(convertStringFromUintArray(arr));
    
   
   const encryptedFalcon = await falconEncryption(textToEncrypt)
   console.log({encryptedFalcon});
}

main();
