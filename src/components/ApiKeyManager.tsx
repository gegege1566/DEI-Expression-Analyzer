import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  saveApiKey, 
  loadApiKey, 
  clearApiKey, 
  hasApiKey, 
  maskApiKey, 
  validateApiKey,
  getApiKeyTimestamp 
} from '../utils/apiKeyStorage';

interface ApiKeyManagerProps {
  onApiKeyChange: (apiKey: string) => void;
  currentApiKey: string;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeyChange, currentApiKey }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputApiKey, setInputApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [savedTimestamp, setSavedTimestamp] = useState<Date | null>(null);

  useEffect(() => {
    // 保存されたAPIキーを読み込み
    const savedApiKey = loadApiKey();
    if (savedApiKey) {
      onApiKeyChange(savedApiKey);
      setInputApiKey(savedApiKey);
      setSavedTimestamp(getApiKeyTimestamp());
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    const validation = validateApiKey(inputApiKey);
    
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.message });
      return;
    }

    saveApiKey(inputApiKey);
    onApiKeyChange(inputApiKey);
    setSavedTimestamp(new Date());
    setMessage({ type: 'success', text: 'APIキーを保存しました' });
    
    // メッセージを3秒後に消す
    setTimeout(() => setMessage(null), 3000);
  };

  const handleClearApiKey = () => {
    if (window.confirm('保存されたAPIキーを削除しますか？')) {
      clearApiKey();
      setInputApiKey('');
      onApiKeyChange('');
      setSavedTimestamp(null);
      setMessage({ type: 'info', text: 'APIキーを削除しました' });
      
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleInputChange = (value: string) => {
    setInputApiKey(value);
    setMessage(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Key className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-800">OpenAI APIキー管理</h3>
          {hasApiKey() && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              保存済み
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
        >
          {isExpanded ? '閉じる' : '設定'}
        </button>
      </div>

      {hasApiKey() && !isExpanded && (
        <div className="text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <span>APIキー: {maskApiKey(currentApiKey)}</span>
          </div>
          {savedTimestamp && (
            <div className="text-xs text-gray-500 mt-1">
              保存日時: {savedTimestamp.toLocaleString('ja-JP')}
            </div>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              APIキー
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={inputApiKey}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSaveApiKey}
              disabled={!inputApiKey.trim()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              保存
            </button>
            
            {hasApiKey() && (
              <button
                onClick={handleClearApiKey}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                削除
              </button>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• APIキーはブラウザのローカルストレージに暗号化して保存されます</p>
            <p>• このデバイス上でのみ利用可能で、他のデバイスと共有されません</p>
            <p>• OpenAI APIキーは <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">こちら</a> で取得できます</p>
          </div>
        </div>
      )}
    </div>
  );
};