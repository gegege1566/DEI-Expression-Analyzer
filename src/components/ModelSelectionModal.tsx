import React from 'react';
import { X, Check, Cpu, DollarSign, Info } from 'lucide-react';

interface ModelInfo {
  value: string;
  label: string;
  description: string;
  category: string;
  priceLevel: number;
  priceStars: string;
}

interface ModelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: ModelInfo[];
  selectedModel: string;
  onModelSelect: (modelValue: string) => void;
}

export const ModelSelectionModal: React.FC<ModelSelectionModalProps> = ({
  isOpen,
  onClose,
  models,
  selectedModel,
  onModelSelect,
}) => {
  if (!isOpen) return null;

  const handleModelSelect = (modelValue: string) => {
    onModelSelect(modelValue);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Group models by category
  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, ModelInfo[]>);

  const getPriceColor = (priceLevel: number) => {
    switch (priceLevel) {
      case 1: return 'text-green-600 bg-green-50';
      case 2: return 'text-blue-600 bg-blue-50';
      case 3: return 'text-yellow-600 bg-yellow-50';
      case 4: return 'text-orange-600 bg-orange-50';
      case 5: return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Cpu className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">AIモデルを選択</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          {Object.entries(groupedModels).map(([category, categoryModels]) => (
            <div key={category} className="p-6 border-b border-gray-100 last:border-b-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {category}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryModels.map((model) => (
                  <div
                    key={model.value}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedModel === model.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleModelSelect(model.value)}
                  >
                    {selectedModel === model.value && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check size={16} className="text-white" />
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <h4 className="font-semibold text-lg text-gray-800 mb-1">
                        {model.label}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceColor(model.priceLevel)}`}>
                          価格: {model.priceStars}
                        </span>
                        {model.label.includes('推奨') && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            推奨
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {model.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2 font-medium text-gray-700">価格レベルの説明:</p>
              <p className="mb-2">価格: ★☆☆☆☆ (最安) ～ 価格: ★★★★★ (最高)</p>
              <p className="text-gray-600">用途に応じて最適なモデルをお選びください。推奨モデルはコストパフォーマンスのバランスが優れています。</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};