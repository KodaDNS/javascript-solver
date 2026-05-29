import { B64Extractor } from './Base64Extractor.js';
import { DecB64 } from './DecodeBase64.js';

const DecodedArrays = new Set();

export async function DecodeLayer(code, LayerNum) {
    let result = code;
    let changed = false;

    if (LayerNum <= 20) {
        const bigB64 = B64Extractor(result);
        if (bigB64) {
            const decoded = DecB64(bigB64);
            if (decoded && decoded.length > bigB64.length * 0.35) {
                console.log(`   → Base64 decoded: ${bigB64.length.toLocaleString()} → ${decoded.length.toLocaleString()}`);
                result = decoded;
                changed = true;
                DecodedArrays.clear();
            }
        }
    }

    result = result.replace(/\\u([0-9a-fA-F]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
    result = result.replace(/\\x([0-9a-fA-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));

    if (result.length < 15000000) {
        const SelfRefMatch = result.match(/function\s+[_$a-zA-Z0-9]+\s*\(\)\s*\{[^}]*\[([^\]]{100,})\]/);
        if (SelfRefMatch) {
            const hash = SelfRefMatch[1].substring(0, 100);
            if (!DecodedArrays.has(hash)) {
                try {
                    const strings = eval('[' + SelfRefMatch[1] + ']');
                    if (strings.length > 20) {
                        DecodedArrays.add(hash);

                        result = result.replace(/[_$a-zA-Z0-9]+\[(\d{1,6})\]/g, (m, idx) => {
                            const i = parseInt(idx);
                            return i < strings.length ? JSON.stringify(strings[i]) : m;
                        });

                        console.log(`   → Self-referencing array decoded (${strings.length} strings)`);
                        changed = true;
                    }
                } catch (e) {}
            }
        }
    }

    result = result.replace(/_0x_0xf51b\s*\(\s*(\d+)\s*\)/g, (match, num) => {
        return `"[decoded_${num}]"`;
    });

    result = result.replace(/while\s*\(\s*!!\s*\[\s*\]\s*\)\s*\{[\s\S]*?try\s*\{[\s\S]*?\}\s*catch[\s\S]*?\}/g, '');
    result = result.replace(/function\s*\(\)\s*\{[\s\S]*?new RegExp[\s\S]*?\}\(\);?/g, '');
    result = result.replace(/\.constructor\(.+?\)\s*\(\s*''\s*\)/g, '');

    result = result.replace(/function\s+[_$a-zA-Z0-9]+\s*\(\)\s*\{[^}]*return\s+[_$a-zA-Z0-9]+\s*\(\);?\s*\}/g, '');

    return { result, changed };
}