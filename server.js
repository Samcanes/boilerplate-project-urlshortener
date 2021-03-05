'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
require('dotenv').config();
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/


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




// // Creating the URL model
// let urlSchema = new mongoose.Schema({
//     original: { type: String, required: true },
//     short: Number
// })

// let Url = mongoose.model('Url', urlSchema)
// let bodyParser = require('body-parser')


// let responseObject = {}
// app.post('/api/shorturl/new', bodyParser.urlencoded({ extended: false }), (request, response) => {
//     let inputUrl = request.body['url']

//     //url regex

//     let urlRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi)

//     if (!inputUrl.match(urlRegex)) {
//         console.log("Checked URL")
//         response.json({ error: 'invalid url' })
//         return
//     }

//     responseObject['original_url'] = inputUrl

//     let inputShort = 1
//     Url.findOne({})
//         .sort({ short: 'desc' })
//         .exec((error, result) => {
//             console.log(error, result)
//             if (!error && result != undefined) {
//                 console.log(error, result)
//                 inputShort = result.short + 1
//             }
//             if (!error) {
//                 Url.findOne({ original: inputUrl })
//                     .exec((error, result) => {
//                         if (!error) {
//                             console.log(error, result)
//                             if (result == null) {
//                                 console.log("hello there")
//                                 responseObject['short'] = inputShort;
//                                 console.log(responseObject)

//                                 var passedObj = new Url(responseObject);

//                                 passedObj.save(function(err) {
//                                     console.log(err)
//                                     if (err) return handleError(err);
//                                     console.log("new url entered to DB")
//                                 });

//                                 response.json(responseObject)
//                                 return
//                             }
//                         }
//                         console.log("--------------------------");
//                         response.json({
//                             original_url: result.original,
//                             short_url: result.short
//                         })
//                     })
//             }
//         })
// })

// app.get('/api/shorturl/:input', (request, response) => {
//     let input = request.params.input

//     Url.findOne({ short: input }, (error, result) => {
//         if (!error && result != undefined) {
//             response.redirect(result.original)
//         } else {
//             response.json({ error: 'Invalid URL' })
//         }
//     })
// })


//my code below!


const { Schema } = mongoose;
const urlSchema = new Schema({

    url: String,
    shortuUrl: String,
    uniqueId: String,

})
var Url = mongoose.model('Url', urlSchema)

var rand = Math.floor(Math.random() * 1000)




app.get("/test", function(req, res) {
    var check = dns.lookup("geeksforgeeks.org", (error, address, family) => {
        if (address === undefined) {
            res.json({
                "error": "Invalid URL"
            })
        } else {
            res.json({ "address": address })
        }
    })
})

app.route("/api/shorturl/new", function(req, res) {
    let url = req.query['url']
})




app.post('/api/shorturl/new', (req, res, next) => {
    const originalURL = req.body['url'];

    const httpRegex = /^(http|https)(:\/\/)/;
    if (!httpRegex.test(originalURL)) { return res.json({ error: 'invalid url' }) }


    const urlObject = new URL(originalURL);
    console.log(urlObject)
    dns.lookup(urlObject.hostname, (err, address, family) => {
        if (err) {
            res.json({ error: 'invalid url' });
        } else {
            let shortenedURL = Math.floor(Math.random() * 100000).toString();

            // create an object(document) and save it on the DB
            let data = new Url({
                url: originalURL,
                shortuUrl: shortenedURL
            });

            data.save((err, data) => {
                if (err) {
                    console.error(err);
                }
            });

            res.json({
                original_url: originalURL,
                short_url: shortenedURL
            })
        };
    });
});


app.get("/api/shorturl/:num", function(req, res) {
    console.log(req.params.num)
    let query = req.params.num;
    Url.find({ shortuUrl: query }, function(err, data) {
        let redirectTo = data[0].url
            //console.log(data)
            //console.log("data without indexing: "+data.url)
            //console.log("data with indexing: "+data[0].url)

        res.redirect(redirectTo)
    })
})

app.get("/api/all", function(req, res) {
    Url.find({ shortuUrl: { $gt: 1 } }, function(err, data) {
        //console.log("data "+data)
        //console.log("error "+err)
        res.json(data)
    })
})