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
