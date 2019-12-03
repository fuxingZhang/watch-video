const http = require('http');
const fs = require('fs');
const etag = require('etag')
const contentRange = require('./contentRange');
const parseRange = require('./parseRange');
const hostname = '0.0.0.0';
const port = 3000;
const stat = fs.statSync('./public/zfx.mp4');
const size = stat.size;

const server = http.createServer((req, res) => {
  console.log(req.url)
  switch (req.url) {
    case '/':
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(fs.readFileSync('./public/index.html'))
      break;
    case '/zfx.mp4':
      const range = parseRange(req.headers.range, size);
      const { start, end } = range;
      res.statusCode = 206
      res.setHeader('accept-ranges', 'bytes');
      res.setHeader('content-type', 'video/mp4');
      res.setHeader('cache-control', 'public, max-age=0');
      res.setHeader('last-modified', stat.mtime.toUTCString());
      res.setHeader('ETag', etag(stat))
      res.setHeader('Content-Range', contentRange(size, range));
      res.setHeader('Content-Length', end - start + 1)
      const stream = fs.createReadStream('./public/zfx.mp4', {
        start,
        end
      });
      stream.on('error', err => {
        stream.destroy();
      });
      stream.pipe(res);
      break;
    default:
      res.end('hi');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});