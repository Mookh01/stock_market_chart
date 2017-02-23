var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 4700);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', function(req, res) {
    res.render('index');
});

var server = require('http').createServer(app);
server.listen(app.get('port'), function() {
    console.log('Express is running on port ' + app.get('port'));
});

require('./routes')(server);