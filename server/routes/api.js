const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const nodemailer = require('nodemailer');

const saltRounds = 8;
const TABLE_USERS = "users";
const SCHEMA_USERS = {
    TABLE_NAME: 'users',
    COLUMNS: {
        email: 'email',
        passwordHash: 'passwordHash',
        firstName: 'firstName',
        lastName: 'lastName',
        company: 'company'
    },
    validation: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        firstName: Joi.string(),
        lastName: Joi.string(),
        company: Joi.string()
    })
}

/** MYSQL SETUP */
const mysql = require('mysql');

/** REMOTE CONNECTION  */
const con = mysql.createConnection({
    host: '116.206.105.72',
    // port: '2082',
    user: 'unichwmn_admin',
    password: 'DisIs4Admin',
    database: 'unichwmn_paymentreminder'
});

verifyToken = function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send('You are not Authorized.');
    }

    token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, 'supersecretkey', (err, decoded) => {
        if (err) {
            console.log(err);
            res.status(401).send('You are not Authorized.');
        } else {
            req.decoded = decoded;
            /* Verify Email ID exists in database. 
            ..
            ..
            ..*/
            next();
        }
    });

}
router.post('/register', (req, res) => {
    let salt = bcrypt.genSaltSync(saltRounds);
    let passwordHash = bcrypt.hashSync(req.body.password, salt);
    let values = [[
        [req.body.email,
            passwordHash,
        req.body.firstName,
        req.body.lastName,
        req.body.company]
    ]];
    const validationResult = Joi.validate(req.body, SCHEMA_USERS.validation);
    if (validationResult.error === null) {
        console.log(values);
        con.query('INSERT INTO ' + SCHEMA_USERS.TABLE_NAME + ' VALUES ?', values, (err, result) => {
            if (err) {
                console.log(err);
                if (err.code = 'ER_DUP_ENTRY') {
                    return res.status(409).send('User Email is already registered.');
                }
                return res.status(500).send("Oops! System Failure. Unable to register.");
            }
            console.log(result);
            return res.status(200).send("Registered Successfully.");
        });
    } else {
        console.log(validationResult);
        return res.status(409).send('Validation Failed.');
    }
});

router.get('/email', (req, res) => {
    nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
            host: 'cp-in-17.webhostbox.net',
            port: 465,
            secure: false,
            auth: {
                user: 'jobs@unichemindustries.in',
                pass: 'DisIs4Jobs'
            }
        });
        let mailOptions = {
            from: 'tigerkhona@gmail.com', // sender address
            to: 'tigerkhona@gmail.com', // list of receivers
            subject: 'Hello ✔', // Subject line
            text: 'Hello world?', // plain text body
            html: '<b>Hello world?</b>' // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    })
});

router.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    // Fetch details for the given email.
    con.query('SELECT * FROM ' + SCHEMA_USERS.TABLE_NAME + ' WHERE ' + SCHEMA_USERS.COLUMNS.email + ' = ?',
        [email], (error, data) => {
            if (error) {
                console.log(error);
                return res.status(500).send("Oops! System Failure. Unable to register.");
            }

            // No Email found.
            if (data.length == 0) {
                return res.status(401).send('Invalid Credentials.');
            }
            let result = data[0];
            console.log(result);

            // Verify Password
            let passwordMatch = bcrypt.compareSync(password, result.passwordHash);
            if (!passwordMatch) {
                return res.status(401).send('Invalid Credentials.');
            }

            // Create JWT Token
            let payload = { 'email': result.email };
            let token = jwt.sign(payload, 'supersecretkey');
            return res.status(200).send({ token });
        }
    )
});

router.get('/dashboard-data', verifyToken, (req, res) => {
    if (req.decoded) {
        res.json(req.decoded);
    }

});
module.exports = router;
module.exports.verify = verifyToken;