var socket = io.connect();
var chkerr = document.querySelector('.checkerror');
var form = document.querySelector('form');
var ul = document.querySelector('ul');
var indxlist = [];

//GOOGLE API: this loads in the google charts.
google.charts.load('current', { packages: ['corechart', 'line'] });
//Grab elements from Event listener which is triggered upon a submit
form.addEventListener('submit', function(event) {
    event.preventDefault();
    //querySelector gets the Letters we put into input
    var input = this.querySelector('input');
    var text = input.value;
    input.value = '';
    //We're sent off to our socket('add') in script.js;
    socket.emit('add', text);
    return false;
});


socket.on('message', function(text) {
    //indxlist establishes an index array
    indxlist = JSON.parse(JSON.stringify(text));
    ul.innerHTML = '';
    chkerr.innerHTML = '';
    for (var i = 0; i < indxlist.length; i++) { addElem(indxlist[i]); }
    //Begin building the HTML around our indxlist
    function addElem(elem) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.innerHTML = elem;
        li.appendChild(btn);
        ul.appendChild(li);
        //clicking the Stock Symbol removes it. 
        btn.addEventListener('click', function(event) {
            event.preventDefault();
            socket.emit('remove', this.parentNode.innerText);
            return false;
        })
    }
});
//Build the Chart
socket.on('create', function(results) {
    var arr = JSON.parse(JSON.stringify(results)).reverse();
    // the 'data' draws from our google load, we get stock labels, other labels, types, etc. this will build out our chart.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Date');
    for (var i = 0; i < indxlist.length; i++) {
        data.addColumn('number', indxlist[i]);
        for (var j = 0; j < arr.length; j++) {
            arr[j][i + 1] = +arr[j][i + 1];
        }
    }
    data.addRows(arr);
    //Google Chart API number formatting
    var formatter = new google.visualization.NumberFormat({ decimalSymbol: '.', groupingSymbol: ',' });
    for (var k = 1; k <= indxlist.length; k++) {
        formatter.format(data, k);
    }
    //Chart Design
    var options = {
        fontSize: 14,
        chart: {
            title: 'Stock Prices',
            backgroundColor: 'pink'
        },
        width: 950,
        height: 500,
        backgroundColor: {
            fill: '#ffffcc'
        },
        chartArea: {
            backgroundColor: { stroke: 'brown', strokeWidth: 5, fill: '#ebebe0' }
        },

        hAxis: {
            textStyle: {
                color: 'black',
                fontSize: 10
            },
            gridlines: {
                count: 10,
                color: 'black'
            },
            minorGridlines: {
                count: 10,
                color: 'black'
            }
        },
        vAxis: {
            textStyle: {
                color: 'black'
            }
        }


    };
    //This line creates the actual rendering of the chart and uses are data points to create them. 
    var chart = new google.visualization.LineChart(document.getElementById('line_chart'));
    console.log(chart);
    chart.draw(data, google.charts.Line.convertOptions(options));

});
//Handles Incorrect or null inputs
socket.on('code_error', function() {
    alert("This Code Does Not Exist")
})