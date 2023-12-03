const { createCanvas } = require('canvas');
const fs = require('fs');

// Read data from JSON file
const jsonData = fs.readFileSync('encSize.json', 'utf-8');
const data = JSON.parse(jsonData);

// Constants for canvas size and margins
const canvasWidth = 600;
const canvasHeight = 500; // Increased canvas height
const margin = 70; // Increased margin
const axisStart = 15; // Starting point for the axes
const startYAxisFrom = 50;

// Create a canvas instance
const canvas = createCanvas(canvasWidth, canvasHeight);
const ctx = canvas.getContext('2d');

// Function to map X and Y values to canvas coordinates
function mapX(x) {
  return margin + ((canvasWidth - 2 * margin) * (x - minX)) / (maxX - minX);
}

function mapY(y) {
  return canvasHeight - (margin + ((canvasHeight - 2 * margin) * (y - minY)) / (maxY - minY));
}

// Find min and max values for X and Y axes and adjust to start from axisStart
const xValues = Object.keys(data).map(Number);
const yValues = Object.values(data).map(Number);
const minX = Math.min(...xValues, axisStart);
const maxX = Math.max(...xValues);
const minY = Math.min(...yValues, startYAxisFrom);
const maxY = Math.max(...yValues);

// Draw X and Y axes lines
ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvasWidth, canvasHeight);

ctx.strokeStyle = '#000';
ctx.lineWidth = 2;

// Draw X-axis line and label with increased margin
ctx.beginPath();
ctx.moveTo(mapX(axisStart), canvasHeight - margin);
ctx.lineTo(mapX(maxX), canvasHeight - margin);
ctx.stroke();
ctx.fillStyle = '#000';
ctx.textAlign = 'center';
ctx.textBaseline = 'top';
ctx.fillText('Strong Password Size', canvasWidth / 2, canvasHeight - 30);

// Draw Y-axis line and label with increased margin and starting from 50
ctx.beginPath();
ctx.moveTo(margin, mapY(maxY + 1)); // Starting point set to the maximum Y value + 1 for minimal gap
ctx.lineTo(margin, mapY(startYAxisFrom));
ctx.stroke();
ctx.save();
ctx.rotate(-Math.PI / 2);
ctx.fillStyle = '#000';
ctx.textAlign = 'center';
ctx.textBaseline = 'top';
ctx.fillText('Encrypted Password Size', -canvasHeight / 2, 20);
ctx.restore();

// Label X-axis with numbers from JSON data and increased margin
ctx.textAlign = 'center';
ctx.textBaseline = 'top';
for (let x in data) {
  ctx.fillText(x, mapX(Number(x)), canvasHeight - margin / 2 + 10);
}

// Label Y-axis with numbers from JSON data and increased margin
ctx.textAlign = 'right';
ctx.textBaseline = 'middle';
for (let y in data) {
  ctx.fillText(data[y], margin / 2 - 5, mapY(data[y]) - 10);
}

// Plot data points as a scatter plot with blue color
ctx.fillStyle = 'blue'; // Changed the color to blue
for (let x in data) {
  ctx.beginPath();
  ctx.arc(mapX(Number(x)), mapY(data[x]), 4, 0, Math.PI * 2);
  ctx.fill();
}

// Export the graph as a PNG file
const outputStream = fs.createWriteStream('graph.png');
const pngStream = canvas.createPNGStream();
pngStream.pipe(outputStream);
outputStream.on('finish', () => console.log('Graph exported as graph.png'));
