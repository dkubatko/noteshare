const express = require('express');
const fs = require('fs');
var path = require('path');
const app = express();
const port = 3000;
app.use(express.static(__dirname + '/frontend/'));

function handleRoot(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/home.html'));
};

function handleClass(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/classList.html'));
};

function handleAdd( req, res) {
    res.send("<!DOCTYPE html><html><head></head><body><p>You made it</p></body></html>")
}

app.get('/', handleRoot);

app.get('/class-list', handleClass);

app.get('/add-course', handleAdd);


app.listen(port, () => console.log(`Example app listening on port ${port}...`));