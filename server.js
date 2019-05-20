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
// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
 

const app = express();

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './tmp/'
}));

 // Creates a client
 const storage = new Storage({
     projectId: 'noteshare',
     keyFilename: 'noteshare-c8ce1ca41a8d.json'
 });

var BUCKET_NAME = 'noteshare';
const myBucket = storage.bucket(BUCKET_NAME);

const port = 3000;


const note = process.env.NOTESHARE;

var classes = [];

var notes = [];


const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://user:' + note + '@noteshare-z8f3l.mongodb.net/test?retryWrites=true';
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(function(err, db) {
    if (err) {
        console.log("MongoDB Connection Failed");
        console.log(err);
      } else {
          //console.log("MongoDB Connection Successful");
          let dbo = db.db('Noteshare');
          dbo.collection('Classes').find({'number' : 'CSE11'}).toArray(function(err, result) {
              if (err) {
                  console.log("MongoDB Find CSE 11 Error")
              } else {
                  if (result.length == 0) {
                      dbo.collection('Classes').insertOne({'number' : 'CSE11', 'name' : 'Intro to CS', 'uuid' : uuidv4()}, function(err, res) {
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
        
          dbo.collection('Classes').find({'number' : 'CSE12'}).toArray(function(err, result) {
              if (err) {
                  console.log("MongoDB Find CSE 12 Error")
              } else {
                  if (result.length == 0) {
                      dbo.collection('Classes').insertOne({'number' : 'CSE12', 'name' : 'Algorithms', 'uuid' : uuidv4()}, function(err, res) {
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
          dbo.collection('Classes').find({}).toArray(function(err, result) {
              if (err) {
                  console.log("MongoDB Query All Classes Error");
              } else {
                  //console.log(result.length);
                  for (var i = 0; i < result.length; i++) {
                      classes.push({number : result[i].number, name : result[i].name, uuid : result[i].uuid});
                  }
                  console.log(classes); 
              }
          });

          //Query through the existing classes
          dbo.collection('Notes').find({}).toArray(function(err, result) {
            if (err) {
                console.log("MongoDB Query All Notes Error");
            } else {
                console.log(result.length);
                for (var i = 0; i < result.length; i++) {
                    notes.push({lecture_topic : result[i].lecture_topic, lecture_date : result[i].lecture_date, uuid : result[i].uuid, class_uuid : result[i].class_uuid, class_name : result[i].class_name, note_name : result[i].note_name, note_url : result[i].url});
                }
                console.log(notes);
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
    res.redirect('/class_list');   
   //res.sendFile(path.join(__dirname + '/frontend/home.html'));
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
        MongoClient.connect(uri, function(err, db) {
            if (err) {
                console.log("MongoDB Add Class Error");
            } else {
                console.log("MongoDB Connection Success");
                let dbo = db.db('Noteshare');
                dbo.collection('Classes').insertOne({'number' : req.body.class_no, 'name' : req.body.class_name, 'uuid' : newUUID}, function(err, res) {
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
    var lectureTopic = req.body.lecture_topic;
    var lectureDate = req.body.lecture_date;
    console.log(lectureDate);
    console.log(lectureTopic);
    var uuid = uuidv4();
    console.log(req.files);

    var noteObject = {
        "uuid" : uuid,
        "class_uuid" : courseID,
        "class_name" : courseName,
        "note_name" : req.files['note']['name'],
        "tmp_name" : req.files['note']['tempFilePath'].substring(4),
        "url" : "",
        "lecture_topic" : lectureTopic,
        "lecture_date" : lectureDate
    }
    console.log(noteObject);

    fs.rename('tmp/' + noteObject.tmp_name, 'tmp/' + noteObject.tmp_name + '.pdf', function(err) {
        if ( err ) console.log('Rename error: ' + err);

        myBucket.upload('tmp/' + noteObject.tmp_name + '.pdf', function(err, file) {
            if (err) {
                console.log("GOOGLE ERROR");
                console.log(err);
            } else {
                console.log("GOOGLE WORKS");
            }
        });
    });

    noteObject.url = "https://storage.googleapis.com/" + BUCKET_NAME + "/" + noteObject.tmp_name + ".pdf";

    //Add to note database  

    MongoClient.connect(uri, function(err, db) {
        if (err) {
            console.log("MongoDB Add Note Error");
        } else {
            console.log("MongoDB Connection Success");
            let dbo = db.db('Noteshare');
            dbo.collection('Notes').insertOne(noteObject, function(err) {
                if (err) {
                    console.log("MongoDB Add Note Error");
                } else {
                    console.log("MongoDB Add Note Successful");
                }
            });
        }
    });

    //shell.rm('-r', 'tmp/*');
    notes.push({lecture_topic : noteObject.lecture_topic, lecture_date : noteObject.lecture_date, uuid : noteObject.uuid, class_uuid : noteObject.class_uuid, class_name : noteObject.class_name, note_name : noteObject.note_name, note_url : noteObject.url});
    res.redirect('/');
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
    //res.setHeader('Content-Type', 'application/pdf');
    //res.setHeader('Content-Disposition', 'attachment');
    //console.log(__dirname);
    res.sendFile(path.join(__dirname, 'notes', req.query.note));
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