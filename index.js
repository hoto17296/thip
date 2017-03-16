const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

const MAX_REDIRECT_COUNT = 10;

function parseOpts(opts) {
  if (typeof opts === 'string') opts = { url: opts };
  if (typeof opts !== 'object') throw new TypeError('Options should be srting or object.');
  if (opts.url) {
    opts = Object.assign({}, opts, url.parse(opts.url));
    delete opts.url;
  }
  return opts;
}

function thip(opts, data) {
  return new Promise((resolve, reject) => {
    opts = parseOpts(opts);
    if (opts.followRedirect === undefined) opts.followRedirect = true;

    const req = (opts.protocol === 'https:' ? https : http).request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (opts.followRedirect && res.headers.location) {
          const redirectUrl = res.headers.location;
          const redirectOpts = Object.assign({}, opts, url.parse(redirectUrl));
          if (!redirectOpts._thip) redirectOpts._thip = { redirect: { count: 0, stack: [] } };
          if (redirectOpts._thip.redirect.count >= MAX_REDIRECT_COUNT || redirectOpts._thip.redirect.stack.indexOf(redirectUrl) !== -1) {
            return reject(new Error('Redirect loop detected.'));
          }
          redirectOpts._thip.redirect.count++;
          redirectOpts._thip.redirect.stack.push(redirectUrl);
          thip(redirectOpts, data).then(resolve).catch(reject);
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

thip.get = function(opts, data) {
  opts = parseOpts(opts);
  if (!opts.method) opts.method = 'GET';
  if (typeof data === 'object') {
    opts.query = Object.assign({}, querystring.parse(opts.query), data);
    delete opts.search;
    opts.url = url.format(opts);
  }
  return thip(opts);
};

thip.post = function(opts, data) {
  opts = parseOpts(opts);
  if (!opts.method) opts.method = 'POST';
  if (typeof data === 'object') {
    data = querystring.stringify(data);
    if (!opts.headers) opts.headers = {};
    opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    opts.headers['Content-Length'] = Buffer.byteLength(data);
  }
  return thip(opts, data);
};

module.exports = thip;
