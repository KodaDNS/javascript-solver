import fs from 'fs/promises';
import path from 'path';
import { DecodeLayer } from './DecodeLayer.js';

export async function ProcessFile(filename, INPUT_DIR, OUTPUT_DIR, LAYERS_DIR) {
    console.log(`\n[→] Processing: ${filename}`);
    const code = await fs.readFile(path.join(INPUT_DIR, filename), 'utf8');

    let current = code;
    let layer = 0;
    const MaxLayers = 100;

    console.log(`   Size: ${(code.length / 1_000_000).toFixed(2)} MB`);

    while (layer < MaxLayers) {
        layer++;
        const { result, changed } = await DecodeLayer(current, layer);

        const preview = result.length > 7000000 
            ? result.substring(0, 3000000) + `\n\n/* ... TRUNCATED */`
            : result;

        await fs.writeFile(path.join(LAYERS_DIR, `${filename}.layer${layer}.js`), preview);

        if (changed) {
            current = result;
        } else {
            console.log(`   Stopped at layer ${layer} (no more changes)`);
            break;
        }
    }

    await fs.writeFile(path.join(OUTPUT_DIR, `final_${filename}`), current);
    console.log(`Done ${filename} → ${layer-1} layers`);
}