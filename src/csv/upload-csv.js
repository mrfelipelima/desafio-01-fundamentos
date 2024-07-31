import { parse } from 'csv-parse';
import fs from 'node:fs';

const filePath = new URL('./tasks.csv', import.meta.url)
const stream = fs.createReadStream(filePath)

const csvReader = parse({
    delimiter: ',',
    fromLine: 2
  });

async function main() {
    const readLine = stream.pipe(csvReader)

    for await (const line of readLine) {
        const [title, description] = line
        await fetch('http://localhost:3333/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description })
        })
    }
}

main()