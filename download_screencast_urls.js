var fs = require('fs');

var links = [],
    videos = [];

var casper = require('casper').create({
  pageSettings: {
    webSecurityEnabled: false
  }
});

casper.start('https://www.codeschool.com/users/sign_in', function() {
  this.fillSelectors('#sign-in-form > form', {
    'input#user_login': 'USERNAME',
    'input#user_password': 'PASSWORD'
  }, true);
  this.waitForSelector("a[href='/users/sign_out']");
});

casper.thenOpen('https://www.codeschool.com/screencasts/all', function() {
  links = this.evaluate(function() {
    var elements = __utils__.findAll('.collection-item a');
    return elements.map(function(e) {
      return window.location.origin + e.getAttribute('href');
    });
  });
});

casper.then(function() {
  this.eachThen(links, function(response) {
    this.echo(response.data);
    var title = response.data.match(/screencasts\/.*$/g)[0].split("/")[1];
    fs.makeDirectory('screencasts/'+title);
    this.thenOpen(response.data, function(response) {
      var urls = this.evaluate(function() {
        var elements = __utils__.findAll('source[data-quality=hd]');
        return elements.map(function(e) {
          return e.getAttribute('src');
        });
      });
      fs.write('screencasts/'+title+'/urls.txt', urls.join('\n')+'\n');
    });
  });
});

casper.run(function() {
  this.echo('Done.').exit();
});
