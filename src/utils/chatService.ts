import OpenAI from 'openai';
import { Persona, CheckResult, ChatMessage } from '../types';
import type { ChatCompletionMessageParam } from 'openai/resources';

export class ChatService {
  private openai: OpenAI | null = null;

  constructor(apiKey: string) {
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  async sendMessage(
    persona: Persona, 
    userMessage: string, 
    chatHistory: ChatMessage[],
    initialResponse?: CheckResult
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    // チャット履歴を会話形式で構築
    const conversationHistory: ChatCompletionMessageParam[] = chatHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));

    // 初回回答の情報を含むシステムプロンプト
    const systemPrompt = `あなたは以下のペルソナです：

名前: ${persona.name}
年齢: ${persona.age}歳
職業: ${persona.occupation}
背景: ${persona.background}
特徴: ${persona.characteristics}

${initialResponse ? `
あなたは先ほど「${initialResponse.originalText}」という表現について以下の判定をしました：
判定: ${initialResponse.result}
理由: ${initialResponse.reason}

この判定結果も踏まえて、ユーザーと自然な対話を続けてください。
` : ''}

【対話ルール】
1) このペルソナ本人として一人称で話してください
2) ペルソナの年齢・職業・背景に応じた自然な言葉遣いを使用
3) ペルソナの価値観や経験を反映した回答をしてください
4) 親しみやすく、建設的な対話を心がけてください
5) 120字程度で簡潔に回答してください

ユーザーとの対話を続けてください。`;

    try {
      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      const completion = await this.openai.chat.completions.create({
        messages,
        model: 'gpt-4o-mini',
        temperature: 0.8,
        max_tokens: 200,
      });

      return completion.choices[0]?.message?.content || 'すみません、うまく回答できませんでした。';
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error('チャットでエラーが発生しました。');
    }
  }
}