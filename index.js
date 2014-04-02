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

    var app = connect()
      // .use(connect.logger('dev'))
      .use(connect.bodyParser())
      .use(function(req, res) {

        // TODO: fix this dirty hack
        var content = '';
        process.stdout.write = function (data) {
          content += data;
          return;
        };

        var tests = req.body.tests,
            solution = req.body.solution;

        var p1 = fs.writeFile('index.html', solution),
            p2 = fs.writeFile('tests.js', tests);

        q.all([p1, p2]).then(function () {
          karma.runner.run(options, function (exitCode) {
            res.end(content);
          });
        });
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
