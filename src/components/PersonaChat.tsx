import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { Persona, CheckResult, ChatMessage } from '../types';
import { ChatService } from '../utils/chatService';
import { getPersonaStyle } from '../utils/personaUtils';

interface PersonaChatProps {
  persona: Persona;
  initialResponse?: CheckResult;
  apiKey: string;
}

export const PersonaChat: React.FC<PersonaChatProps> = ({ 
  persona, 
  initialResponse, 
  apiKey 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatService] = useState(() => new ChatService(apiKey));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const personaStyle = getPersonaStyle(persona.id);
  const IconComponent = personaStyle.IconComponent;

  // 初回回答をチャット履歴に追加
  useEffect(() => {
    if (initialResponse && messages.length === 0) {
      const initialMessage: ChatMessage = {
        id: 'initial',
        sender: 'persona',
        content: `${initialResponse.result === 'OK' ? '✅' : initialResponse.result === 'NG' ? '❌' : '⚠️'} ${initialResponse.reason}`,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [initialResponse, messages.length]);

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(
        persona,
        inputMessage,
        messages,
        initialResponse
      );

      const personaMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'persona',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, personaMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'persona',
        content: 'すみません、エラーが発生しました。もう一度お試しください。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t pt-6 mt-6">
      <h5 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MessageCircle size={18} className="text-blue-500" />
        {persona.name}さんとチャット
      </h5>
      
      {/* チャット履歴 */}
      <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>{persona.name}さんに質問してみてください</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'bg-blue-100' 
                  : personaStyle.iconBackground
              }`}>
                {message.sender === 'user' ? (
                  <span className="text-blue-600 text-sm font-semibold">You</span>
                ) : (
                  <IconComponent size={16} />
                )}
              </div>
              <div className={`rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('ja-JP', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="flex items-start gap-2">
              <div className={`w-8 h-8 ${personaStyle.iconBackground} rounded-full flex items-center justify-center`}>
                <IconComponent size={16} />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ入力 */}
      <div className="flex gap-2">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`${persona.name}さんに質問や感想を送ってみてください...`}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={2}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send size={16} />
          送信
        </button>
      </div>
    </div>
  );
};