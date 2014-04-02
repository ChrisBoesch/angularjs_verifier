// TODO: add port as passable

var chalk = require('chalk'),
    program = require('commander'),
    connect = require('connect'),
    spawn = require('child_process').spawn,
    karma = require('karma').server;

var conf = require('./package.json');

program
   .version(conf.version);

program
  .command('server')
  .description('AngularJS Verifier Server')
  .action(function(){

  });

program
  .command('*')
  .description('AngularJS Verifier')
  .action(function(appFile, testFile){

    // console.log(chalk.bgGreen.black('App File: %s'), appFile);
    // console.log(chalk.bgBlue.black('Test File: %s'), process.cwd() + '/' + testFile);
    var port = 3000;

    var app = connect()
      .use(connect.logger('dev'))
      .use(connect.static(process.cwd()), {index: appFile})
      .listen(port);

    var options = {};
    options.basePath = process.cwd() + '/';
    options.files = [];
    options.files.push(testFile);

    options.proxies = {
        '/': 'http://localhost:' + port + '/'
    };

    options.urlRoot = '/__karma__/';

    options.configFile = __dirname + '/karma.conf.js';

    karma.start(options);
  });

 program.parse(process.argv);
