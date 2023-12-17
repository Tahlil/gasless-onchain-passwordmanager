import fs from 'fs';
import path from 'path';

const contractDetailsDataPath = path.join(__dirname, "../", "results", "ethereumPass.json");

const jsonData = JSON.parse(fs.readFileSync(contractDetailsDataPath, 'utf8'));


for (const data of jsonData) {
    console.log(data.registerFunction); 
}
