const jsonServer = require('json-server');
const server = jsonServer.create();

const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, '..', 'db.json');
const data = fs.readFileSync(filePath, "utf-8");
const db = JSON.parse(data);
const router = jsonServer.router(db);

const middlewares = jsonServer.defaults();
server.use(middlewares);

// カスタムルートを追加
server.get('/api/scores/daily', (req, res) => {
  // 1. 現在の日本時間を取得
  const now = new Date();
  const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  
  // 2. 日付文字列を取得 (YYYY-MM-DD形式)
  const targetDate = jstDate.toISOString().split('T')[0];
  
  // 3. 日付でフィルタリング（DBのデータは日本時間）
  const scores = db.scores.filter(score => {
    const scoreDate = score.date.split('T')[0];  // 日付部分のみ抽出
    return scoreDate === targetDate;
  });
  
  res.json(scores.sort((a, b) => b.score - a.score).slice(0, 10));
});

server.get('/api/scores/weekly', (req, res) => {
  const weekAgo = getJSTDate(new Date());
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  
  const scores = db.scores.filter(score => {
    const scoreDate = new Date(score.date);
    return scoreDate >= weekAgo;
  });
  
  res.json(scores.sort((a, b) => b.score - a.score).slice(0, 10));
});

server.get('/api/scores/all', (req, res) => {
  const scores = db.scores.sort((a, b) => b.score - a.score).slice(0, 10);
  res.json(scores);
});

// rewriteルールを追加
server.use(jsonServer.rewriter({
  '/api/*': '/$1'  // /api/scores -> /scores
}));

// ルーターを最後に追加
server.use(router);

// ポート番号を変更（例：3001）
const PORT = 3001;
server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
});

module.exports = server;

// 日付処理を行う関数を追加
function getJSTDate(date) {
  return new Date(date.getTime() + (9 * 60 * 60 * 1000));
}
