import { CheckResult, AnalysisResult } from '../types';

export function analyzeResults(results: CheckResult[]): AnalysisResult {
  const totalPersonas = results.length;
  const okCount = results.filter(r => r.result === 'OK').length;
  const ngCount = results.filter(r => r.result === 'NG').length;
  const grayCount = results.filter(r => r.result === 'GRAY').length;
  
  const okPercentage = Math.round((okCount / totalPersonas) * 100);
  const ngPercentage = Math.round((ngCount / totalPersonas) * 100);
  const grayPercentage = Math.round((grayCount / totalPersonas) * 100);

  // NGの結果をランダムにシャッフルして最大6個取得
  const ngResults = results.filter(r => r.result === 'NG');
  const shuffledNgResults = [...ngResults].sort(() => Math.random() - 0.5);
  const topNGPersonas = shuffledNgResults.slice(0, 6);
  
  // GRAYの結果をランダムにシャッフルして最大6個取得
  const grayResults = results.filter(r => r.result === 'GRAY');
  const shuffledGrayResults = [...grayResults].sort(() => Math.random() - 0.5);
  const topGrayPersonas = shuffledGrayResults.slice(0, 6);

  return {
    totalPersonas,
    okCount,
    ngCount,
    grayCount,
    okPercentage,
    ngPercentage,
    grayPercentage,
    results,
    topNGPersonas,
    topGrayPersonas
  };
}