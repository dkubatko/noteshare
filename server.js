const express = require('express');
const fs = require('fs');
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');
var path = require('path');
var shell = require("shelljs");
const {Storage} = require('@google-cloud/storage');
const Trie = require('./backend/trie.js');
const app = express();

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './tmp/'
}));

// Removes temp files in the tmp folder
shell.rm('-rf', './tmp/*');

 // Creates a client
 const storage = new Storage({
     projectId: 'noteshare',
     keyFilename: './backend/noteshare-c8ce1ca41a8d.json'
 });

var BUCKET_NAME = 'noteshare';
const myBucket = storage.bucket(BUCKET_NAME);

const port = 3000;

const mongo_password = process.env.NOTESHARE;

var classes = [];

var notes = [];

var topic_trie_trees = {};

const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://user:' + mongo_password + '@noteshare-z8f3l.mongodb.net/test?retryWrites=true';
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(function(err, db) {
    if (err) {
        console.log("MongoDB Connection Failed");
      } else {
          console.log("MongoDB Connection Successful");
          let dbo = db.db('Noteshare');
          //Query through the existing classes
          dbo.collection('Classes').find({}).toArray(function(err, result) {
              if (err) {
                  console.log("MongoDB Query All Classes Error");
              } else {
                  for (var i = 0; i < result.length; i++) {
                      classes.push({department: result[i].department, number : result[i].number, name : result[i].name, uuid : result[i].uuid});
                      if ( !topic_trie_trees[result[i].name] ) {
                          topic_trie_trees[result[i].name] = new Trie();
                      }
                  } 
              }
          });

          //Query through the existing classes
          dbo.collection('Notes').find({}).toArray(function(err, result) {
            if (err) {
                console.log("MongoDB Query All Notes Error");
            } else {
                for (var i = 0; i < result.length; i++) {
                    notes.push({lecture_topic : result[i].lecture_topic, lecture_date : result[i].lecture_date, uuid : result[i].uuid, class_uuid : result[i].class_uuid, class_name : result[i].class_name, note_name : result[i].note_name, note_url : result[i].url});
                    class_name = "";
                    class_name_arr = result[i].class_name.split("~");
                    class_name_arr.forEach(element => {
                        class_name += element + " ";
                    });
                    topic_trie_trees[class_name.substring(0, class_name.length-1)].insert(result[i].lecture_topic);
                }
            }
        });
      }
});


app.use(express.static(__dirname + '/frontend/'));
app.use(express.static(__dirname + '/notes/'));
app.use(bodyParser.urlencoded({ extended: true }));

function handleRoot(req, res) {
    res.redirect('/class_list');   
};

function handleClassList(req, res) {
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
            "department": req.body.department,
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
                dbo.collection('Classes').insertOne({'department' : req.body.department, 'number' : req.body.class_no, 'name' : req.body.class_name, 'uuid' : newUUID}, function(err, res) {
                    if (err) {
                        console.log("MongoDB Insert Class Error");
                    } else {

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
    var uuid = uuidv4();

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

    fs.rename('tmp/' + noteObject.tmp_name, 'tmp/' + noteObject.tmp_name + '.pdf', function(err) {
        if ( err ) console.log('Rename Error: ' + err);

        myBucket.upload('tmp/' + noteObject.tmp_name + '.pdf', function(err, file) {
            if (err) {
                console.log("Google Storage Error");
            } else {
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

    notes.push({lecture_topic : noteObject.lecture_topic, lecture_date : noteObject.lecture_date, uuid : noteObject.uuid, class_uuid : noteObject.class_uuid, class_name : noteObject.class_name, note_name : noteObject.note_name, note_url : noteObject.url});
    class_name_arr = noteObject.class_name.split("~");
    class_name_str = "";
    class_name_arr.forEach( (element) => {
        class_name_str += element + " ";
    });
    class_name_str = class_name_str.substring(0, class_name_str.length-1);
    if ( !topic_trie_trees[class_name_str] ) {
        topic_trie_trees[class_name_str] = new Trie();
    }
    topic_trie_trees[class_name_str].insert(noteObject.lecture_topic);
    res.redirect('/');
}

function handleListNotes(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/listNotes.html'));
}

function handleGetNotes(req, res) {
    let data = {
        "notes": [],
        "count": 0,
        "class_num": -1
    }
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].class_name == req.query.class) {
            if ( data.class_num == -1 ) {
                for (let j = 0; j < classes.length; j++) {
                    if (classes[j].uuid == notes[i].class_uuid) {
                        data.class_num = classes[j].number;
                        break;
                    }
                }
            }
            data.notes.push(notes[i]);
            data.count++;
        }
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.send(data); 
}

function handleGetCoursesByDepartment(req, res) {
    let data = {
        "courses" : [],
        "count" : 0
    }
    for (let i = 0; i < classes.length; i++) {
        if ( classes[i].department == req.query.dep) {
            data.courses.push(classes[i]);
            data.count++;
        }
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(data); 
}

function handleNote(req, res) {
    res.sendFile(path.join(__dirname, 'notes', req.query.note));
}

function handleGetLectureNameTrie(req, res) {
    class_arr = req.query.class.split("~");
    class_str = ""
    class_arr.forEach( (element) => {
        class_str += element + " "
    });
    class_str = class_str.substring(0, class_str.length-1)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.send({"valid_searches" : topic_trie_trees[class_str].get_possible_searches(req.query.val)}); 

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

app.get('/get_courses_by_department', handleGetCoursesByDepartment);

app.get('/get_lecture_name_trie', handleGetLectureNameTrie);

app.listen(port, () => console.log(`Example app listening on port ${port}...`));