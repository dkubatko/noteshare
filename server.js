const express = require('express')
var path = require('path')
const app = express()
const port = 3000
app.use(express.static(__dirname + '/frontend/'))

function handleRoot(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/home.html'));
};

function handleHello(req, res) {
    res.send('Hello')
}

app.get('/', handleRoot);

app.get('/hello', handleHello);

app.get('/hitme', function(req, res) {
    console.log("Hello!");
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.send("Success");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))