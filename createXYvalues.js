const fs = require('fs');
const str = "encSizeFal"

// Read JSON data from coordinates.json
const jsonData = fs.readFileSync(str + '.json', 'utf-8');
const data = JSON.parse(jsonData);

// Extract x and y values and pair them together
const pairs = [];
for (const key in data) {
  pairs.push(`${key} ${data[key]}`);
}

// Generate formatted string of paired values
const formattedString = pairs.join(' ');

// Write formatted values to output.txt
fs.writeFileSync('xy_values.' + str +'.txt', formattedString, 'utf-8');

console.log('output.txt created successfully!');