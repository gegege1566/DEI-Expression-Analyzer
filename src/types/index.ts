export interface Persona {
  id: string;
  name: string;
  age: number;
  gender?: string;
  occupation: string;
  background: string;
  characteristics: string;
}

export interface CheckResult {
  personaId: string;
  result: 'OK' | 'NG' | 'GRAY';
  reason: string;
  persona: Persona;
  originalText?: string; // 元のチェック対象テキスト
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'persona';
  content: string;
  timestamp: Date;
}

export interface PersonaChat {
  personaId: string;
  messages: ChatMessage[];
  initialResponse?: CheckResult;
}

export interface AnalysisResult {
  totalPersonas: number;
  okCount: number;
  ngCount: number;
  grayCount: number;
  okPercentage: number;
  ngPercentage: number;
  grayPercentage: number;
  results: CheckResult[];
  topNGPersonas: CheckResult[];
  topGrayPersonas: CheckResult[];
}