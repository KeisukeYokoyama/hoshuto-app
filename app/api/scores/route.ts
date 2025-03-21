import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

interface Score {
  id: string;
  created_at: string;
  player_name: string;
  score: number;
}

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// スコアを取得するAPI
export async function GET() {
  try {
    // 上位10件のスコアを取得
    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);

    if (error) throw error;

    // フロントエンド用にデータを整形
    const formattedScores = scores.map((score: Score, index: number) => ({
      id: index + 1,
      playerName: score.player_name,
      score: score.score
    }));

    return NextResponse.json(formattedScores);
  } catch (error) {
    console.error('スコア取得エラー:', error);
    return NextResponse.json({ error: 'スコア取得に失敗しました' }, { status: 500 });
  }
}

// スコアを保存するAPI
export async function POST(request: Request) {
  try {
    const { playerName, score } = await request.json();
    
    if (!playerName || typeof score !== 'number') {
      return NextResponse.json(
        { error: '無効なデータです' }, 
        { status: 400 }
      );
    }

    // スコアを保存
    const { error: insertError } = await supabase
      .from('scores')
      .insert([{ player_name: playerName, score }]);

    if (insertError) throw insertError;

    // ランクを計算（自分より高いスコアの数 + 1）
    const { count } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .gt('score', score);

    const rank = (count || 0) + 1;

    return NextResponse.json({ 
      success: true, 
      rank
    });
  } catch (error) {
    console.error('スコア保存エラー:', error);
    return NextResponse.json({ error: 'スコアの保存に失敗しました' }, { status: 500 });
  }
}
