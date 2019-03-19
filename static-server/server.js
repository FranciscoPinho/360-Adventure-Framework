const connect = require('connect');

const serveStatic = require('serve-static');

connect().use(serveStatic('./')).listen(8080, () => {
  console.log('Please run at same directory as index.html');
  console.log('Server running on localhost:8080...');
});
