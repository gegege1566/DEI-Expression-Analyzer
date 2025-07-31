import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface TachometerProps {
  okPercentage: number;
  ngPercentage: number;
  grayPercentage: number;
  okCount: number;
  ngCount: number;
  grayCount: number;
  totalCount: number;
}

export const Tachometer: React.FC<TachometerProps> = ({ 
  okPercentage, 
  ngPercentage, 
  grayPercentage,
  okCount, 
  ngCount, 
  grayCount,
  totalCount 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // SVGクリア
    d3.select(svgRef.current).selectAll("*").remove();
    
    const width = 280;
    const height = 200; // 上マージンを小さく調整
    const centerX = width / 2;
    const centerY = height - 20;
    const radius = 150; // 1.5倍に拡大 (100 * 1.5)
    const strokeWidth = 20;
    
    const svg = d3.select(svgRef.current);
    
    // 安全な計算（ゼロ除算対策）
    const safeTotal = totalCount || 1;
    const ngRatio = ngCount / safeTotal;
    const grayRatio = grayCount / safeTotal;
    // const okRatio = okCount / safeTotal;
    
    // 半円のスケール（-90度から+90度）
    const angleScale = d3.scaleLinear()
      .domain([0, 1])
      .range([-Math.PI/2, Math.PI/2]);
    
    // 弧生成器
    const arc = d3.arc()
      .innerRadius(radius - strokeWidth/2)
      .outerRadius(radius + strokeWidth/2)
      .cornerRadius(10);
    
    // 背景弧
    svg.append("path")
      .datum({
        innerRadius: 60,
        outerRadius: 90,
        startAngle: -Math.PI/2,
        endAngle: Math.PI/2
      })
      .attr("d", (d) => arc(d) || '')
      .attr("transform", `translate(${centerX}, ${centerY})`)
      .attr("fill", "#e5e7eb");
    
    // NG弧（赤）- 左端から
    if (ngCount > 0) {
      svg.append("path")
        .datum({
          innerRadius: 60,
          outerRadius: 90,
          startAngle: -Math.PI/2,
          endAngle: angleScale(ngRatio) 
        })
        .attr("d", (d) => arc(d) || '')
        .attr("transform", `translate(${centerX}, ${centerY})`)
        .attr("fill", "#ef4444")
        .style("transition", "all 0.8s ease-in-out");
    }
    
    // GRAY弧（グレー）- NGの続きから
    if (grayCount > 0) {
      svg.append("path")
        .datum({
          innerRadius: 60,
          outerRadius: 90,
          startAngle: angleScale(ngRatio),
          endAngle: angleScale(ngRatio + grayRatio)
        })
        .attr("d", (d) => arc(d) || '')
        .attr("transform", `translate(${centerX}, ${centerY})`)
        .attr("fill", "#6b7280")
        .style("transition", "all 0.8s ease-in-out");
    }
    
    // OK弧（緑）- 最後の部分
    if (okCount > 0) {
      svg.append("path")
        .datum({
          innerRadius: 60,
          outerRadius: 90,
          startAngle: angleScale(ngRatio + grayRatio),
          endAngle: Math.PI/2
        })
        .attr("d", (d) => arc(d) || '')
        .attr("transform", `translate(${centerX}, ${centerY})`)
        .attr("fill", "#10b981")
        .style("transition", "all 0.8s ease-in-out");
    }
    
  }, [ngCount, grayCount, okCount, totalCount, ngPercentage, grayPercentage, okPercentage]);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg ref={svgRef} width="280" height="200" className="overflow-visible" />
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            <div className="text-5xl font-bold text-red-600 mb-2">{ngPercentage}%</div>
            <div className="text-lg text-gray-700 font-medium">NG判定</div>
            <div className="text-sm text-gray-500 mt-1">{ngCount} / {totalCount}人</div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-wrap justify-center gap-6">
        <div className="flex items-center">
          <div className="w-5 h-5 bg-red-500 rounded-full mr-3"></div>
          <span className="text-xl font-semibold text-red-700">
            NG {ngPercentage}% ({ngCount}人)
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-5 h-5 bg-gray-500 rounded-full mr-3"></div>
          <span className="text-xl font-semibold text-gray-700">
            グレー {grayPercentage}% ({grayCount}人)
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-5 h-5 bg-green-500 rounded-full mr-3"></div>
          <span className="text-xl font-semibold text-green-700">
            OK {okPercentage}% ({okCount}人)
          </span>
        </div>
      </div>
    </div>
  );
};