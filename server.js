const express = require('express');
const fs = require('fs');
const qs = require('querystring');
const bodyParser = require('body-parser');
var path = require('path');
const app = express();
const port = 3000;
const note = process.env.NOTESHARE;

const MongoClient = require('mongodb').MongoClient;
const uri = note;
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(function(err, db) {
    if (err) {
        console.log("MongoDB Connecion Failed");
    } else {
        var dbo = db.db('Noteshare');
        var query = {Note: "Hello World"};
        dbo.collection("Notes").find(query).toArray( function(err, result) {
            if (err) {
                console.log("Query Error");
            } else {
                console.log(result);
            }
        });
        db.close();
    }
});

var classes = [
    {"number": "CSE11", "name": "Intro to CS", "count": 1},
    {"number": "CSE12", "name": "Algorithms", "count": 2}
];


app.use(express.static(__dirname + '/frontend/'));
app.use(bodyParser.urlencoded({ extended: true }));

function handleRoot(req, res) {
    console.log(process.env.NOTESHARE);
    res.sendFile(path.join(__dirname + '/frontend/home.html'));
};

function handleClassList(req, res) {
    console.log(classes);
    res.sendFile(path.join(__dirname + '/frontend/classList.html'));
};

function handleAddCourse(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/addClass.html'));
}

function handleSendCourse(req, res) {
    if (req.method == 'POST') {
        var body = req.body;
        var added_cl = {
            "name": req.body.class_name,
            "number": req.body.class_no,
            "count": 0
        }
        classes.push(added_cl)
        res.redirect('/class_list');
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

app.get('/class_list', handleClassList);

app.get('/add_course', handleAddCourse);

app.post('/send_course', handleSendCourse);

app.get('/get_classes', handleGetClasses);


app.listen(port, () => console.log(`Example app listening on port ${port}...`));