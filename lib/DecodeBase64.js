export function DecB64(b64) {
    try {
        let cleaned = b64.replace(/[^A-Za-z0-9+/=]/g, '');
        return Buffer.from(cleaned, 'base64').toString('utf8');
    } catch (e) { return null; }
}