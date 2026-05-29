export function B64Extractor(code) {
    if (code.length > 12000000) return null;
    const minLen = 50000;
    let start = 0;
    const MaxSearch = Math.min(code.length, 2500000);

    while (start < MaxSearch) {
        const q = code.indexOf('"', start);
        if (q === -1) break;
        const end = code.indexOf('"', q + 1);
        if (end === -1) break;

        const cand = code.slice(q + 1, end);
        if (cand.length > minLen && /^[A-Za-z0-9+/=]+$/.test(cand)) {
            return cand;
        }
        start = end + 1;
    }

    let longest = "", curr = "";
    for (let i = 0; i < code.length; i++) {
        const ch = code[i];
        if ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".includes(ch)) {
            curr += ch;
        } else {
            if (curr.length > longest.length && curr.length > 30000) longest = curr;
            curr = "";
        }
    }
    if (curr.length > longest.length) longest = curr;
    return longest.length > 30000 ? longest : null;
}