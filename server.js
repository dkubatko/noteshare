const express = require('express');
const fs = require('fs');
const qs = require('querystring');
const bodyParser = require('body-parser');
var path = require('path');
const app = express();
const port = 3000;

/*
const note = process.env.NOTESHARE;
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://user:${note}@noteshare-z8f3l.mongodb.net/test?retryWrites=true';
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
*/

var MongoClient = require('mongodb').MongoClient;

var classes = [];

var notes = [];

// Connection URL
var url = 'mongodb://localhost:27017/';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log("MongoDB Connection Failed");
    } else {
        console.log("MongoDB Connection Successful");
        let dbo = db.db('noteshare');
        dbo.collection('classes').find({'number' : 'CSE11'}).toArray(function(err, result) {
            if (err) {
                console.log("MongoDB Find CSE 11 Error")
            } else {
                if (result.length == 0) {
                    dbo.collection('classes').insertOne({number : 'CSE11', name : 'Intro to CS'}, function(err, res) {
                        if (err) {
                            console.log("MongoDB Insert CSE 11 Error");
                            throw err;
                        } else {
                            console.log("MongoDB Inserted CSE 11");
                        }
                    })
                } else {
                    console.log("CSE 11 Exists");
                }
            }
        });
      
        dbo.collection('classes').find({'number' : 'CSE12'}).toArray(function(err, result) {
            if (err) {
                console.log("MongoDB Find CSE 12 Error")
            } else {
                if (result.length == 0) {
                    dbo.collection('classes').insertOne({'number' : 'CSE12', 'name' : 'Algorithms'}, function(err, res) {
                        if (err) {
                            console.log("MongoDB Insert CSE 12 Error");
                        } else {
                            console.log("MongoDB Inserted CSE 12");
                        }
                    });
                } else {
                    console.log("CSE 12 Exists");
                }
            }
        });

        //Query through the existing classes
        dbo.collection('classes').find({}).toArray(function(err, result) {
            if (err) {
                console.log("MongoDB Query All Classes Error");
            } else {
                console.log(result.length);
                for (var i = 0; i < result.length; i++) {
                    classes.push({number : result[i].number, name : result[i].name});
                }
                console.log(classes);
                db.close();
                console.log("MongoDB Closed Successfully"); 
            }
        });
    }
});


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
        var added_cl = {
            "name": req.body.class_name,
            "number": req.body.class_no,
            "count": 0
        }
        classes.push(added_cl);
        //Add to database
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log("MongoDB Add Class Error");
            } else {
                console.log("MongoDB Connection Success");
                let dbo = db.db('noteshare');
                dbo.collection('classes').insertOne({'number' : req.body.class_no, 'name' : req.body.class_name}, function(err, res) {
                    if (err) {
                        console.log("MongoDB Insert Class Error");
                    } else {
                        console.log("MongoDB Insert Class Successful");
                    }
                });

                dbo.collection('classes').find({}).toArray(function(err, res) {
                    if (err) {
                        console.log("MongoDB Find Error");
                    } else {
                        console.log(res.length);
                        for (let i = 0; i < res.length; i++) {
                            console.log(res);
                        }
                        db.close();
                        console.log("MongoDB Closed Successfully");
                    }
                });
            }
        });
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