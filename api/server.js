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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const scores = db.scores.filter(score => {
    const scoreDate = new Date(score.date);
    return scoreDate >= today;
  });
  
  res.json(scores.sort((a, b) => b.score - a.score).slice(0, 10));
});

server.get('/api/scores/weekly', (req, res) => {
  const weekAgo = new Date();
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
