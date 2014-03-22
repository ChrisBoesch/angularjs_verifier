var chalk = require('chalk'),
    program = require('commander'),
    connect = require('connect'),
    http = require('http'),
    spawn = require('child_process').spawn,
    karma = require('karma').server;

var conf = require('./package.json');

program
   .version(conf.version);

program
  .command('server')
  .description('AngularJS Verifier Server')
  .action(function(){

    //karma.start();

    connect()
      .use(connect.logger('dev'))
      .use(connect.static(process.cwd()))
      .listen(3000);
  });

program
  .command('*')
  .description('AngularJS Verifier')
  .action(function(appFile, testFile){
    console.log(chalk.bgGreen.black('App File: %s'), appFile);
    console.log(chalk.bgBlue.black('Test File: %s'), testFile);
  });

 program.parse(process.argv);
