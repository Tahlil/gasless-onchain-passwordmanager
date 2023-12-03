let generator = require("generate-password");
const aes256 = require("aes256");
const fs = require("fs");
const falcon = require("falcon-crypto");
const { performance } = require("perf_hooks");
const bcrypt = require("bcrypt");
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const keyFilePath = "key.txt";
const passFile = "pass.json";

const keyPair1FilePath = "keyPr1.bin";
const keyPair2FilePath = "keyPr2.bin";
const textToEncrypt = "hello";

async function falconEncryption(message) {
  message = convertUintArrayFromString(message);
  if (fs.existsSync(keyPair1FilePath) && fs.existsSync(keyPair2FilePath)) {
    // If the key file exists, read the key from the file
    const key1 = fs.readFileSync(keyPair1FilePath);
    const uintArrayFromFile = new Uint8Array(key1);
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
}

async function falconDecryption(encryptedUintArray) {
  if (fs.existsSync(keyPair1FilePath) && fs.existsSync(keyPair2FilePath)) {
    // If the key file exists, read the key from the file
    const key2 = fs.readFileSync(keyPair2FilePath);
    const uintArrayFromFile = new Uint8Array(key2);
    console.log("Reading from file");
    return convertStringFromUintArray(
      await falcon.open(encryptedUintArray, uintArrayFromFile)
    );
  } else {
    throw Error("Key not found");
  }
}

async function encryptWithAES256(textToEncrypt) {
  // Check if the key file exists
  if (fs.existsSync(keyFilePath)) {
    // If the key file exists, read the key from the file
    const key = fs.readFileSync(keyFilePath, "utf-8");
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

async function encryptWithAES256WithKey(textToEncrypt, key) {
  return encryptAES256Text(key, textToEncrypt);
}

function storeJsonFile(filePath, jsObj) {
  const jsonData = JSON.stringify(jsObj, null, 2);

  try {
    fs.writeFileSync(filePath, jsonData);
    console.log("Data written to JSON file successfully.");
  } catch (err) {
    console.error("Error writing JSON file:", err);
  }
}

function decryptWithAES256(textToDecrypt) {
  if (fs.existsSync(keyFilePath)) {
    // If the key file exists, read the key from the file
    const key = fs.readFileSync(keyFilePath, "utf-8");
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

async function testAES256(params) {
   // Test AES
   try {
    const jsonData = fs.readFileSync(passFile, "utf-8");

    let encryptedSize = {},
      encryptionTime = {},
      decryptionTime = {};

    let encryptedSizeFilePath = "encSize.json"; 
    let encryptedTimeFilePath = "encTime.json"; 
    let decryptedTimeFilePath = "decTime.json"; 
    // Parse the JSON data into a JavaScript object
    const data = JSON.parse(jsonData);

    // Loop through the object properties
    for (let key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        let startTime = performance.now();
        const symmetricKey = await generateAESKey();
        const encryptedAES = await encryptWithAES256WithKey(
          data[key],
          symmetricKey
        );
        let endTime = performance.now();
        let elapsedTime = endTime - startTime;
        encryptedSize[key] = encryptedAES.length;
        encryptionTime[key] = elapsedTime.toFixed(3);
        startTime = performance.now();
        decryptAES256Text(symmetricKey, encryptedAES);
        endTime = performance.now();
        elapsedTime = endTime - startTime;
        decryptionTime[key] = elapsedTime.toFixed(3);
      }
    }
    storeJsonFile(encryptedSizeFilePath, encryptedSize);
    storeJsonFile(encryptedTimeFilePath, encryptionTime);
    storeJsonFile(decryptedTimeFilePath, decryptionTime);

  } catch (err) {
    console.error("Error reading JSON file:", err);
  }
}

async function testFalcon() {
  // Test AES
  try {
   const jsonData = fs.readFileSync(passFile, "utf-8");

   let encryptedSize = {},
     encryptionTime = {},
     decryptionTime = {};

   let encryptedSizeFilePath = "encSizeFal.json"; 
   let encryptedTimeFilePath = "encTimeFal.json"; 
   let decryptedTimeFilePath = "decTimeFal.json"; 
   // Parse the JSON data into a JavaScript object
   const data = JSON.parse(jsonData);

   // Loop through the object properties
   for (let key in data) {
     if (Object.prototype.hasOwnProperty.call(data, key)) {
       let startTime = performance.now();
       const keyPair /*: {privateKey: Uint8Array; publicKey: Uint8Array} */ =
       await falcon.keyPair();
       const message = convertUintArrayFromString(data[key]);
       const encryptedFalcon = await falcon.sign(message, keyPair.privateKey);
      //  console.log(data[key]);
      //  const strEncrypted = convertStringFromUintArray(encryptedFalcon)
       let endTime = performance.now();
       let elapsedTime = endTime - startTime;
       encryptedSize[key] = encryptedFalcon.length;
       encryptionTime[key] = elapsedTime.toFixed(3);
       startTime = performance.now();
      //  const encryptedUintArray = convertUintArrayFromString(strEncrypted)
       const decrypted = convertStringFromUintArray(
         await falcon.open(encryptedFalcon, keyPair.publicKey)
       );
      //  console.log({decrypted});
       endTime = performance.now();
       elapsedTime = endTime - startTime;
       decryptionTime[key] = elapsedTime.toFixed(3);
     }
   }
   storeJsonFile(encryptedSizeFilePath, encryptedSize);
   storeJsonFile(encryptedTimeFilePath, encryptionTime);
   storeJsonFile(decryptedTimeFilePath, decryptionTime);

 } catch (err) {
   console.error("Error reading JSON file:", err);
 }
}


async function main() {
  // AES 256 encryption and decryption
  //   const encryptedAES = await encryptWithAES256(textToEncrypt);
  //   const decryptedAES = decryptWithAES256(encryptedAES);
  //   console.log({ encryptedAES, decryptedAES });

  //   const arr = convertUintArrayFromString("hello");
  //   console.log(arr);
  //   console.log(convertStringFromUintArray(arr));

  //  const encryptedFalcon = await falconEncryption(textToEncrypt)
  //  console.log({encryptedFalcon});
  //  console.log(convertStringFromUintArray(encryptedFalcon).length);
  //  console.log(await falconDecryption(encryptedFalcon))
  // Start the timer

  testFalcon()

  // const dt=  [
  //   "w7miNakSiHQAsfEKFSOyhB6rg",
  //   "eCJPAB3kgLqy38pcMTbQQAvGaxwKimHSMRrmKvnq",
  //   "0gmZSmIyjaj3Wl0Nr4ZImdfnI7SqNX4kFOSHGuHXRcORmSh1Mh1GIx6",
  //   "Yxh7mwWwaMEvL8rqY5KAsUpiMCX1oQoo2t6wwvmL9nyJK1xKpR3A9xQTcfol60vneEsD6w",
  //   "jqBaXgwNneWzgoog6b0TNKDRdDadXZfw5kKNJTK5HUhTHL8bwIwrOPzAL1cLQmfJLkW0ZdxlLTPXEHmP4cKwv",
  //   "NinYWLEHuesvxQXl7dK6hVy9WjXWOFe2RlTFdshxmG6rL1yjOQCG9WLF1wMoDKCDJDVtw4h1uOhJuNo98MKjhIIsyx6NiqjI5cy8"
  //   ]

  // let encryptedAES
  // let startTime = performance.now();
  // for (let i = 0; i < 10000; i++) {
  //   encryptedAES = await encryptWithAES256(dt[0]);
  //   decryptWithAES256(encryptedAES);
  // }
  // console.log(encryptedAES.length);

  // let endTime = performance.now();

  // let elapsedTime = endTime - startTime;
  // console.log(`Time elapsed: ${elapsedTime} milliseconds`);

  // Your code here
  // const encryptedAES = await encryptWithAES256(textToEncrypt);
  // const decryptedAES = decryptWithAES256(encryptedAES);

  // End the timer and log the execution time
}

main();
