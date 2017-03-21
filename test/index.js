const thip = require('..');
const querystring = require('querystring');
const assert = require('assert');
const nock = require('nock');

describe('thip', () => {

  context('when url option is specified', () => {
    it('should parse as url', () => {
      nock('http://example.com').get('/').reply(200, 'ok');
      return thip({ url: 'http://example.com/' }).then((res) => {
        assert.equal(res.body, 'ok');
      });
    });
  });

  context('when invalid option is specified', () => {
    it('should throw error', () => {
      return thip(1).catch((err) => {
        assert.equal(err.message, 'Options should be srting or object.');
      });
    });
  });

  context('when post data is specified', () => {
    it('should send post data', () => {
      nock('http://example.com').post('/', { foo: 'bar' }).reply(200, 'ok');
      const data = querystring.stringify({ foo: 'bar' });
      const options = {
        method: 'POST',
        url: 'http://example.com/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data),
        },
      };
      return thip(options, data).then((res) => {
        assert.equal(res.body, 'ok');
      });
    });
  });

  context('when server returns HTTP 30x response', () => {
    it('should follows as redirect', () => {
      nock('http://example.com').get('/').reply(302, null, { location: 'http://example.com/login' });
      nock('http://example.com').get('/login').reply(200, 'ok');
      return thip({ url: 'http://example.com/' }).then((res) => {
        assert.equal(res.body, 'ok');
      });
    });
  });

  context('when redirect loop is occured', () => {
    it('should be detected', () => {
      nock('http://example.com').get('/').twice().reply(302, null, { location: 'http://example.com/' });
      return thip('http://example.com/').catch((err) => {
        assert.equal(err.message, 'Redirect loop detected.');
      });
    });
  });

  describe('thip.get', () => {
    context('when data is specified as object', () => {
      it('should be sent as query params', () => {
        nock('http://example.com').get('/').query({ foo: 'foo', bar: 'bar' }).reply(200, 'ok');
        return thip.get('http://example.com/?foo=foo', { bar: 'bar' }).then((res) => {
          assert.equal(res.body, 'ok');
        });
      });
    });
  });

  describe('thip.post', () => {
    context('when data is specified as object', () => {
      it('should be sent as x-www-form-urlencoded', () => {
        nock('http://example.com').post('/', { foo: 'bar' }).reply(200, 'ok');
        return thip.post('http://example.com/', { foo: 'bar' }).then((res) => {
          assert.equal(res.body, 'ok');
        });
      });
    });
  });

});
