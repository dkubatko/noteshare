const express = require('express')
var path = require('path')
const app = express()
const port = 3000
app.use(express.static(__dirname + '/frontend/'))

function handleRoot(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/home.html'));
};

function handleClass(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/classList.html'));
}

app.get('/', handleRoot);

app.get('/class-list', handleClass);


app.listen(port, () => console.log(`Example app listening on port ${port}...`))