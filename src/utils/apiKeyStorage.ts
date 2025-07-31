// APIキーのローカル保存・管理ユーティリティ

const API_KEY_STORAGE_KEY = 'dei_checker_openai_api_key';
const API_KEY_TIMESTAMP_KEY = 'dei_checker_api_key_timestamp';

// 簡単な暗号化（基本的な難読化）
function simpleEncrypt(text: string): string {
  if (!text) return '';
  
  // Base64エンコード + 単純なシフト暗号
  const base64 = btoa(text);
  const shifted = base64.split('').map(char => 
    String.fromCharCode(char.charCodeAt(0) + 3)
  ).join('');
  
  return shifted;
}

// 復号化
function simpleDecrypt(encrypted: string): string {
  if (!encrypted) return '';
  
  try {
    // シフトを元に戻す
    const unshifted = encrypted.split('').map(char => 
      String.fromCharCode(char.charCodeAt(0) - 3)
    ).join('');
    
    // Base64デコード
    return atob(unshifted);
  } catch (error) {
    console.warn('Failed to decrypt API key:', error);
    return '';
  }
}

// APIキーの保存
export function saveApiKey(apiKey: string): void {
  if (!apiKey || !apiKey.trim()) {
    sessionStorage.removeItem(API_KEY_STORAGE_KEY);
    sessionStorage.removeItem(API_KEY_TIMESTAMP_KEY);
    return;
  }

  const encrypted = simpleEncrypt(apiKey.trim());
  const timestamp = Date.now().toString();
  
  sessionStorage.setItem(API_KEY_STORAGE_KEY, encrypted);
  sessionStorage.setItem(API_KEY_TIMESTAMP_KEY, timestamp);
}

// APIキーの読み込み
export function loadApiKey(): string {
  try {
    const encrypted = sessionStorage.getItem(API_KEY_STORAGE_KEY);
    if (!encrypted) return '';
    
    const decrypted = simpleDecrypt(encrypted);
    
    // APIキーの形式をチェック（OpenAI APIキーはsk-で始まる）
    if (decrypted && decrypted.startsWith('sk-')) {
      return decrypted;
    }
    
    // 無効なキーの場合は削除
    clearApiKey();
    return '';
  } catch (error) {
    console.warn('Failed to load API key:', error);
    clearApiKey();
    return '';
  }
}

// APIキーの削除
export function clearApiKey(): void {
  sessionStorage.removeItem(API_KEY_STORAGE_KEY);
  sessionStorage.removeItem(API_KEY_TIMESTAMP_KEY);
}

// APIキーが保存されているかチェック
export function hasApiKey(): boolean {
  const apiKey = loadApiKey();
  return apiKey.length > 0;
}

// APIキーの保存日時を取得
export function getApiKeyTimestamp(): Date | null {
  const timestamp = sessionStorage.getItem(API_KEY_TIMESTAMP_KEY);
  if (!timestamp) return null;
  
  return new Date(parseInt(timestamp));
}

// APIキーの一部を隠して表示用に変換
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return '';
  
  return apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4);
}

// APIキーの有効性をチェック（基本的な形式チェック）
export function validateApiKey(apiKey: string): { isValid: boolean; message: string } {
  if (!apiKey || !apiKey.trim()) {
    return { isValid: false, message: 'APIキーが入力されていません' };
  }

  const trimmed = apiKey.trim();

  if (!trimmed.startsWith('sk-')) {
    return { isValid: false, message: 'OpenAI APIキーは"sk-"で始まる必要があります' };
  }

  if (trimmed.length < 20) {
    return { isValid: false, message: 'APIキーが短すぎます' };
  }

  if (trimmed.length > 200) {
    return { isValid: false, message: 'APIキーが長すぎます' };
  }

  // 基本的な文字チェック（英数字とハイフンのみ）
  const validChars = /^sk-[A-Za-z0-9\-_]+$/;
  if (!validChars.test(trimmed)) {
    return { isValid: false, message: 'APIキーに無効な文字が含まれています' };
  }

  return { isValid: true, message: 'APIキーの形式は正しいです' };
}