import {
    base64ToUint8Array as fromBase64,
    uint8ArrayToBase64,
} from 'https://esm.sh/uint8array-extras@1';

type BinaryData = string | Array<number> | BufferSource;

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const toBuffer = <T>(data: string | Array<number> | T): Uint8Array | T => {
    if (typeof data === 'string') {
        return encoder.encode(data);
    }
    if (Array.isArray(data)) {
        return new Uint8Array(data);
    }
    return data;
};

const toUint8Array = <T>(data: BinaryData | T): Uint8Array | T => {
    const buffer = toBuffer(data);
    if (buffer instanceof Uint8Array) {
        return buffer;
    }
    if (buffer instanceof ArrayBuffer) {
        return new Uint8Array(buffer);
    }
    if (ArrayBuffer.isView(buffer)) {
        return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    }
    return buffer;
};

const toBase64 = (data: BinaryData): string => {
    const bytes = toUint8Array(data);
    if (bytes instanceof Uint8Array) {
        return uint8ArrayToBase64(bytes, { urlSafe : true });
    }
    throw new Error('Unable to convert data to base64: ' + typeof data);
};

// Number of random iv bytes used for encryption, 96 bits is recommended for AES-GCM as per https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams#iv
const ivBytes = 96 / 8;
// Number of random salt bytes used to derive an encryption key from a password
const saltBytes = 128 / 8;
// Number of hashing iterations to perform when deriving an encryption key from a password
const iterations = 1_000_000;
// The encryption algorithm
const algorithm = { name : 'AES-GCM' };
// The encryption key size
const keyBits = 256;
const keyBytes = keyBits / 8;

const deriveKey = async (password: BinaryData, { salt }: {salt?: BufferSource} = {}) => {
    if (!password) {
        throw new Error('Unable to derive an ecryption key due to empty password');
    }

    password = toBuffer(password);

    if (password.byteLength < keyBytes) {
        throw new Error(`Unable to derive an encryption key due to short password, got ${password.byteLength} bytes but at least ${keyBytes} bytes are required`);
    }

    if (!salt) {
        salt = crypto.getRandomValues(new Uint8Array(saltBytes));
    }

    const material = await crypto.subtle.importKey(
        'raw',
        password,
        'PBKDF2',
        false,
        ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
        {
            name : 'PBKDF2',
            hash : 'SHA-256',
            iterations,
            salt
        },
        material,
        {
            ...algorithm,
            length : keyBits
        },
        false,
        ['encrypt', 'decrypt']
    );

    return { key, salt };
};

const encrypt = async (plainText: BinaryData, { password }: {password: BinaryData}) => {
    const { key, salt } = await deriveKey(password);
    const iv = crypto.getRandomValues(new Uint8Array(ivBytes));
    const cipherText = await crypto.subtle.encrypt(
        {
            ...algorithm,
            additionalData : salt,
            iv
        },
        key,
        toBuffer(plainText)
    );
    return { cipherText: new Uint8Array(cipherText), iv, salt };
};

const decrypt = async (cipherText: BinaryData, { iv, salt, password }: {iv: BufferSource, salt: BufferSource, password: BinaryData}) => {
    const { key } = await deriveKey(password, { salt });
    const plainText = await crypto.subtle.decrypt(
        {
            ...algorithm,
            additionalData : salt,
            iv
        },
        key,
        toBuffer(cipherText)
    );
    return decoder.decode(plainText);
};

const seal = async (data: unknown, password: BinaryData): Promise<string> => {
    const plainText = JSON.stringify(data);
    const { cipherText, iv, salt } = await encrypt(plainText, { password });
    return toBase64(new Uint8Array([...salt as Uint8Array, ...iv, ...cipherText]));
};

const unseal = async <T = unknown>(data: string, password: BinaryData): Promise<T> => {
    const decoded = fromBase64(data);
    const salt = decoded.slice(0, saltBytes);
    const iv = decoded.slice(saltBytes, saltBytes + ivBytes);
    const cipherText = decoded.slice(saltBytes + ivBytes);
    const plainText = await decrypt(cipherText, { iv, salt, password });
    return JSON.parse(plainText);
};

export {
    seal,
    unseal
};
