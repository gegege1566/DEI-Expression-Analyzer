import React, { useState, useEffect } from 'react';
import { X, FileText, RotateCcw, Save, Copy, Check } from 'lucide-react';

interface PromptTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: string;
  defaultTemplate: string;
  onTemplateChange: (template: string) => void;
}

const PRESET_TEMPLATES = [
  {
    name: 'デフォルト（推奨）',
    description: 'バランスの取れた多様性・公平性・包摂性チェック用プロンプト',
    template: `あなたは以下の人物ペルソナ本人になり切って、表現について感じたことを本人らしい言葉遣いで述べてください。判定の対象は「評価対象テキスト」**のみ**です。

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
NG|（ペルソナの個性が表れる自然な一人称コメント）`
  },
  {
    name: '厳格モード',
    description: 'より厳しい基準でDEIチェックを行うプロンプト',
    template: `あなたは多様性・公平性・包摂性の専門家として、以下のペルソナの視点から表現を厳格に評価してください。

<PERSONA>
{{persona}}
</PERSONA>

<TARGET_TEXT>
{{targettext}}
</TARGET_TEXT>

【厳格な評価基準】
以下の要素が含まれる場合は必ずNGと判定してください：
- 性別・年齢・障害・出身などに基づく固定観念
- 特定のグループを排除する可能性のある表現
- 無意識のバイアスを助長する可能性のある言葉
- マイノリティへの配慮を欠く表現

【判定基準】
- NG：上記の要素が少しでも含まれる場合
- GRAY：中立的だが一部のグループに影響する可能性がある場合
- OK：完全にインクルーシブで問題のない表現

出力形式：NG|理由 または GRAY|理由 または OK|理由`
  },
  {
    name: '簡潔モード',
    description: 'シンプルで短時間の評価用プロンプト',
    template: `ペルソナ：{{persona}}

以下のテキストをこのペルソナの視点から評価してください：
{{targettext}}

判定基準：
- OK：問題なし
- NG：不適切・差別的
- GRAY：微妙・一部問題

出力：OK|理由 / NG|理由 / GRAY|理由（50字以内）`
  }
];

export const PromptTemplateModal: React.FC<PromptTemplateModalProps> = ({
  isOpen,
  onClose,
  currentTemplate,
  defaultTemplate,
  onTemplateChange,
}) => {
  const [editingTemplate, setEditingTemplate] = useState(currentTemplate);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditingTemplate(currentTemplate);
      // Check if current template matches any preset
      const presetIndex = PRESET_TEMPLATES.findIndex(preset => preset.template === currentTemplate);
      setSelectedPreset(presetIndex >= 0 ? presetIndex : null);
    }
  }, [isOpen, currentTemplate]);

  const handleSave = () => {
    onTemplateChange(editingTemplate);
    onClose();
  };

  const handleReset = () => {
    setEditingTemplate(defaultTemplate);
    setSelectedPreset(0); // Default template is first preset
  };

  const handlePresetSelect = (index: number) => {
    setEditingTemplate(PRESET_TEMPLATES[index].template);
    setSelectedPreset(index);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editingTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">プロンプトテンプレート設定</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(95vh-200px)]">
          {/* Left Panel - Presets */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">プリセットテンプレート</h3>
            
            <div className="space-y-3">
              {PRESET_TEMPLATES.map((preset, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedPreset === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handlePresetSelect(index)}
                >
                  <h4 className="font-medium text-gray-800 mb-1">{preset.name}</h4>
                  <p className="text-sm text-gray-600">{preset.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full"
              >
                <RotateCcw size={16} />
                デフォルトに戻す
              </button>
            </div>
          </div>

          {/* Right Panel - Template Editor */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">テンプレート編集</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'コピー済み' : 'コピー'}
              </button>
            </div>

            <textarea
              value={editingTemplate}
              onChange={(e) => setEditingTemplate(e.target.value)}
              className="flex-1 w-full px-4 py-3 text-sm font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="プロンプトテンプレートを入力..."
            />

            <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <p className="font-medium mb-2">利用可能な変数:</p>
              <ul className="space-y-1">
                <li><code className="bg-gray-200 px-1 rounded">{'{{persona}}'}</code> - ペルソナ情報が挿入されます</li>
                <li><code className="bg-gray-200 px-1 rounded">{'{{targettext}}'}</code> - チェック対象テキストが挿入されます</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            プロンプトテンプレートを変更すると、AIの評価基準が変わります
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};