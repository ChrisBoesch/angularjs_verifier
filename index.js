var fs      = require('fs'),
    q       = require('q'),
    chalk   = require('chalk'),
    program = require('commander'),
    connect = require('connect'),
    karma   = require('karma');

var conf = require('./package.json');

program
   .version(conf.version);

program
  .command('server <port>')
  .description('AngularJS Verifier Server')
  .action(function(port){

    var appPort = 3000;

    var appServer = connect()
      // .use(connect.logger('dev'))
      .use(connect.static(process.cwd()), {index: 'index.html'})
      .listen(appPort);

    var options = {};
    options.basePath = process.cwd() + '/';
    options.files = ['tests.js'];

    options.reporters = ['json'];
    options.singleRun = false;

    options.proxies = {
        '/': 'http://localhost:' + appPort + '/'
    };

    options.urlRoot = '/__karma__/';

    options.configFile = __dirname + '/karma.conf.js';

    karma.server.start(options);

    // The API Server
    var app = connect()
      // .use(connect.logger('dev'))
      .use(connect.urlencoded())
      .use(connect.json())
      .use(function(req, res) {

        var json = req.body.jsonrequest;
        // application/x-www-form-urlencoded
        if (typeof json === 'string') {
          json = JSON.parse(json);
        }

        if (json) {
          // TODO: fix this dirty hack
          var jsonContent = '{}';
          var origialStdWrite = process.stdout.write;
          process.stdout.write = function (data) {
            // Only catch JSON
            if (data && data[0] === '{') {
              jsonContent = data;
            }
            return;
          };

          var p1 = fs.writeFile('index.html', json.solution),
              p2 = fs.writeFile('tests.js', json.tests);

          q.all([p1, p2]).then(function () {
            karma.runner.run(options, function (exitCode) {
              // Revert back the hack
              process.stdout.write = origialStdWrite;

              var karmaJson = JSON.parse(jsonContent);

              if (karmaJson.summary) {

                var results = karmaJson.result[Object.keys(karmaJson.result)[0]];

                results = results.map(function (item) {
                  return {
                    call: item.description,
                    expected: item.success ? '' : item.log[0],
                    received: item.success ? '' : item.log[1],
                    correct: item.success
                  }
                });

                var answer = {
                  solved: !!!karmaJson.summary.error,
                  results: results,
                  printed: ""
                };

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(answer));
              } else {
                res.end('Please wait for the server to start!');
              }
            });
          });
        } else {
          res.end('jsonrequest not found', 400);
        }

      })
      .listen(port);
  });

program
  .command('*')
  .description('AngularJS Verifier')
  .action(function(appFile, testFile){

    var port = 3000;

    var app = connect()
      // .use(connect.logger('dev'))
      .use(connect.static(process.cwd()), {index: appFile})
      .listen(port);

    var options = {};
    options.basePath = process.cwd() + '/';
    options.files = [];
    options.files.push(testFile);

    options.singleRun = true;

    options.proxies = {
        '/': 'http://localhost:' + port + '/'
    };

    options.urlRoot = '/__karma__/';

    options.configFile = __dirname + '/karma.conf.js';

    karma.server.start(options, function (exitCode) {
      process.exit(exitCode);
    });
  });

 program.parse(process.argv);
