// Create web server
// Load module http
var http = require('http');
// Load module fs
var fs = require('fs');
// Load module url
var url = require('url');
// Load module querystring
var querystring = require('querystring');
// Load module comments
var comments = require('./comments.js');

// Create web server
var server = http.createServer(function(req, res) {
  // Parse request url
  var urlParsed = url.parse(req.url, true);
  // Log request
  console.log('Incoming request: ' + urlParsed.pathname);
  // Get query string
  var query = urlParsed.query;
  // Get pathname
  var pathname = urlParsed.pathname;
  // Get method
  var method = req.method;

  // Check if request is for comments
  if (pathname === '/comments') {
    // Check method
    if (method === 'GET') {
      // Get comments
      comments.get(function(err, data) {
        // Check error
        if (err) {
          // Send error
          res.statusCode = 500;
          res.end('Server error');
          return;
        }
        // Send comments
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
      });
    } else if (method === 'POST') {
      // Create body
      var body = '';
      // On data
      req.on('data', function(data) {
        // Append data
        body += data;
        // Check if body is too big
        if (body.length > 1e6) {
          // Send error
          res.statusCode = 413;
          res.end('Request entity too large');
          return;
        }
      });
      // On end
      req.on('end', function() {
        // Parse body
        var params = querystring.parse(body);
        // Add comment
        comments.add(params.comment, function(err, data) {
          // Check error
          if (err) {
            // Send error
            res.statusCode = 500;
            res.end('Server error');
            return;
          }
          // Send comments
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
        });
      });
    } else {
      // Send error
      res.statusCode = 404;
      res.end('Not found');
    }
  } else {
    // Get file path
    var filePath = '.'