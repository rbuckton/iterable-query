export interface FixedBuffer {
    [index: number]: number;
    readonly length: number;
}

const newUInt8Buffer: (length: number | number[]) => FixedBuffer = typeof Uint8Array === "function"
    ? arg => new Uint8Array(<any>arg)
    : arg => typeof arg === "number" ? clear(new Array<number>(arg)) : arg.slice(0);

const randomize: (buffer: FixedBuffer) => void = typeof crypto === "object" && crypto.getRandomValues
    ? buffer => buffer instanceof Uint8Array ? crypto.getRandomValues(buffer) : pseudoRandomize(buffer)
    : pseudoRandomize;

const UUID_SIZE = 16;
const BLOCK_SIZE = 64;
const H = typeof Uint32Array === "function" ? new Uint32Array(5) : clear(new Array<number>(5));
const W = newUInt8Buffer(80);
const B = newUInt8Buffer(BLOCK_SIZE);

export function createUUID(message?: string | number, ns?: ArrayLike<number>): any {
    return ns ? createTextUUID(String(message), ns) : createRandomUUID();
}

export function createBuffer(length: number): FixedBuffer;
export function createBuffer(values: number[]): FixedBuffer;
export function createBuffer(arg: number | number[]): FixedBuffer {
    return newUInt8Buffer(arg);
}

function clear(array: FixedBuffer) {
    for (let i = 0; i < array.length; i++) array[i] = 0x00;
    return array;
}

function pseudoRandomize(buffer: FixedBuffer) {
    let i = 0;
    while (i + 4 <= buffer.length) setUint(buffer, i, 4, (Math.random() * 0xffffffff) | 0), i += 4;
    if (i + 2 <= buffer.length) setUint(buffer, i, 2, (Math.random() * 0xffff) | 0), i += 2;
    if (i + 1 <= buffer.length) setUint(buffer, i, 1, (Math.random() * 0xff) | 0);
}

function createTextUUID(message: string, ns: ArrayLike<number>) {
    const textSize = message.length;
    const messageSize = UUID_SIZE + textSize * 2;
    const finalBlockSize = messageSize % BLOCK_SIZE;
    const padSize = (finalBlockSize < BLOCK_SIZE - 8 - 1 ? BLOCK_SIZE : BLOCK_SIZE * 2) - finalBlockSize;
    const byteLength = messageSize + padSize;
    const buffer = byteLength <= BLOCK_SIZE ? B : newUInt8Buffer(byteLength);
    for (let i = 0; i < UUID_SIZE; ++i) buffer[i] = ns[i];
    for (let i = 0; i < textSize; ++i) setUint(buffer, UUID_SIZE + i * 2, 2, message.charCodeAt(i));
    buffer[messageSize] = 0x80;
    setUint(buffer, byteLength - 4, 4, messageSize * 8);
    H[0] = 0x67452301, H[1] = 0xefcdab89, H[2] = 0x98badcfe, H[3] = 0x10325476, H[4] = 0xc3d2e1f0;
    for (let offset = 0; offset < byteLength; offset += BLOCK_SIZE) {
        let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4];
        for (let i = 0; i < 80; ++i) {
            if (i < 16) {
                let x = offset + i * 4;
                W[i] = buffer[x] << 24 | buffer[x + 1] << 16 | buffer[x + 2] << 8 | buffer[x + 3];
            }
            else {
                let x = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                W[i] = (x << 1 | x >>> 31) >>> 0;
            }
            let t = (a << 5 | a >>> 27) >>> 0 + e + W[i];
            if (i < 20) t += ((b & c) | (~b & d)) + 0x5A827999;
            else if (i < 40) t += (b ^ c ^ d) + 0x6ED9EBA1;
            else if (i < 60) t += ((b & c) | (b & d) | (c & d)) + 0x8F1BBCDC;
            else t += (b ^ c ^ d) + 0xCA62C1D6;
            e = d, d = c, c = (b << 30 | b >>> 2) >>> 0, b = a, a = t;
        }
        H[0] += a, H[1] += b, H[2] += c, H[3] += d, H[4] += e;
    }
    for (let i = 0; i < 5; ++i) setUint(buffer, i * 4, 4, H[i]);
    return formatUUID(buffer, 0x41);
}

function createRandomUUID() {
    randomize(B);
    return formatUUID(B, 0x40);
}

function formatUUID(buffer: FixedBuffer, kind: number) {
    let offset = 0;
    buffer[6] = buffer[6] & 0x4f | kind;
    buffer[8] = buffer[8] & 0xbf | 0x80;
    return `urn:uuid:${"DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD".replace(/DD/g, () => (buffer[offset] < 16 ? "0" : "") + buffer[offset++].toString(16))}`;
}

function setUint(buffer: FixedBuffer, offset: number, size: number, value: number): void {
    for (let i = 0; i < size; ++i) buffer[offset + i] = (value >>> ((size - i - 1) * 8)) & 0xff;
}