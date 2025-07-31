// ペルソナのビジュアル表現用ユーティリティ

import { User, Heart, Star, Circle, Square, Triangle, Smile, Coffee, Book } from 'lucide-react';

// 落ち着いた背景色（主張しすぎない色）
const BACKGROUND_COLORS = [
  'bg-slate-50 border-slate-200',
  'bg-gray-50 border-gray-200', 
  'bg-zinc-50 border-zinc-200',
  'bg-neutral-50 border-neutral-200',
  'bg-stone-50 border-stone-200',
  'bg-amber-50 border-amber-200',
  'bg-orange-50 border-orange-200',
  'bg-lime-50 border-lime-200',
  'bg-emerald-50 border-emerald-200',
  'bg-teal-50 border-teal-200',
  'bg-cyan-50 border-cyan-200',
  'bg-sky-50 border-sky-200',
  'bg-blue-50 border-blue-200',
  'bg-indigo-50 border-indigo-200',
  'bg-violet-50 border-violet-200',
  'bg-purple-50 border-purple-200',
  'bg-fuchsia-50 border-fuchsia-200',
  'bg-pink-50 border-pink-200',
  'bg-rose-50 border-rose-200'
];

// 対応するアイコン背景色
const ICON_BACKGROUND_COLORS = [
  'bg-slate-100 text-slate-600',
  'bg-gray-100 text-gray-600',
  'bg-zinc-100 text-zinc-600', 
  'bg-neutral-100 text-neutral-600',
  'bg-stone-100 text-stone-600',
  'bg-amber-100 text-amber-600',
  'bg-orange-100 text-orange-600',
  'bg-lime-100 text-lime-600',
  'bg-emerald-100 text-emerald-600',
  'bg-teal-100 text-teal-600',
  'bg-cyan-100 text-cyan-600',
  'bg-sky-100 text-sky-600',
  'bg-blue-100 text-blue-600',
  'bg-indigo-100 text-indigo-600',
  'bg-violet-100 text-violet-600',
  'bg-purple-100 text-purple-600',
  'bg-fuchsia-100 text-fuchsia-600',
  'bg-pink-100 text-pink-600',
  'bg-rose-100 text-rose-600'
];

// 対応するテキスト色
const TEXT_COLORS = [
  'text-slate-800',
  'text-gray-800',
  'text-zinc-800',
  'text-neutral-800', 
  'text-stone-800',
  'text-amber-800',
  'text-orange-800',
  'text-lime-800',
  'text-emerald-800',
  'text-teal-800',
  'text-cyan-800',
  'text-sky-800',
  'text-blue-800',
  'text-indigo-800',
  'text-violet-800',
  'text-purple-800',
  'text-fuchsia-800',
  'text-pink-800',
  'text-rose-800'
];

// アイコンコンポーネント配列
const ICONS = [
  User, Heart, Star, Circle, Square, Triangle, Smile, Coffee, Book
];

// ペルソナIDベースの決定論的ランダム生成
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return Math.abs(hash);
}

// ペルソナの色とアイコンを取得
export function getPersonaStyle(personaId: string) {
  const seed = seededRandom(personaId);
  const colorIndex = seed % BACKGROUND_COLORS.length;
  const iconIndex = seed % ICONS.length;
  
  return {
    backgroundColor: BACKGROUND_COLORS[colorIndex],
    iconBackground: ICON_BACKGROUND_COLORS[colorIndex], 
    textColor: TEXT_COLORS[colorIndex],
    IconComponent: ICONS[iconIndex]
  };
}