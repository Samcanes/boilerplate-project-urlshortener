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




// Creating the URL model
let urlSchema = new mongoose.Schema({
    original: { type: String, required: true },
    short: Number
})

let Url = mongoose.model('Url', urlSchema)
let bodyParser = require('body-parser')


let responseObject = {}
app.post('/api/shorturl/new', bodyParser.urlencoded({ extended: false }), (request, response) => {
    let inputUrl = request.body['url']

    //url regex

    let urlRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi)

    if (!inputUrl.match(urlRegex)) {
        response.json({ error: 'Invalid URL' })
        return
    }

    responseObject['original_url'] = inputUrl

    let inputShort = 1
    Url.findOne({})
        .sort({ short: 'desc' })
        .exec((error, result) => {
            console.log(error, result)
            if (!error && result != undefined) {
                console.log(error, result)
                inputShort = result.short + 1
            }
            if (!error) {
                Url.findOne({ original: inputUrl })
                    .exec((error, result) => {
                        if (!error) {
                            console.log(error, result)
                            if (result == null) {
                                console.log("hello there")
                                responseObject['short'] = inputShort;
                                console.log(responseObject)

                                var passedObj = new Url(responseObject);

                                passedObj.save(function(err) {
                                    console.log(err)
                                    if (err) return handleError(err);
                                    console.log("new url entered to DB")
                                });

                                response.json(responseObject)
                                return
                            }
                        }
                        console.log("--------------------------");
                        response.json({
                            original_url: result.original,
                            short_url: result.short
                        })
                    })
            }
        })
})

app.get('/api/shorturl/:input', (request, response) => {
    let input = request.params.input

    Url.findOne({ short: input }, (error, result) => {
        if (!error && result != undefined) {
            response.redirect(result.original)
        } else {
            response.json({ error: 'Invalid URL' })
        }
    })
})