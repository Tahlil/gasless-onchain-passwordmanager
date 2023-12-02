let generator = require('generate-password');

function generatePassword() {
    return generator.generate({
        length: 14,
        numbers: true
    });
}

console.log(generatePassword());