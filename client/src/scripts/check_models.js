import * as fs from 'fs';
import * as path from 'path';

const projectRoot = process.cwd();
const outputFile = path.join(projectRoot, 'models_log.txt');

const pathsToTry = [
    path.join(projectRoot, 'client', '.env'),
    path.join(projectRoot, '.env'),
    path.join(projectRoot, 'src', '.env')
];

let API_KEY = "";

for (const envPath of pathsToTry) {
    try {
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
            if (match) {
                API_KEY = match[1].trim();
                break;
            }
        }
    } catch (e) { }
}

if (!API_KEY) {
    fs.writeFileSync(outputFile, "FATAL: No API Key found.");
    process.exit(1);
}

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        let output = "\n--- AVAILABLE MODELS (v1beta) of API KEY ---\n";
        if (data.models) {
            data.models.forEach(m => {
                output += `- ${m.name}\n`;
                output += `  Methods: ${JSON.stringify(m.supportedGenerationMethods)}\n`;
            });
        } else {
            output += JSON.stringify(data, null, 2);
        }

        fs.writeFileSync(outputFile, output);

    } catch (e) {
        fs.writeFileSync(outputFile, "Error: " + e.message);
    }
}

listModels();
