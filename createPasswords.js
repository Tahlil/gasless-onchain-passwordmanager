
let generator = require("generate-password");
const fs = require("fs");

const passFile = "pass.json"

function generatePassword(len) {
    return generator.generate({
      length: len,
      numbers: true,
    });
}

const data= {}

for (let i = 10; i < 110; i+=15) {
    data[i] = generatePassword(i);
}

const jsonData = JSON.stringify(data, null, 2); 

try {
    fs.writeFileSync(passFile, jsonData);
    console.log('Data written to JSON file successfully.');
  } catch (err) {
    console.error('Error writing JSON file:', err);
  }