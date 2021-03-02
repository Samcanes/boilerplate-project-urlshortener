require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let bodyParser = require('body-parser')
const mongoose = require('mongoose');
var mongo = require('mongodb');

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


// Basic Configuration
const port = process.env.PORT || 5000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
    res.json({ greeting: 'hello API' });
});
// url schema
var urlSchema = new mongoose.Schema({
    url: { type: String, required: true },
    short: Number
});
let urlModel = mongoose.model('URL', urlSchema)


let shortCount = 1,
    activePair = {},
    requiredURL = '';
app.post('/api/shorturl/new', bodyParser.urlencoded({
        extended: false
    }),
    (req, res) => {
        console.log("run hota hai")
        requiredURL = req.body.url;
        //console.log(samcanes)
        activePair['url'] = requiredURL;
        res.json(activePair);
    }
)
urlModel
    .findOne({})
    .sort({ short: "desc" })
    .exec((error, result) => {
        if (!error && result != undefined) {
            console.log(result, error, !error && result)
            shortCount = result.short + 1;
        }
        // if (!error) {
        //     urlModel.findOneAndUpdate({ original: requiredURL },
        //         // sdkcm
        //         { original: requiredURL, short: shortCount }, { new: true, upsert: true },
        //         (error, savedUrl) => {
        //             if (!error) {
        //                 activePair["short_url"] = savedUrl.short;
        //                 response.json(activePair);
        //             }
        //         }
        //     )
        // }
    });

app.listen(port, function() {
    console.log(`Listening on port ${port}`);
});