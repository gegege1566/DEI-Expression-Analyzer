import React from 'react';
import { Persona, CheckResult } from '../types';
import { X, Briefcase, Calendar, Users, Heart, Tag, BookOpen } from 'lucide-react';
import { getPersonaStyle } from '../utils/personaUtils';
import { PersonaChat } from './PersonaChat';

interface PersonaModalProps {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
  initialResponse?: CheckResult;
  apiKey?: string;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({ 
  persona, 
  isOpen, 
  onClose, 
  initialResponse, 
  apiKey 
}) => {
  if (!isOpen) return null;

  const personaStyle = getPersonaStyle(persona.id);
  const IconComponent = personaStyle.IconComponent;

  // 背景情報から詳細項目を抽出
  const backgroundLines = persona.background.split('。').filter(line => line.trim());
  
  // 人生の転機やエピソードをペルソナ個別に生成
  const generateLifeStories = (persona: Persona) => {
    const stories = [];
    
    // ペルソナIDに基づいた個別エピソード
    switch (persona.id) {
      case 'persona_001': // 彩子 - シングルマザー
        stories.push('元夫との離婚調停で「母親なんだから子どもを優先して当然」と言われた時、女性への偏見を痛感した');
        stories.push('保育園の送迎で遅刻した際、上司から「やっぱりシンママは使えない」と陰で言われているのを聞いてしまった');
        stories.push('PTA活動で「お父さんの参加が少ない」と言われ、ひとり親家庭への配慮のなさを感じた');
        stories.push('子どもが熱を出した時、職場で「また？」という顔をされる度に、社会の理解不足を実感する');
        break;
        
      case 'persona_002': // 恵理 - ワーキングマザー
        stories.push('昇進の話が出た時「子どもがいるのに大丈夫？」と上司に聞かれ、男性には絶対聞かない質問だと感じた');
        stories.push('子どもの運動会で平日開催が当たり前とされ、共働き家庭への配慮が足りないと思った');
        stories.push('ママ友から「仕事ばかりで子どもがかわいそう」と言われ、働く母親への偏見に傷ついた');
        stories.push('夫の出張は当然とされるのに、私の出張には「家族を置いて」と批判的な目で見られる');
        break;
        
      case 'persona_003': // 3番目のペルソナ用（例）
        stories.push('この職業だから○○できるでしょうと勝手に決めつけられることが多い');
        stories.push('自分の専門性を軽視される発言に遭遇した時の悔しさ');
        stories.push('周囲の期待と現実のギャップに疲れを感じる瞬間');
        stories.push('理解してもらえないもどかしさを抱えながら働いている');
        break;
        
      // 他のペルソナも同様に個別化...
      default:
        // デフォルトのエピソード（具体的なペルソナが未定義の場合）
        stories.push('自分の立場だからこそ見える社会の課題がある');
        stories.push('周囲の何気ない言葉に傷つくことがある');
        stories.push('自分らしく生きることの難しさを感じる瞬間がある');
        stories.push('理解されることの大切さを日々実感している');
    }
    
    return stories.slice(0, 4);
  };
  
  const lifeStories = generateLifeStories(persona);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-800">ペルソナ詳細情報</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* プロフィールヘッダー */}
          <div className={`${personaStyle.backgroundColor} border rounded-xl p-6 mb-6`}>
            <div className="flex items-start gap-4">
              <div className={`w-20 h-20 ${personaStyle.iconBackground} rounded-full flex items-center justify-center flex-shrink-0`}>
                <IconComponent size={40} />
              </div>
              <div className="flex-grow">
                <h3 className={`text-3xl font-bold ${personaStyle.textColor} mb-3`}>{persona.name}さん</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className={personaStyle.textColor.replace('800', '600')} />
                    <span className={`${personaStyle.textColor} font-medium`}>{persona.age}歳</span>
                  </div>
                  {persona.gender && (
                    <div className="flex items-center gap-2">
                      <Users size={16} className={personaStyle.textColor.replace('800', '600')} />
                      <span className={`${personaStyle.textColor} font-medium`}>{persona.gender}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 col-span-2">
                    <Briefcase size={16} className={personaStyle.textColor.replace('800', '600')} />
                    <span className={`${personaStyle.textColor} font-medium`}>{persona.occupation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 特徴的な属性 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Heart size={20} className="text-orange-500" />
              特徴的な属性・個性
            </h4>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 font-medium leading-relaxed text-base">
                {persona.characteristics}
              </p>
            </div>
          </div>

          {/* ペルソナの背景・経歴 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BookOpen size={20} className="text-purple-500" />
              ペルソナの背景・経歴
            </h4>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="space-y-4">
                {backgroundLines.map((line, index) => (
                  line.trim() && (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-purple-800 leading-relaxed text-base">
                        {line.trim()}。
                      </p>
                    </div>
                  )
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-purple-200">
                <p className="text-purple-700 text-sm italic">
                  これらの経験が、{persona.name}さんの価値観や表現に対する感じ方を形成しています。
                </p>
              </div>
            </div>
          </div>

          {/* 生活の中での出来事・転機 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Tag size={20} className="text-green-500" />
              生活の中での出来事・人生の転機
            </h4>
            <div className="space-y-3">
              {lifeStories.map((story, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-green-800 leading-relaxed font-medium">
                      {story}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* チャット機能 */}
          {apiKey && (
            <PersonaChat 
              persona={persona}
              initialResponse={initialResponse}
              apiKey={apiKey}
            />
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};