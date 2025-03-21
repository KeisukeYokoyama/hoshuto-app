import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// スコアデータを保存するJSONファイルのパス
const SCORES_FILE = path.join(process.cwd(), 'data', 'scores.json');

// ファイルとディレクトリの存在確認と作成
function ensureFileExists() {
  const dir = path.dirname(SCORES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
  }
}

// スコアを取得するAPI
export async function GET() {
  ensureFileExists();
  
  try {
    const scores = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
    return NextResponse.json(scores);
  } catch (error) {
    console.error('スコア読み込みエラー:', error);
    return NextResponse.json({ error: 'スコアの読み込みに失敗しました' }, { status: 500 });
  }
}

// スコアを保存するAPI
export async function POST(request: Request) {
  ensureFileExists();
  
  try {
    const body = await request.json();
    const { playerName, score } = body;
    
    if (!playerName || typeof score !== 'number') {
      return NextResponse.json(
        { error: '無効なデータです' }, 
        { status: 400 }
      );
    }
    
    // 現在のスコアを読み込む
    const scores = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
    
    // 新しいスコアを追加
    const newScore = {
      id: Date.now(),
      playerName,
      score,
      timestamp: new Date().toISOString()
    };
    
    scores.push(newScore);
    
    // スコア順にソート（高いスコア順）
    scores.sort((a: any, b: any) => b.score - a.score);
    
    // 上位10件だけ保持
    const topScores = scores.slice(0, 10);
    
    // ファイルに書き込む
    fs.writeFileSync(SCORES_FILE, JSON.stringify(topScores, null, 2));
    
    return NextResponse.json({ success: true, rank: scores.findIndex((s: any) => s.id === newScore.id) + 1 });
  } catch (error) {
    console.error('スコア保存エラー:', error);
    return NextResponse.json({ error: 'スコアの保存に失敗しました' }, { status: 500 });
  }
}
