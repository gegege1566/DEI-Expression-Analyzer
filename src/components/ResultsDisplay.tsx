import React, { useState } from 'react';
import { AnalysisResult, Persona } from '../types';
import { Tachometer } from './Tachometer';
import { PersonaModal } from './PersonaModal';
import { AlertTriangle } from 'lucide-react';
import { getPersonaStyle } from '../utils/personaUtils';

interface ResultsDisplayProps {
  results: AnalysisResult;
  apiKey?: string;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, apiKey }) => {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePersonaClick = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPersona(null);
  };

  return (
    <div className="space-y-6">
      {/* タコメーター表示エリア */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">DEI Expression Analysis Results</h2>
        
        <div className="flex justify-center">
          <Tachometer 
            okPercentage={results.okPercentage}
            ngPercentage={results.ngPercentage}
            grayPercentage={results.grayPercentage}
            okCount={results.okCount}
            ngCount={results.ngCount}
            grayCount={results.grayCount}
            totalCount={results.totalPersonas}
          />
        </div>
      </div>

      {/* NGペルソナカード表示エリア */}
      {results.ngCount > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-amber-500" size={24} />
            NG判定をしたペルソナの意見
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.topNGPersonas.map((result, index) => {
              const personaStyle = getPersonaStyle(result.persona.id);
              const IconComponent = personaStyle.IconComponent;
              
              return (
                <div 
                  key={index} 
                  className={`${personaStyle.backgroundColor} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105`}
                  onClick={() => handlePersonaClick(result.persona)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 ${personaStyle.iconBackground} rounded-full flex items-center justify-center`}>
                        <IconComponent size={24} />
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="mb-3">
                        <h4 className={`font-semibold text-lg ${personaStyle.textColor} hover:underline truncate`}>
                          {result.persona.name}さん
                        </h4>
                        <div className={`text-sm ${personaStyle.textColor} opacity-75 flex flex-wrap gap-2 mb-1`}>
                          <span>{result.persona.age}歳</span>
                          <span className="truncate">{result.persona.occupation}</span>
                        </div>
                        <div className={`text-sm ${personaStyle.textColor} font-semibold leading-relaxed`}>
                          {result.persona.characteristics}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border-l-4 border-red-400">
                        <p className="text-gray-800 leading-relaxed text-sm">
                          {result.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {results.ngCount > results.topNGPersonas.length && (
            <div className="mt-6 text-center text-gray-600 bg-gray-50 rounded-lg p-4">
              <p className="font-medium">
                他に{results.ngCount - results.topNGPersonas.length}人のペルソナもNG判定をしています
              </p>
              <p className="text-sm text-gray-500 mt-1">
                カードをクリックすると詳細なペルソナ情報が確認できます
              </p>
            </div>
          )}
        </div>
      )}

      {/* グレーペルソナカード表示エリア */}
      {results.grayCount > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-gray-500" size={24} />
            グレー判定をしたペルソナの意見
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.topGrayPersonas.map((result, index) => {
              const personaStyle = getPersonaStyle(result.persona.id);
              const IconComponent = personaStyle.IconComponent;
              
              return (
                <div 
                  key={index} 
                  className="bg-gray-50 border border-gray-300 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                  onClick={() => handlePersonaClick(result.persona)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <IconComponent size={24} className="text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="mb-3">
                        <h4 className="font-semibold text-lg text-gray-800 hover:underline truncate">
                          {result.persona.name}さん
                        </h4>
                        <div className="text-sm text-gray-600 flex flex-wrap gap-2 mb-1">
                          <span>{result.persona.age}歳</span>
                          <span className="truncate">{result.persona.occupation}</span>
                        </div>
                        <div className="text-sm text-gray-700 font-semibold leading-relaxed">
                          {result.persona.characteristics}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border-l-4 border-gray-400">
                        <p className="text-gray-800 leading-relaxed text-sm">
                          {result.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {results.grayCount > results.topGrayPersonas.length && (
            <div className="mt-6 text-center text-gray-600 bg-gray-50 rounded-lg p-4">
              <p className="font-medium">
                他に{results.grayCount - results.topGrayPersonas.length}人のペルソナもグレー判定をしています
              </p>
              <p className="text-sm text-gray-500 mt-1">
                カードをクリックすると詳細なペルソナ情報が確認できます
              </p>
            </div>
          )}
        </div>
      )}

      {selectedPersona && (
        <PersonaModal
          persona={selectedPersona}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          initialResponse={results.topNGPersonas.find(r => r.persona.id === selectedPersona.id) || 
                          results.topGrayPersonas?.find(r => r.persona.id === selectedPersona.id)}
          apiKey={apiKey}
        />
      )}
    </div>
  );
};