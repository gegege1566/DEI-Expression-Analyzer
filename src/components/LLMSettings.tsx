import React, { useState, useEffect } from 'react';
import { Settings, ChevronDown, ChevronUp, RotateCcw, FileText, Cpu, Edit3 } from 'lucide-react';
import { ModelSelectionModal } from './ModelSelectionModal';
import { PromptTemplateModal } from './PromptTemplateModal';

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  promptTemplate?: string;
}

interface LLMSettingsProps {
  config: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
}

const DEFAULT_PROMPT_TEMPLATE = `あなたは以下の人物ペルソナ本人になり切って、表現について感じたことを本人らしい言葉遣いで述べてください。判定の対象は「評価対象テキスト」**のみ**です。

ペルソナの性格・年齢・立場に応じて、以下のような多様な表現スタイルを使い分けてください：
・堅い表現：〜と考えます、〜の観点から問題だと思います、〜は適切ではないでしょう
・やわらかい表現：〜が気になります、〜って感じちゃって、〜なのかなと思いました
・直接的：はっきり言ってダメ、これは良くない、違和感しかない
・経験談型：私の経験では〜、昔〜があったので、似たようなことで〜
・分析型：〜という点で問題、構造的に〜、社会的に見ると〜

<PERSONA>
{{persona}}
</PERSONA>

<TARGET_TEXT>
{{targettext}}
</TARGET_TEXT>

【評価プロセス（必ず2段階で判定）】
**第1段階：まず自分の基準でOKかNGかを判定**
- NG：自分や同じような立場の人が不利益・疎外・不快を感じる表現
- OK：自分の立場から見て問題ない、または中立的な表現

**第2段階：第1段階でOKと判定した場合のみ、もう一度考え直す**
OKと判定した表現について、以下の観点でもう一度検討してください：
- 「本当に完全に問題ないのか？」
- 「文脈や受け手によっては微妙に感じる可能性はないか？」
- 「完全にOKではなく、やや気になる部分があるのではないか？」

→ 再検討の結果、やはり微妙だと感じた場合のみGRAYに変更
→ それでも問題ないと確信する場合はOKのまま

【出力ルール】
1) 必ず上記の2段階プロセスで判定してください
2) NGと判定した場合は、そのままNG
3) OKと判定した場合は、第2段階で再検討してGRAYかOKかを決定
4) 理由は必ずペルソナ本人の一人称で、そのペルソナらしい口調・表現で書く
5) 年齢・職業・背景に応じた自然な言葉遣いを使用（敬語・タメ口・専門用語など）
6) 80〜120字程度で具体的に、ペルソナの個性が表れるように
7) どの部分が気になるかを、そのペルソナならではの視点で明確に示す
8) 出力形式：NG|理由 または GRAY|理由 または OK|理由（改行なし）

【最終出力フォーマット（厳守）】
OK|（ペルソナの個性が表れる自然な一人称コメント）
または
GRAY|（ペルソナの個性が表れる自然な一人称コメント）
または
NG|（ペルソナの個性が表れる自然な一人称コメント）`;

const DEFAULT_CONFIG: LLMConfig = {
  model: 'gpt-4.1-mini',  // 推奨モデル：知能・速度・コストのバランス型
  temperature: 0.7,
  maxTokens: 300,  // リージョナルモデル対応のため増量
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  promptTemplate: DEFAULT_PROMPT_TEMPLATE,
};

const AVAILABLE_MODELS = [
  // Reasoning モデル（複雑・多段階タスクに強い oシリーズ）
  { 
    value: 'o4-mini', 
    label: 'o4-mini', 
    description: '高速かつ手頃なReasoningモデル。構造出力や複雑タスクにも対応', 
    category: 'Reasoningモデル（複雑・多段階タスクに強い oシリーズ）',
    priceLevel: 2,
    priceStars: '★★☆☆☆'
  },
  { 
    value: 'o3', 
    label: 'o3', 
    description: '最も強力なReasoningモデル。複雑・多段階タスクや科学・数学系に最適', 
    category: 'Reasoningモデル（複雑・多段階タスクに強い oシリーズ）',
    priceLevel: 4,
    priceStars: '★★★★☆'
  },
  { 
    value: 'o3-pro', 
    label: 'o3-pro', 
    description: 'o3 の拡張版。より多くの計算リソースを使い、応答品質を向上', 
    category: 'Reasoningモデル（複雑・多段階タスクに強い oシリーズ）',
    priceLevel: 4,
    priceStars: '★★★★☆'
  },
  { 
    value: 'o3-mini', 
    label: 'o3-mini', 
    description: 'o3 の小型版。軽量・高速な代替モデル', 
    category: 'Reasoningモデル（複雑・多段階タスクに強い oシリーズ）',
    priceLevel: 2,
    priceStars: '★★☆☆☆'
  },
  { 
    value: 'o1', 
    label: 'o1', 
    description: '旧フルサイズReasoningモデル。科学・数学・研究タスク向け', 
    category: 'Reasoningモデル（複雑・多段階タスクに強い oシリーズ）',
    priceLevel: 5,
    priceStars: '★★★★★'
  },
  { 
    value: 'o1-pro', 
    label: 'o1-pro', 
    description: 'o1 の拡張版。より多くの計算リソースを使い、応答品質を向上', 
    category: 'Reasoningモデル（複雑・多段階タスクに強い oシリーズ）',
    priceLevel: 5,
    priceStars: '★★★★★'
  },
  
  // コスト最適化モデル（小型・高速・低コスト）
  { 
    value: 'gpt-4.1-mini', 
    label: 'GPT-4.1 mini (推奨)', 
    description: '知能・速度・コストのバランス型モデル。幅広い用途に最適', 
    category: 'コスト最適化モデル（小型・高速・低コスト）',
    priceLevel: 2,
    priceStars: '★★☆☆☆'
  },
  { 
    value: 'gpt-4.1-nano', 
    label: 'GPT-4.1 nano', 
    description: 'GPT-4.1シリーズ最速・最安モデル。軽量タスク向き', 
    category: 'コスト最適化モデル（小型・高速・低コスト）',
    priceLevel: 1,
    priceStars: '★☆☆☆☆'
  },
  { 
    value: 'gpt-4.1', 
    label: 'GPT-4.1', 
    description: '最新の万能モデル。長文・大規模処理可能でマルチモーダル対応', 
    category: 'コスト最適化モデル（小型・高速・低コスト）',
    priceLevel: 3,
    priceStars: '★★★☆☆'
  },
  { 
    value: 'gpt-4o-mini', 
    label: 'GPT-4o mini', 
    description: '高速で手頃な小型モデル。特定タスク向き', 
    category: 'コスト最適化モデル（小型・高速・低コスト）',
    priceLevel: 2,
    priceStars: '★★☆☆☆'
  },
];

export const LLMSettings: React.FC<LLMSettingsProps> = ({ config, onConfigChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isPromptTemplateModalOpen, setIsPromptTemplateModalOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState<LLMConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleConfigUpdate = (updates: Partial<LLMConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleModelSelect = (modelValue: string) => {
    handleConfigUpdate({ model: modelValue });
  };

  const resetToDefaults = () => {
    setLocalConfig(DEFAULT_CONFIG);
    onConfigChange(DEFAULT_CONFIG);
  };

  const handlePromptTemplateChange = (template: string) => {
    handleConfigUpdate({ promptTemplate: template });
  };

  const selectedModel = AVAILABLE_MODELS.find(m => m.value === localConfig.model) || AVAILABLE_MODELS[0];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Settings className="mr-2 text-blue-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">LLM設定</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaults}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="デフォルトに戻す"
          >
            <RotateCcw size={16} className="mr-1" />
            リセット
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                折りたたむ
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                展開
              </>
            )}
          </button>
        </div>
      </div>

      {/* モデル選択（モーダル形式） */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AIモデル
        </label>
        
        {/* 選択中モデルの表示エリア */}
        <div 
          onClick={() => setIsModelModalOpen(true)}
          className="w-full p-4 bg-gray-50 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-100 cursor-pointer transition-all duration-200"
        >
          <div className="flex items-start gap-3">
            <Cpu size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-grow min-w-0">
              <div className="font-medium text-gray-800 mb-1">
                {selectedModel.label}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                価格: {selectedModel.priceStars}
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                {selectedModel.description}
              </div>
            </div>
            <ChevronDown size={20} className="text-gray-400 mt-1 flex-shrink-0" />
          </div>
        </div>
        
        <ModelSelectionModal
          isOpen={isModelModalOpen}
          onClose={() => setIsModelModalOpen(false)}
          models={AVAILABLE_MODELS}
          selectedModel={localConfig.model}
          onModelSelect={handleModelSelect}
        />
      </div>

      {/* 詳細設定（展開時のみ表示） */}
      {isExpanded && (
        <div className="mt-6 space-y-4 border-t pt-4">
          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature: {localConfig.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={localConfig.temperature}
              onChange={(e) => handleConfigUpdate({ temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>より一貫性のある回答 (0.0)</span>
              <span>よりクリエイティブな回答 (2.0)</span>
            </div>
          </div>


          {/* Top P */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Top P: {localConfig.topP}
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={localConfig.topP}
              onChange={(e) => handleConfigUpdate({ topP: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>より制限的 (0.1)</span>
              <span>より多様 (1.0)</span>
            </div>
          </div>

          {/* Frequency Penalty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              頻度ペナルティ: {localConfig.frequencyPenalty}
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={localConfig.frequencyPenalty}
              onChange={(e) => handleConfigUpdate({ frequencyPenalty: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>繰り返しを促進 (-2.0)</span>
              <span>繰り返しを抑制 (2.0)</span>
            </div>
          </div>

          {/* Presence Penalty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              存在ペナルティ: {localConfig.presencePenalty}
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={localConfig.presencePenalty}
              onChange={(e) => handleConfigUpdate({ presencePenalty: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>既存トピックを継続 (-2.0)</span>
              <span>新しいトピックを促進 (2.0)</span>
            </div>
          </div>

          {/* 設定の説明 */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <h4 className="font-medium mb-2">設定のヒント:</h4>
            <ul className="space-y-1">
              <li>• <strong>AIモデル</strong>: GPT-4.1 miniが推奨（コストパフォーマンス最適）</li>
              <li>• <strong>Temperature</strong>: 0.7でバランス良い応答、低いほど一貫性重視、高いほど創造性重視</li>
              <li>• <strong>Top P</strong>: 1.0で多様性確保、低いと予測しやすい応答、高いと幅広い語彙使用</li>
              <li>• <strong>頻度ペナルティ</strong>: 0.0が標準、正の値で単語の繰り返し抑制、負の値で促進</li>
              <li>• <strong>存在ペナルティ</strong>: 0.0が標準、正の値で新トピック促進、負の値で既存トピック継続</li>
            </ul>
          </div>
        </div>
      )}

      {/* プロンプトテンプレート設定 */}
      <div className="mt-6 border-t pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="mr-2 text-blue-600" size={18} />
            <h4 className="font-medium text-gray-800">プロンプトテンプレート</h4>
          </div>
          <button
            onClick={() => setIsPromptTemplateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 size={16} className="mr-2" />
            編集
          </button>
        </div>
        
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 line-clamp-2">
            {localConfig.promptTemplate && localConfig.promptTemplate.length > 100
              ? `${localConfig.promptTemplate.substring(0, 100)}...`
              : localConfig.promptTemplate || DEFAULT_PROMPT_TEMPLATE.substring(0, 100) + '...'
            }
          </p>
        </div>
        
        <PromptTemplateModal
          isOpen={isPromptTemplateModalOpen}
          onClose={() => setIsPromptTemplateModalOpen(false)}
          currentTemplate={localConfig.promptTemplate || DEFAULT_PROMPT_TEMPLATE}
          defaultTemplate={DEFAULT_PROMPT_TEMPLATE}
          onTemplateChange={handlePromptTemplateChange}
        />
      </div>
    </div>
  );
};

export { DEFAULT_CONFIG, DEFAULT_PROMPT_TEMPLATE };