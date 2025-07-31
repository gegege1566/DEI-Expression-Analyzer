import OpenAI from 'openai';
import { Persona, CheckResult } from '../types';
import { LLMConfig } from '../components/LLMSettings';

export const DEFAULT_PROMPT_TEMPLATE = `あなたは以下の人物ペルソナ本人になり切って、表現について感じたことを本人らしい言葉遣いで述べてください。判定の対象は「評価対象テキスト」**のみ**です。

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

export class LLMService {
  private openai: OpenAI | null = null;
  private config: LLMConfig;

  constructor(apiKey: string, config: LLMConfig) {
    this.config = config;
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  async checkExpression(targetText: string, persona: Persona): Promise<CheckResult> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    // 全モデル共通のプロンプト
    const promptTemplate = this.config.promptTemplate || DEFAULT_PROMPT_TEMPLATE;
    const prompt = promptTemplate
      .replace('{{persona}}', `名前: ${persona.name}\n年齢: ${persona.age}歳\n職業: ${persona.occupation}\n背景: ${persona.background}`)
      .replace('{{targettext}}', targetText);

    try {
      // リージョナルモデル（o1, o3, o4シリーズ）はResponses API、その他はChat Completions API
      const isReasoningModel = this.config.model.startsWith('o1') || this.config.model.startsWith('o3') || this.config.model.startsWith('o4');
      
      let response: string = '';
      let isIncomplete = false;
      
      if (isReasoningModel) {
        // Responses API for o系モデル（十分なトークン数を最初から確保）
        const reasoningTokens = Math.max(this.config.maxTokens, 3000); // 十分なトークン数で開始
        const responsesParams: any = {
          input: [{ role: 'user', content: prompt }],
          model: this.config.model,
          max_output_tokens: reasoningTokens,
          // o系ではサンプリング系パラメータは送らない
        };

        const responsesResult = await this.openai.responses.create(responsesParams);
        
        // デバッグ用ログ - Responses APIの構造を確認
        console.log(`[${this.config.model}] Full response structure:`, responsesResult);
        
        // Responses APIでは output_text にコンテンツが格納される
        response = responsesResult.output_text || '';
        
        // 完了状態をチェック（簡潔なログのみ）
        if (responsesResult.status === "incomplete") {
          isIncomplete = true;
          const reason = responsesResult.incomplete_details?.reason;
          console.warn(`[${this.config.model}] Incomplete response with ${reasoningTokens} tokens:`, reason);
        }
        
        // デバッグ用ログ - 抽出したレスポンスを確認
        console.log(`[${this.config.model}] Extracted response:`, response, isIncomplete ? '(incomplete)' : '');
      } else {
        // Chat Completions API for 通常モデル
        const chatParams: any = {
          messages: [{ role: 'user', content: prompt }],
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          top_p: this.config.topP,
          frequency_penalty: this.config.frequencyPenalty,
          presence_penalty: this.config.presencePenalty,
        };

        const completion = await this.openai.chat.completions.create(chatParams);
        response = completion.choices[0]?.message?.content || '';
      }
      
      const [result, reason] = response.split('|');
      const trimmedResult = result?.trim();
      const trimmedReason = reason?.trim() || '';
      
      // レスポンス形式の検証
      if (!trimmedResult || !['OK', 'NG', 'GRAY'].includes(trimmedResult)) {
        console.warn(`Invalid response format from ${this.config.model}: "${response}"`);
        return {
          personaId: persona.id,
          result: 'NG',
          reason: `レスポンス形式エラー: ${response.substring(0, 100)}...`,
          persona: persona,
          originalText: targetText
        };
      }
      
      return {
        personaId: persona.id,
        result: trimmedResult as 'OK' | 'NG' | 'GRAY',
        reason: trimmedReason,
        persona: persona,
        originalText: targetText
      };
    } catch (error) {
      console.error('Error checking expression:', error);
      return {
        personaId: persona.id,
        result: 'NG',
        reason: 'APIエラーが発生しました',
        persona: persona
      };
    }
  }

  async checkAllPersonas(
    targetText: string, 
    personas: Persona[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<CheckResult[]> {
    const total = personas.length;
    let completed = 0;
    
    // 並列実行で各リクエストの完了を監視
    const promises = personas.map(async (persona) => {
      try {
        const result = await this.checkExpression(targetText, persona);
        completed++;
        if (onProgress) {
          onProgress(completed, total);
        }
        return result;
      } catch (error) {
        completed++;
        if (onProgress) {
          onProgress(completed, total);
        }
        // エラーの場合はフォールバック結果を返す
        return {
          personaId: persona.id,
          result: 'NG' as const,
          reason: 'APIエラーが発生しました',
          persona: persona,
          originalText: targetText
        };
      }
    });
    
    const results = await Promise.all(promises);
    return results;
  }

  updateConfig(config: LLMConfig): void {
    this.config = config;
  }
}