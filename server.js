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
        //Used the below line to pass all tests, except the last one
        // let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)
        //Used the below line to pass only the last test
        // let urlRegex = new RegExp(/^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/)

    //This line passes all the tests
    let urlRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi)

    // I think urlRegex is too complex. All you need to make sure is that a URL starts with http/https

    console.log(inputUrl, inputUrl.match(urlRegex)); // Submit tests, open the Glitch console, see what happens
    //OK
    //I am not seeing any error at the debugger of Glitch

    // This is what I see: ftp:/john-doe.org [ 'john-doe.org' ]
    // This means that ftp:... is sent, and is matched by the urlRegex...it should NOT match, and return an error <--
    // Should I need to change line no 70 or 73

    // This if...statement should run and return, when the final fCC test is done. So the above code needs to change
    // Should I put the codes of the 3rd test at the last? I am confused.

    // Here are some summaries:
    // - This url: ftp:/john-doe.org should not match urlRegex
    // - When a url does not match urlRegex, {error: 'invalid url'} should be returned
    // The above will cause/allow the final test to pass.

    // I need to go for now. So, if you are still stuck, please reply with your questions on the forum post you made.
    // Others will also be able to respond, and get help from it. Hope this helps
    if (!inputUrl.match(urlRegex)) {
        // This is done correctly...
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
            // JSON accepts either a string, or an object literal...look at the one you did above
            //??    :)
            // I am trying to submit it now. it should work. let's see what happens. :)
            //I am still getting the same error while submitting the solution at FreeCodeCamp! :(
            response.json({ error: 'Invalid URL' }) // JSON == JavaScript Object Notation.

            // When I go to the browser console, on the fCC page, I see this error:
            // TypeError: Cannot read property 'toLowerCase' of undefined
            // This is coming from the test looking for the error - I will paste it on the forum.
            //Alright. I see that error at console now. Should I create a new post about the error?
            // No need to create a new post. If it concerns the same project/code, it should be in the same topic (post)
            // OK. I am confused. Why am I getting this error? I have to found a solution. Can you give me a hint?
            // line 48 above
            //OK. I will take a look at it.
        }
    })
})