# thip
[![Build Status](https://travis-ci.org/hoto17296/thip.svg)](https://travis-ci.org/hoto17296/thip)

Ultra-Thin, Dependency-Free, Promise-Based HTTP request client.

## Features
- Ultra thin, and lightweight
- Dependency free
- Promise based
- Only supports Node.js (>= 6), not supports browser
- Supports HTTPS
- Follows redirect by default

## Install
``` sh
npm install thip
```

## Usage
### thip(options[, data])
- `options` \<object\>|\<string\> - Any options not included below will be passed to [http.request(options)][http.request].
  - `url` \<string\> - If you specified this option, parse the url and merged to other options.
  - `followRedirect` \<boolean\> - Follow HTTP 3xx responses as redirects. Defaults to `true`.
  - `maxRedirects` \<number\> - The maximum number of redirects to follow. Defaults to `10`.
- data \<string\>|\<buffer\> - This will be passed to [request.write(chunk)][request.write].

[http.request]: https://nodejs.org/api/http.html#http_http_request_options_callback
[request.write]: https://nodejs.org/api/http.html#http_request_write_chunk_encoding_callback

This function returns `Promise` object which resolves response object.
The response object is an instance of [http.IncomingMessage][http.IncomingMessage], but contains `body` property.

[http.IncomingMessage]: https://nodejs.org/api/http.html#http_class_http_incomingmessage

``` js
const thip = require('thip');

thip('http://example.com/').then((res) => {
  console.log(res.body);
});
```

``` js
const thip = require('thip');
const querystring = require('querystring');

const data = querystring.stringify({
  'msg': 'Hello World!',
});

const options = {
  method: 'POST',
  url: 'http://example.com/message',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(data),
  },
};

thip(options, data).then((res) => {
  console.log('Post successful!');
});
```

### thip.get(options[, data])
- `options.method` assigns `"GET"` by default.
- If `data` is \<object\>, the data is encoded as URL query.

``` js
thip.get('http://example.com/', { foo: 'bar' });
```

This is same as below.

``` js
thip('http://example.com/?foo=bar');
```

### thip.post(options[, data])
- `options.method` assigns `"POST"` by default.
- If `data` is \<object\>, the data is encoded as `x-www-form-urlencoded`.

``` js
const thip = require('thip');

thip.post('http://example.com/', { foo: 'bar' });
```

This is same as below.

``` js
const thip = require('thip');
const querystring = require('querystring');

const data = querystring.stringify({
  'foo': 'bar',
});

const options = {
  method: 'POST',
  url: 'http://example.com/',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(data),
  },
};

thip(options, data);
```

## Error Handling
If HTTP response status code is 4xx or 5xx, the promise is rejected with HttpClientError or HttpServerError.

``` js
thip('http://example.com/not_found_path').catch((error, res) => {
  console.log(error.name); // "HttpClientError"
  console.log(res.statusCode); // 404
})
```
