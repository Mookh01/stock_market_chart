module.exports = function(server) {
    var date = new Date();
    var today = date.toISOString().slice(0, 10);
    var month = new Date();
    month.setMonth(month.getMonth() - 6);
    var sixMonthsAgo = month.toISOString().slice(0, 10);
    var yfinance = require('yfinance');
    var io = require('socket.io')(server);
    var results = [];
    var arr = [];
    //Get numbers from yfinance. 
    io.on('connection', function(socket) {
        socket.on('add', function(text, cb) {
            if (results.indexOf(text) === -1) {
                yfinance.getHistorical(text, sixMonthsAgo, today, function(err, data) {
                    if (err) console.error(err);
                    if (data) {
                        results.push(text.toUpperCase());
                        io.sockets.emit('message', results);
                        for (var i = 0; i < data.length; i++) {
                            if (results.length == 1) {
                                arr[i] = [];
                            }
                            arr[i][0] = data[i].Date;
                            arr[i][results.length] = data[i].Close;
                        }
                        io.sockets.emit('create', arr);
                    } else {
                        io.sockets.emit('code_error')
                    }
                });
            }
        });
        //used when removing stock details. 
        socket.on('remove', function(text, cb) {
            var index = results.indexOf(text);
            for (var i = 0; i < arr.length; i++) {
                arr[i].splice(index + 1, 1);
            }
            results.splice(index, 1);
            io.sockets.emit('message', results);
            io.sockets.emit('create', arr);
        })
    });
};