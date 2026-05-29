import fs from 'fs/promises';
import path from 'path';
import { Worker } from 'worker_threads';
import { ProcessFile } from './lib/FileProcessor.js';
import os from 'os';

const INPUT_DIR = './files/input';
const OUTPUT_DIR = './files/output';
const LAYERS_DIR = './files/layers';
const MAX_CONCURRENT = Math.max(2, os.cpus().length - 1);

async function run() {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(LAYERS_DIR, { recursive: true });

    const files = (await fs.readdir(INPUT_DIR))
        .filter(f => f.endsWith('.js'));

    if (files.length === 0) {
        console.log("No .js files found in ./input folder");
        return;
    }

    console.log(`Auto-detected ${os.cpus().length} CPU cores → Using ${MAX_CONCURRENT} workers`);
    console.log(`Found ${files.length} files to process...\n`);

    const queue = [...files];
    const ActiveWorkers = [];

    while (queue.length > 0 || ActiveWorkers.length > 0) {
        while (ActiveWorkers.length < MAX_CONCURRENT && queue.length > 0) {
            const file = queue.shift();
            const promise = ProcessFile(file, INPUT_DIR, OUTPUT_DIR, LAYERS_DIR);
            ActiveWorkers.push(promise);

            promise.finally(() => {
                const index = ActiveWorkers.indexOf(promise);
                if (index > -1) ActiveWorkers.splice(index, 1);
            });
        }

        if (ActiveWorkers.length > 0) {
            await Promise.race(ActiveWorkers);
        }
    }

    console.log("\nAll files have been processed successfully!");
}

run().catch(console.error);