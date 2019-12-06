const http = require('http');
const fs = require('fs');
const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);
const etag = require('etag');
const mime = require('mime');
const contentRange = require('./contentRange');
const parseRange = require('./parseRange');
const hostname = '0.0.0.0';
const port = 3000;
const reg = /^\/([^\/]+?)$/i;

const server = http.createServer(async (req, res) => {
  try {
    const url = req.url;
    console.log({ url });
    const arr = reg.exec(url);
    // console.log(req.headers);

    if (url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(fs.readFileSync('./public/index.html'));
      return
    } else if (arr !== null) {
      const videoName = arr[1];
      const path = `./public/${videoName}`;
      const stat = await fs.promises.stat(path);
      const size = stat.size;
      const range = parseRange(req.headers.range, size);
      const { start, end } = range;
      res.statusCode = 206;
      res.setHeader('accept-ranges', 'bytes');
      res.setHeader('content-type', mime.getType(path));
      res.setHeader('cache-control', 'public, max-age=0');
      res.setHeader('last-modified', stat.mtime.toUTCString());
      res.setHeader('ETag', etag(stat));
      res.setHeader('Content-Range', contentRange(size, range));
      res.setHeader('Content-Length', end - start + 1);
      const stream = fs.createReadStream(path, {
        start,
        end
      });

      // console.log(res.getHeaders());
      await pipeline(stream, res).catch(err => {
        console.log('stream error:', err);
        stream.destroy();
      });
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('hi, i am zfx!');
    }
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(error.message);
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});