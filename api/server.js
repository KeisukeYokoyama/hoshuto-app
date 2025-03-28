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
  // 現在のUTC日時を取得
  const now = new Date();
  
  // UTCの今日の0時を設定
  const todayUTC = new Date(now);
  todayUTC.setUTCHours(0, 0, 0, 0);
  
  // UTCの明日の0時を設定
  const tomorrowUTC = new Date(todayUTC);
  tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);
  
  const scores = db.scores.filter(score => {
    const scoreDate = new Date(score.date);
    return scoreDate >= todayUTC && scoreDate < tomorrowUTC;
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
