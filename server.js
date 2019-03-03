const express = require('express');
const fs = require('fs');
const qs = require('querystring');
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');
var path = require('path');
const mongodb = require('mongodb');
var formidable = require('formidable');
var shell = require("shelljs");
const app = express();
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './tmp/'
}));
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
        //console.log("MongoDB Connection Successful");
        let dbo = db.db('noteshare');
        dbo.collection('classes').find({'number' : 'CSE11'}).toArray(function(err, result) {
            if (err) {
                console.log("MongoDB Find CSE 11 Error")
            } else {
                if (result.length == 0) {
                    dbo.collection('classes').insertOne({'number' : 'CSE11', 'name' : 'Intro to CS', 'uuid' : uuidv4()}, function(err, res) {
                        if (err) {
                            console.log("MongoDB Insert CSE 11 Error");
                            throw err;
                        } else {
                            //console.log("MongoDB Inserted CSE 11");
                        }
                    })
                } else {
                    //console.log("CSE 11 Exists");
                }
            }
        });
      
        dbo.collection('classes').find({'number' : 'CSE12'}).toArray(function(err, result) {
            if (err) {
                console.log("MongoDB Find CSE 12 Error")
            } else {
                if (result.length == 0) {
                    dbo.collection('classes').insertOne({'number' : 'CSE12', 'name' : 'Algorithms', 'uuid' : uuidv4()}, function(err, res) {
                        if (err) {
                            console.log("MongoDB Insert CSE 12 Error");
                        } else {
                            //console.log("MongoDB Inserted CSE 12");
                        }
                    });
                } else {
                    //console.log("CSE 12 Exists");
                }
            }
        });

        //Query through the existing classes
        dbo.collection('classes').find({}).toArray(function(err, result) {
            if (err) {
                console.log("MongoDB Query All Classes Error");
            } else {
                //console.log(result.length);
                for (var i = 0; i < result.length; i++) {
                    classes.push({number : result[i].number, name : result[i].name, uuid : result[i].uuid});
                }
                //console.log(classes); 
            }
        });

        //Query through the existing classes
        dbo.collection('notes').find({}).toArray(function(err, result) {
            if (err) {
                console.log("MongoDB Query All Notes Error");
            } else {
                //console.log(result.length);
                for (var i = 0; i < result.length; i++) {
                    notes.push({uuid : result[i].uuid, class_uuid : result[i].class_uuid, class_name : result[i].class_name, note_name : result[i].note_name});
                }
                //console.log(notes);
            }
        });
    }
});


app.use(express.static(__dirname + '/frontend/'));
app.use(express.static(__dirname + '/notes/'));
app.use(bodyParser.urlencoded({ extended: true }));

function handleRoot(req, res) {
    //console.log(process.env.NOTESHARE);
    console.log(notes);
    console.log(classes);
            //Download to server directory
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log("MongoDB Connection Failed");
        } else {
            let dbo = db.db('noteshare');
            var bucket = new mongodb.GridFSBucket(dbo);
            for (var i = 0; i < notes.length; i++) {
                bucket.openDownloadStreamByName(notes[i].note_name).
                    pipe(fs.createWriteStream('notes/' + notes[i].uuid)).
                    on('error', function(err) {
                        console.log("Download Note Error");
                    }).
                    on('finish', function() {
                        console.log('Download Note Successful');
                    });
            }
        }
    });    
    res.sendFile(path.join(__dirname + '/frontend/home.html'));
};

function handleClassList(req, res) {
    //console.log(classes);
    res.sendFile(path.join(__dirname + '/frontend/classList.html'));
};

function handleAddCourse(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/addClass.html'));
}

function handleSendCourse(req, res) {
    if (req.method == 'POST') {
        var newUUID = uuidv4();
        var added_cl = {
            "name": req.body.class_name,
            "number": req.body.class_no,
            "uuid" : newUUID
        }
        classes.push(added_cl);
        //Add to database
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log("MongoDB Add Class Error");
            } else {
                console.log("MongoDB Connection Success");
                let dbo = db.db('noteshare');
                dbo.collection('classes').insertOne({'number' : req.body.class_no, 'name' : req.body.class_name, 'uuid' : newUUID}, function(err, res) {
                    if (err) {
                        console.log("MongoDB Insert Class Error");
                    } else {
                        //console.log("MongoDB Insert Class Successful");
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

function handleAddNote(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/addNote.html'));
}

function handleSendNote(req, res) {
    var noteObject = JSON.parse(req.body.class_name);
    var courseID = noteObject["uuid"];
    var courseName = noteObject["name"];
    //console.log(courseID);
    //console.log(courseName);
    var uuid = uuidv4();
    console.log(req.files);

    var noteObject = {
        "uuid" : uuid,
        "class_uuid" : courseID,
        "class_name" : courseName,
        "note_name" : req.files['note']['name'],
        "tmp_name" : req.files['note']['tempFilePath'].substring(4),
        "data" : req.files.note.data
    }
    console.log(noteObject);
    //Add to note database   
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log("MongoDB Add Note Error");
        } else {
            console.log("MongoDB Connection Success");
            let dbo = db.db('noteshare');
            dbo.collection('notes').insertOne(noteObject, function(err) {
                if (err) {
                    console.log("MongoDB Add Note Error");
                } else {
                    console.log("MongoDB Add Note Successful");
                }
            });
        }
    });
    
    MongoClient.connect(url, function(err, db) {
    let dbo = db.db('noteshare');
    var bucket = new mongodb.GridFSBucket(dbo);
  
    fs.createReadStream('./tmp/' + noteObject.tmp_name).
      pipe(bucket.openUploadStream(noteObject.note_name)).
      on('error', function(err) {
          console.log("Upload Note Error");
      }).
      on('finish', function() {
        console.log('Upload Note Successful');
        //process.exit(0);
      });
  });
    //shell.rm('-r', 'tmp/*');
    notes.push({uuid : noteObject.uuid, class_uuid : noteObject.class_uuid, class_name : noteObject.class_name, note_name : noteObject.note_name});
    res.redirect('/class_list');
}

function handleListNotes(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/listNotes.html'));
}

function handleGetNotes(req, res) {
    let data = {
        "notes": [],
        "count": 0
    }
    console.log(req.query);
    console.log(req.query.class);
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].class_name == req.query.class) {
            data.notes.push(notes[i]);
            data.count++;
        }
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(data); 
}

function handleNote(req, res) {
    console.log(req.query);
    res.sendFile(path.join(__dirname + '/notes/' + req.query.note));
}

app.get('/', handleRoot);

app.get('/class_list', handleClassList);

app.get('/add_course', handleAddCourse);

app.post('/send_course', handleSendCourse);

app.get('/get_classes', handleGetClasses);

app.get('/add_note', handleAddNote);

app.post('/send_note', handleSendNote);

app.get('/list_notes', handleListNotes);

app.get('/get_notes', handleGetNotes);

app.get('/note', handleNote);

app.listen(port, () => console.log(`Example app listening on port ${port}...`));