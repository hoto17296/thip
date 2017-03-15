const http = require('http');
const https = require('https');
const url = require('url');

const MAX_REDIRECT_COUNT = 10;

function thip(opts, data) {
  return new Promise((resolve, reject) => {
    if (typeof opts === 'string') opts = url.parse(opts);
    else if (typeof opts !== 'object') throw new TypeError('Options should be srting or object.');
    else if (opts.url) Object.assign(opts, url.parse(opts.url));

    if (opts.followRedirect === undefined) opts.followRedirect = true;

    const req = (opts.protocol === 'https:' ? https : http).request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (opts.followRedirect && res.headers.location) {
          if (!opts._thip) opts._thip = { redirect: { count: 0, stack: [] } };
          if (opts._thip.redirect.count >= MAX_REDIRECT_COUNT || opts._thip.redirect.stack.indexOf(res.headers.location) !== -1) {
            throw new Error('Redirect loop detected.');
          }
          opts._thip.redirect.count++;
          opts._thip.redirect.stack.push(url.format(opts));
          opts.url = res.headers.location;
          thip(opts, data).then(resolve).catch(reject);
        }
        else {
          res.body = body;
          resolve(res);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

module.exports = thip;
