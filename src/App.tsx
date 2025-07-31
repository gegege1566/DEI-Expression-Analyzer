import React, { useState } from 'react';
import { personas } from './data/personas';
import { LLMService } from './utils/llmService';
import { analyzeResults } from './utils/analysisService';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ApiKeyManager } from './components/ApiKeyManager';
import { LLMSettings, LLMConfig, DEFAULT_CONFIG } from './components/LLMSettings';
import { AnalysisResult } from './types';
import { Loader2, Send } from 'lucide-react';

function App() {
  const [targetText, setTargetText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(DEFAULT_CONFIG);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  const handleAnalyze = async () => {
    if (!targetText.trim()) {
      setError('チェックする表現を入力してください');
      return;
    }

    if (!apiKey.trim()) {
      setError('OpenAI APIキーを設定してください');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgress({ completed: 0, total: personas.length });

    try {
      const llmService = new LLMService(apiKey, llmConfig);
      const checkResults = await llmService.checkAllPersonas(targetText, personas, (completed: number, total: number) => {
        setProgress({ completed, total });
      });
      const analysisResult = analyzeResults(checkResults);
      setResults(analysisResult);
    } catch (err) {
      setError('分析中にエラーが発生しました。APIキーを確認してください。');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
      setProgress({ completed: 0, total: 0 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="text-center py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            DEI Expression Analyzer
          </h1>
          <p className="text-gray-600">
            50人のペルソナによる多様性・公平性・包摂性の観点からの表現チェック
          </p>
        </div>
      </header>

      <div className="max-w-full mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左側: 入力エリア (1/4) */}
          <div className="lg:col-span-1">
            {/* チェック対象入力エリア（最上部） */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  チェックしたい表現・コピー
                </label>
                <textarea
                  value={targetText}
                  onChange={(e) => setTargetText(e.target.value)}
                  className="w-full h-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="例: 女性でも簡単に使える設計です"
                />
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* 進捗バー */}
              {isAnalyzing && progress.total > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>分析進捗</span>
                    <span>{progress.completed} / {progress.total} ペルソナ</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {Math.round((progress.completed / progress.total) * 100)}% 完了
                  </div>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    分析中...
                  </>
                ) : (
                  <>
                    <Send className="mr-2" size={20} />
                    チェックする
                  </>
                )}
              </button>
            </div>
            
            {/* API設定（中段） */}
            <ApiKeyManager 
              onApiKeyChange={setApiKey}
              currentApiKey={apiKey}
            />
            
            {/* LLM設定（最下段） */}
            <LLMSettings 
              config={llmConfig}
              onConfigChange={setLlmConfig}
            />
          </div>

          {/* 右側: 結果エリア (3/4) */}
          <div className="lg:col-span-3">
            {results && <ResultsDisplay results={results} apiKey={apiKey} />}
          </div>
        </div>
      </div>

      <footer className="text-center py-8 text-gray-500 text-sm bg-white mt-8">
        <p>このツールは50人の多様なペルソナの視点から表現をチェックします</p>
        <p>完全な判断ではなく、参考としてご利用ください</p>
      </footer>
    </div>
  );
}

export default App;