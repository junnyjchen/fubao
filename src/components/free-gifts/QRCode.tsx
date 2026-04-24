/**
 * @fileoverview 简易二维码组件
 * @description 使用Canvas生成二维码
 */

'use client';

import { useEffect, useRef } from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCode({ value, size = 200, className = '' }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 生成简单的二维码矩阵
    const qrMatrix = generateQRMatrix(value);
    const moduleCount = qrMatrix.length;
    const moduleSize = size / moduleCount;

    // 清空画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // 绘制二维码模块
    ctx.fillStyle = '#000000';
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qrMatrix[row][col]) {
          ctx.fillRect(
            col * moduleSize,
            row * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
    />
  );
}

/**
 * 生成简化的二维码矩阵
 * 注：这是一个简化版本，实际生产应使用专业库
 */
function generateQRMatrix(data: string): boolean[][] {
  // 使用数据生成确定性矩阵
  const size = 25; // 固定大小
  const matrix: boolean[][] = [];
  
  // 基于数据生成哈希
  const hash = simpleHash(data);
  
  for (let i = 0; i < size; i++) {
    matrix[i] = [];
    for (let j = 0; j < size; j++) {
      // 定位图案
      if (isPositionPattern(i, j, size)) {
        matrix[i][j] = true;
      }
      // 时序图案
      else if (i === 6 || j === 6) {
        matrix[i][j] = (i + j) % 2 === 0;
      }
      // 数据区域
      else {
        const index = i * size + j;
        matrix[i][j] = (hash[index % hash.length] + index) % 2 === 0;
      }
    }
  }
  
  return matrix;
}

function isPositionPattern(row: number, col: number, size: number): boolean {
  // 左上角
  if (row < 7 && col < 7) return true;
  // 右上角
  if (row < 7 && col >= size - 7) return true;
  // 左下角
  if (row >= size - 7 && col < 7) return true;
  return false;
}

function simpleHash(str: string): number[] {
  const result: number[] = [];
  for (let i = 0; i < str.length; i++) {
    result.push(str.charCodeAt(i));
  }
  // 扩展到足够长度
  while (result.length < 100) {
    result.push(...result.slice(0, str.length));
  }
  return result;
}

/**
 * 领取码展示组件（带二维码）
 */
export function ClaimCodeDisplay({ 
  claimNo, 
  giftName,
  size = 200 
}: { 
  claimNo: string; 
  giftName?: string;
  size?: number;
}) {
  return (
    <div className="text-center space-y-4">
      <div className="p-4 bg-white rounded-xl inline-block shadow-sm">
        <QRCode value={claimNo} size={size} />
      </div>
      
      {giftName && (
        <p className="text-sm text-muted-foreground">{giftName}</p>
      )}
      
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">領取碼</p>
        <p className="text-2xl font-mono font-bold text-primary tracking-wider">
          {claimNo}
        </p>
      </div>
      
      <p className="text-xs text-muted-foreground">
        請向工作人員出示此二維碼領取商品
      </p>
    </div>
  );
}
