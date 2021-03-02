// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const app = express();
// let bodyParser = require('body-parser')
// const mongoose = require('mongoose');
// var mongo = require('mongodb');

// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true,
//     useFindAndModify: false
// }).then(() => {
//     console.log(`connection to database established`)
// }).catch(err => {
//     console.log(`db error ${err.message}`);
//     process.exit(-1)
// });


// // Basic Configuration
// const port = process.env.PORT || 5000;

// app.use(cors());

// app.use('/public', express.static(`${process.cwd()}/public`));

// app.get('/', function(req, res) {
//     res.sendFile(process.cwd() + '/views/index.html');
// });

// // Your first API endpoint
// app.get('/api/hello', function(req, res) {
//     res.json({ greeting: 'hello API' });
// });
// // url schema
// var urlSchema = new mongoose.Schema({
//     url: { type: String, required: true },
//     short: Number
// });
// let urlModel = mongoose.model('URL', urlSchema)


// let shortCount = 1,
//     activePair = {},
//     requiredURL = '';
// app.post('/api/shorturl/new', bodyParser.urlencoded({
//         extended: false
//     }),
//     (req, res) => {
//         console.log("run hota hai")
//         requiredURL = req.body.url;
//         //console.log(samcanes)
//         activePair['url'] = requiredURL;
//         res.json(activePair);
//     }
// )
// urlModel
//     .findOne({})
//     .sort({ short: "desc" })
//     .exec((error, result) => {
//         if (!error && result != undefined) {
//             console.log(result, error, !error && result)
//             shortCount = result.short + 1;
//         }

//         if (!error) {
//             urlModel.findOneAndUpdate({ original: requiredURL },
//                 // sdkcm
//                 { original: requiredURL, short: shortCount }, { new: true, upsert: true },
//                 (error, savedUrl) => {
//                     if (!error) {
//                         activePair["short_url"] = savedUrl.short;
//                         response.json(activePair);
//                     }
//                 }
//             )
//         }
//     });

// app.listen(port, function() {
//     console.log(`Listening on port ${port}`);
// });

'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
// mongoose.connect(process.env.MONGO_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function(req, res) {
    res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
    console.log('Node.js listening ...');
});

/* Database Connection */
// let uri = 'mongodb+srv://user1:' + process.env.PW + '@freecodecamp.b0myq.mongodb.net/db1?retryWrites=true&w=majority'
// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log(`connection to database established`)
}).catch(err => {
    console.log(`db error ${err.message}`);
    process.exit(-1)
});


let urlSchema = new mongoose.Schema({
    original: { type: String, required: true },
    short: Number
})

let Url = mongoose.model('Url', urlSchema)

let bodyParser = require('body-parser')
let responseObject = {}
app.post('/api/shorturl/new', bodyParser.urlencoded({ extended: false }), (request, response) => {
    let inputUrl = request.body['url']

    let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)

    if (!inputUrl.match(urlRegex)) {
        response.json({ error: 'Invalid URL' })
        return
    }

    responseObject['original_url'] = inputUrl

    let inputShort = 1

    Url.findOne({})
        .sort({ short: 'desc' })
        .exec((error, result) => {
            if (!error && result != undefined) {
                inputShort = result.short + 1
            }
            if (!error) {
                Url.findOneAndUpdate({ original: inputUrl }, { original: inputUrl, short: inputShort }, { new: true, upsert: true },
                    (error, savedUrl) => {
                        if (!error) {
                            responseObject['short_url'] = savedUrl.short
                            response.json(responseObject)
                        }
                    }
                )
            }
        })

})

app.get('/api/shorturl/:input', (request, response) => {
    let input = request.params.input

    Url.findOne({ short: input }, (error, result) => {
        if (!error && result != undefined) {
            response.redirect(result.original)
        } else {
            response.json('URL not Found')
        }
    })
})