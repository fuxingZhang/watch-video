const http = require('http');
const fs = require('fs');
const contentRange = require('./contentRange');
const parseRange = require('./parseRange');
const hostname = '0.0.0.0';
const port = 3000;
const size = fs.statSync('./public/zfx.mp4').size;

const server = http.createServer((req, res) => {
  console.log(req.url)
  switch (req.url) {
    case '/':
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(fs.readFileSync('./public/index.html'))
      break;
    case '/zfx.mp4':
      res.setHeader('Content-Length', size)
      const range = parseRange(req.headers.range, size);
      res.statusCode = 206
      res.setHeader('Content-Range', contentRange(size, range));
      fs.createReadStream('./public/zfx.mp4', {
        start: range.start,
        end: range.end
      }).pipe(res);
      break;
    default:
      res.end('hi');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});