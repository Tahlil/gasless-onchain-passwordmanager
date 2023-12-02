let generator = require("generate-password");
const aes256 = require("aes256");
const fs = require("fs");
const falcon = require("falcon-crypto'");

const keyFilePath = "key.txt";
const textToEncrypt = "Hello, this is a secret message!";



async function encryptWithAES256(textToEncrypt) {
  // Check if the key file exists
  if (fs.existsSync(keyFilePath)) {
    // If the key file exists, read the key from the file
    const key = fs.readFileSync(keyFilePath, "utf-8");
    console.log("Key read from key.txt");

    // Use the existing key to encrypt text
    encryptAES256Text(key, textToEncrypt);
  } else {
    // If the key file doesn't exist, create a new key and save it to the file
    const key = await generateAESKey();
    fs.writeFileSync(keyFilePath, key);
    console.log("New key generated and saved in key.txt");

    // Use the generated key to encrypt text
    encryptAES256Text(key, textToEncrypt);
  }
}

// Function to encrypt text using the AES key
function encryptAES256Text(key, text) {
  const encrypted = aes256.encrypt(key, text);
  console.log("Encrypted text:", encrypted);
}

function generatePassword() {
  return generator.generate({
    length: 14,
    numbers: true,
  });
}

const bcrypt = require('bcrypt');

// Function to generate a strong AES key using bcrypt and async/await
async function generateAESKey() {
  const randomString = Math.random().toString(36).substring(2); // Generate a random string
  const saltRounds = 10; // Salt rounds for bcrypt

  try {
    const hash = await bcrypt.hash(randomString, saltRounds);
    return hash;
  } catch (err) {
    throw new Error('Error generating AES key: ' + err);
  }
}


encryptWithAES256(textToEncrypt)
// console.log(aes256);