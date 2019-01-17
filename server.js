const express = require('express');
const fs = require('fs');
const qs = require('querystring');
const bodyParser = require('body-parser');
var path = require('path');
const app = express();
const port = 3000;

var classes = [
    {"number": "CSE11", "name": "Intro to CS"},
    {"number": "CSE12", "name": "Algorithms"}
];

var noteCount = [1, 2];

app.use(express.static(__dirname + '/frontend/'));
app.use(bodyParser.urlencoded({ extended: true }));

function handleRoot(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/home.html'));
};

function handleClassList(req, res) {
    console.log(classes);
    res.sendFile(path.join(__dirname + '/frontend/classList.html'));
};

function handleAdd(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/addClass.html'));
}

function handleCourses(req, res) {
    var data = ["cse100", "bild12"];
    res.send(data);
}

function handleAddClass(req, res) {
    if (req.method == 'POST') {
        var body = req.body;
        var added_cl = {
            "name": req.body.class_name,
            "number": req.body.class_no
        }
        classes.push(added_cl)
        res.redirect('/class-list');
    }
}

function handleGetClasses(req, res) {
    let data = {
        "classes": classes,
        "count": classes.length
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(data);
}



app.get('/', handleRoot);

app.get('/class-list', handleClassList);

app.get('/add-course', handleAdd);

app.post('/add_class', handleAddClass);

app.get('/courses', handleCourses);

app.get('/get_classes', handleGetClasses);


app.listen(port, () => console.log(`Example app listening on port ${port}...`));