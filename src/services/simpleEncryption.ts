/**
 * Simple Encryption Service (Synchronous)
 * localStorage 데이터 간단 암호화 및 무결성 검증
 *
 * 보안 수준: 콘솔에서 직접 조작하는 일반 사용자 방지
 * - Base64 + XOR 암호화 (빠르고 간단)
 * - 체크섬으로 무결성 검증
 * - 완벽한 보안은 아니지만 쉬운 조작은 방지
 */

// 앱별 고유 키 (변경 가능)
const SECRET_KEY = 'puzzleletic-2025-secret-key';

// 민감한 필드 목록
const SENSITIVE_FIELDS = ['gro', 'totalCurrencyEarned', 'studyCount'];

/**
 * 간단한 XOR 암호화
 */
function xorEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result); // Base64 인코딩
}

/**
 * XOR 복호화
 */
function xorDecrypt(encoded: string, key: string): string | null {
  try {
    const text = atob(encoded); // Base64 디코딩
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return null;
  }
}

/**
 * 간단한 체크섬 생성 (무결성 검증용)
 */
function simpleChecksum(data: string): string {
  let hash = 0;
  const str = data + SECRET_KEY;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * 민감한 데이터 보호
 * Robust Checksum V2: _enc 필드와 lastActiveTime만 검증 (객체 키 순서 문제 해결)
 */
export function protectData(state: any): { protectedData: any; checksum: string } {
  const protectedData: any = { ...state };
  const sensitiveData: any = {};

  // 민감한 필드 추출
  for (const field of SENSITIVE_FIELDS) {
    if (protectedData[field] !== undefined) {
      sensitiveData[field] = protectedData[field];
      delete protectedData[field];
    }
  }

  // 민감한 데이터 암호화
  const dataStr = JSON.stringify(sensitiveData);
  protectedData._enc = xorEncrypt(dataStr, SECRET_KEY);

  // 체크섬 생성 (Robust: Encrypted String + Timestamp only)
  // 전체 JSON.stringify는 키 순서 문제로 깨지기 쉬움
  const checksumPayload = `${protectedData._enc}|${protectedData.lastActiveTime}`;
  const checksum = simpleChecksum(checksumPayload);

  return { protectedData, checksum };
}

/**
 * 보호된 데이터 복원
 */
export function restoreData(protectedState: any, storedChecksum: string): any | null {
  try {
    // 체크섬 검증 (Rough Integrity Check)
    // _enc가 없으면(구버전) 검증 패스 (하위 호환성)
    if (protectedState._enc) {
      const checksumPayload = `${protectedState._enc}|${protectedState.lastActiveTime}`;
      const computedChecksum = simpleChecksum(checksumPayload);

      if (computedChecksum !== storedChecksum) {
        console.warn('⚠️ Data tampering detected! Checksum mismatch.');
        return null;
      }
    }

    const state = { ...protectedState };
    const encrypted = state._enc;
    delete state._enc;

    if (!encrypted) {
      return state; // 암호화된 데이터가 없으면 그대로 반환
    }

    // 복호화
    const decrypted = xorDecrypt(encrypted, SECRET_KEY);
    if (!decrypted) {
      console.warn('⚠️ Failed to decrypt data!');
      return null;
    }

    const sensitiveData = JSON.parse(decrypted);

    // 민감한 필드 복원
    return { ...state, ...sensitiveData };
  } catch (error) {
    console.error('Failed to restore data:', error);
    return null;
  }
}
