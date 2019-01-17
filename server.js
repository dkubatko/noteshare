const express = require('express');
const fs = require('fs');
const qs = require('querystring');
var path = require('path');
const app = express();
const port = 3000;

var classNo = ["CSE 11", "CSE 12"];
var className = ["Intro to CS", "Algorithms"];
var noteCount = [1, 2];

app.use(express.static(__dirname + '/frontend/'));

function handleRoot(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/home.html'));
};

function handleClass(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/classList.html'));
};

function handleAdd(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/addClass.html'));
}

function handleCourses(req, res) {
    var data = ["cse100", "bild12"];
    res.send(data);
}

function handleAddedClass(req, res) {
    if (req.method == 'POST') {
        var body = '';

        req.on('data', function(data) {
            body += data;
            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                req.connection.destroy();
        });

        req.on('end', function() {
            var post = qs.parse(body);
            classNo.push(post.class_no);
            className.push(post.class_name);
            res.redirect('/class-list');
        });
    }
}

function handleGetData(req, res) {
    let data = {};
    data['class_no'] = classNo;
    data['class_name'] = className;
    data['note_count'] = noteCount;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(data);
}



app.get('/', handleRoot);

app.get('/class-list', handleClass);

app.get('/add-course', handleAdd);

app.post('/added-class', handleAddedClass);

app.get('/courses', handleCourses);

app.get('/get-data', handleGetData);


app.listen(port, () => console.log(`Example app listening on port ${port}...`));