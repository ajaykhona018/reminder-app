const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const api = require('./routes/api');
const apiAccounts = require('./routes/accounts');

const jwt = require('jsonwebtoken');

const app = express();


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());

app.use(bodyParser.json());
app.use('/api', api);
app.use('/api/accounts',apiAccounts);



app.get('/', (req, res) => {
    res.redirect('/api/login');
});
const port = process.env.PORT || 3000;
app.listen(port, () => { console.log(`Listening at port: ${port}`) });

