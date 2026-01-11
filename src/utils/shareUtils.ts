/**
 * Share Utils
 * Handles encoding and decoding of Pet Room state for sharing via URL.
 * Uses Base64 encoding to keep URLs relatively short and safe.
 */

export interface ShareData {
    c: string; // character (species)
    e: number; // evolution stage
    n: string; // nickname
    h: string; // house type
    g: string; // ground type
    l: number; // level
    // We can add more fields as needed (e.g., accessories)
}

/**
 * Encodes share data into a Base64 string safe for URLs.
 */
export const encodeShareData = (data: ShareData): string => {
    try {
        const jsonString = JSON.stringify(data);
        // Encode to Base64 (btoa is available in browsers)
        // We replace characters that might be problematic in URLs if needed,
        // but standard encoding usually works fine with query params.
        return btoa(unescape(encodeURIComponent(jsonString)));
    } catch (error) {
        console.error('Error encoding share data:', error);
        return '';
    }
};

/**
 * Decodes a Base64 string back into ShareData object.
 */
export const decodeShareData = (encodedInfo: string): ShareData | null => {
    try {
        const jsonString = decodeURIComponent(escape(atob(encodedInfo)));
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error decoding share data:', error);
        return null;
    }
};

/**
 * Generates the full share URL.
 */
export const generateShareUrl = (data: ShareData): string => {
    const encoded = encodeShareData(data);
    const baseUrl = window.location.origin;
    return `${baseUrl}/share?data=${encoded}`;
};
