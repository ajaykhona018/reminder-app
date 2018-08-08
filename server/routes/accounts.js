const express = require('express');
// const api = require('./api');
const router = express.Router();
const Joi = require('joi');
const SCHEMA = {
    TABLE_NAME: { accounts: 'accounts_tbl', accountEmail: 'account_email_tbl', accountPhone: 'account_phone_tbl', accountsView: 'accounts_vw' },
    COLUMNS: {
        accountId: 'account_id',
        name: 'name',
        email: 'email',
        phone: 'phone',
        emailFlag: 'email_flag',
        smsFlag: 'sms_flag',
        creditPeriod: 'credit_period',
    }, DATABASE: {},
    validateAccount: Joi.object().keys({
        accountId: Joi.string().alphanum().required(),
        name: Joi.string().required(),
        email: Joi.array().items(Joi.string().email()).unique(),
        phone: Joi.array().items(Joi.string().length(10)).unique(),
        emailFlag: Joi.boolean(),
        smsFlag: Joi.boolean(),
        creditPeriod: Joi.number().max(999)
    })
}
Object.keys(SCHEMA.COLUMNS).forEach((key) => {
    SCHEMA.DATABASE[SCHEMA.COLUMNS[key]] = key;
});
// console.log(SCHEMA.DATABASE);

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

//router.post('/add', api.verify, (req, res) => {
router.post('/add', (req, res) => {
    account = req.body;
    const result = Joi.validate(account, SCHEMA.validateAccount)
    if (result.error !== null) {
        console.log('Validation Failed.');
        res.status(400).send({ success: false, msg: result.error.details[0].message });
    }
    else {
        console.log('Validation Successful.');
        /** ADD DATA TO DATABASE */
        createAccount(account).then((response) => {
            if (response === true) {
                res.status(200).send({ success: true, msg: '' });
            } else {
                res.status(400).send({ success: false, msg: 'Account already exists.' });
            }
        }).catch((err) => {
            console.log(err);
            res.status(400).send({ success: false, msg: 'Account already exists.' });
        });
        /** END */

    }
});
router.delete('/:accountId', (req, res) => {
    console.log('Deleting Account: ' + req.params.accountId);
    deleteAccount(req.params.accountId).then((response) => {
        res.status(200).send({ success: true });
    }).catch((err) => {
        res.status(404).send({ success: false, msg: 'Database Error while Deleting account: ' + req.params.accountId });
    });
});

// UPDATE ACCOUNT
router.put('/', (req, res) => {
    account = req.body;
    const result = Joi.validate(account, SCHEMA.validateAccount)
    if (result.error !== null) {
        console.log('Validation Failed.');
        res.status(400).send({ success: false, msg: result.error.details[0].message });
    }
    else {
        console.log('Validation Successful.');
        /** UPDATE  DATABASE */
        updateAccount(account).then((response) => {
            if (!response) {
                res.status(400).send({ success: false, msg: 'Account does not exist.' });
            } else {
                res.status(200).send({ success: true });
            }
        }).catch((error) => {
            res.status(404).send({ success: false, msg: 'Database Error while updating account.' });
        });
    }
});

// GET SPECIFIC ACCOUNT
router.get('/:accountId', (req, res) => {
    getAccounts(req.params.accountId).then((result) => {
        console.log(result);
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send({ success: false, msg: error.msg });
    });
});

// GET ALL ACCOUNTS
router.get('/', (req, res) => {
    getAccounts(null).then((result) => {
        console.log(result);
        res.status(200).send(result);
    }).catch((error) => {
        res.status(400).send({ success: false, msg: error.msg });
    });
});

function accountJsonFromDatabase(accounts) {
    // Accounts should be sorted by Account ID.
    // console.log(accounts);
    let returnAccounts = [];
    let prevAccountId = '';
    let accountCount = 0;
    for (let i = 0; i < accounts.length; i++) {
        // console.log('For Loop: ' + accounts.length);
        if (accounts[i].accountId == prevAccountId) {
            // console.log('Equal');
            if (accounts[i].email != null)
                returnAccounts[accountCount - 1].email.push(accounts[i].email);
            if (accounts[i].phone != null)
                returnAccounts[accountCount - 1].phone.push(accounts[i].phone);
        } else {
            // console.log('Not Equal');
            let tAccount = {
                accountId: accounts[i].accountId,
                name: accounts[i].name,
                emailFlag: accounts[i].emailFlag,
                smsFlag: accounts[i].smsFlag,
                creditPeriod: accounts[i].smsFlag,
                email: [accounts[i].email],
                phone: [accounts[i].phone]
            }
            // console.log(tAccount);
            returnAccounts.push(tAccount);
            accountCount += 1;
        }
        prevAccountId = accounts[i].accountId;
    }
    // console.log(returnAccounts);
    return returnAccounts;
}
function select(tableName, columns, columnCriteria, bindsValues) {
    return new Promise((resolve, reject) => {
        let columnString = '';
        if (columns.length == 0) {
            //select all    
            Object.keys(SCHEMA.DATABASE).forEach((key) => {
                columnString += key + ` as '${SCHEMA.DATABASE[key]}',`
            });
        } else {
            //select specific columns
            columns.forEach((column) => {
                columnString += `${column} as '${SCHEMA.DATABASE[column]}',`;
            });
        }
        columnString = columnString.substring(0, columnString.length - 1);
        let sqlString = `SELECT ${columnString} FROM ${tableName}`;
        let whereBuilder = ' where 1=1';
        if (columnCriteria instanceof Array && columnCriteria.length > 0) {
            for (let i = 0; i < columnCriteria.length; i++) {
                whereBuilder += ' and ' + columnCriteria[i] + ' = ? '
            }
        }
        sqlString += whereBuilder;
        console.log(sqlString);
        con.query(sqlString, bindsValues, (err, rows) => {
            if (err) {
                resolve({ success: false, data: {} });
            } else {
                // console.log(rows);
                resolve({ success: true, data: rows });
            }

        });
    });
}
async function getAccounts(accountId) {
    if (accountId === null) {
        const results = await select(SCHEMA.TABLE_NAME.accountsView, [], [], []);
        if (results.success) {
            // console.log(results);
            const returnData = accountJsonFromDatabase(results.data);
            return Promise.resolve({ success: true, data: returnData });
        } else {
            return Promise.reject({ success: false, msg: 'Database Error - Selecting all accounts: ' });
        }
    } else {
        try {
            const accountsPromise = select(SCHEMA.TABLE_NAME.accounts, [SCHEMA.COLUMNS.accountId, SCHEMA.COLUMNS.name, SCHEMA.COLUMNS.emailFlag, SCHEMA.COLUMNS.smsFlag, SCHEMA.COLUMNS.creditPeriod], [SCHEMA.COLUMNS.accountId], [accountId]);
            const accountEmailPromise = select(SCHEMA.TABLE_NAME.accountEmail, [SCHEMA.COLUMNS.email], [SCHEMA.COLUMNS.accountId], [accountId]);
            const accountPhonePromise = select(SCHEMA.TABLE_NAME.accountPhone, [SCHEMA.COLUMNS.phone], [SCHEMA.COLUMNS.accountId], [accountId]);
            const results = await Promise.all([accountsPromise, accountEmailPromise, accountPhonePromise]);
            // console.log(results);
            if (results[0].success && results[1].success && results[2].success) {
                let returnData = results[0].data[0];
                returnData.email = [];
                returnData.phone = [];
                results[1].data.forEach((email) => {
                    returnData.email.push(email.email);
                });
                results[2].data.forEach((phone) => {
                    returnData.phone.push(phone.phone);
                });
                // returnData.email = results[1].data[0];
                // returnData.phone = results[2].data[0];
                console.log(returnData);
                return Promise.resolve({ success: true, data: returnData });
            } else {
                return Promise.reject({ success: false, msg: 'Database Error - Selecting specific account: ' + accountId });
            }

        } catch (e) {
            console.log(e);
            return Promise.reject({ success: false, msg: 'Database Error - Selecting specific account: ' + accountId });
        }
    }
}
async function updateAccount(account) {
    try {
        const exists = await checkIfAccountExists(account.accountId);
        if (exists.success) {
            const accountEmailDeletePromise = con.query(`delete from ${SCHEMA.TABLE_NAME.accountEmail} where ${SCHEMA.COLUMNS.accountId} = ?`, [account.accountId]);
            const accountPhoneDeletePromise = con.query(`delete from ${SCHEMA.TABLE_NAME.accountPhone} where ${SCHEMA.COLUMNS.accountId} = ?`, [account.accountId]);
            const deleteResponses = await Promise.all([accountEmailDeletePromise, accountPhoneDeletePromise]);
            const accountUpdatePromise = con.query(`update ${SCHEMA.TABLE_NAME.accounts} 
                    set ${SCHEMA.COLUMNS.name} = ?, ${SCHEMA.COLUMNS.emailFlag} = ?, 
                        ${SCHEMA.COLUMNS.smsFlag} = ?, ${SCHEMA.COLUMNS.creditPeriod} = ?
                    where ${SCHEMA.COLUMNS.accountId} = ?`,
                [account.name, account.emailFlag, account.smsFlag, account.creditPeriod, account.accountId]);
            const accountEmailInsertPromise = insertAccountEmail(account);
            const accountPhoneInsertPromise = insertAccountPhone(account);
            const updInsResponses = await Promise.all([accountUpdatePromise, accountEmailInsertPromise, accountPhoneInsertPromise]);
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    } catch (e) {
        return Promise.reject(true);
    }
}
async function deleteAccount(accountId) {
    // return new Promise((resolve, reject) => {
    try {
        let deleteAccount = con.query(`delete from ${SCHEMA.TABLE_NAME.accounts} where ${SCHEMA.COLUMNS.accountId} = '${accountId}'`);
        let deleteAccountEmail = con.query(`delete from ${SCHEMA.TABLE_NAME.accountEmail} where ${SCHEMA.COLUMNS.accountId} = '${accountId}'`);
        let deleteAccountPhone = con.query(`delete from ${SCHEMA.TABLE_NAME.accountPhone} where ${SCHEMA.COLUMNS.accountId} = '${accountId}'`);

        let responses = await Promise.all([deleteAccount, deleteAccountEmail, deleteAccountPhone]);
        return Promise.resolve(true);
    } catch (e) {
        console.log('Exceptions: \n' + e);
        return Promise.reject(false);
    }
}
let insertAccount = function (account) {
    console.log('insertAccount');
    return new Promise((resolve, reject) => {
        let values = [
            [account.accountId, account.name, account.emailFlag, account.smsFlag, account.creditPeriod]
        ];
        con.query(`insert into ${SCHEMA.TABLE_NAME.accounts}
            (
                ${SCHEMA.COLUMNS.accountId}, 
                ${SCHEMA.COLUMNS.name}, 
                ${SCHEMA.COLUMNS.emailFlag}, 
                ${SCHEMA.COLUMNS.smsFlag}, 
                ${SCHEMA.COLUMNS.creditPeriod}
            ) 
            values ?`, [values], (err, result, fields) => {
                if (err) {
                    resolve({ success: false });
                } else {
                    resolve({ success: true });
                }
            });
    });
}
let insertAccountEmail = function (account) {
    console.log('insertAccountEmail');
    return new Promise((resolve, reject) => {
        let values = [];
        account.email.forEach(element => {
            values.push([account.accountId, element]);
        });
        con.query(`insert into ${SCHEMA.TABLE_NAME.accountEmail} (${SCHEMA.COLUMNS.accountId}, ${SCHEMA.COLUMNS.email}) values ?`, [values], (err, rows) => {
            if (err) {
                console.log('Insert Error - ' + SCHEMA.TABLE_NAME.accountEmail + ': \n' + err);
                resolve({ success: false });
            }
            resolve({ success: true });
        })
    });
}
let insertAccountPhone = function (account) {
    console.log('insertAccountPhone');
    return new Promise((resolve, reject) => {
        let values = [];
        account.phone.forEach(element => {
            console.log(element);
            values.push([account.accountId, element]);
        });
        con.query(`insert into ${SCHEMA.TABLE_NAME.accountPhone} (${SCHEMA.COLUMNS.accountId}, ${SCHEMA.COLUMNS.phone}) values ?`, [values], (err, rows) => {
            if (err) {
                console.log('Insert Error - ' + SCHEMA.TABLE_NAME.accountPhone + ': \n' + err);
                resolve({ success: false });
            }
            resolve({ success: true });
        })
    });
}
async function createAccount(account) {
    // return new Promise((resolve, reject) => {
    console.log('Create Account');
    let exists = await checkIfAccountExists(account.accountId);
    if (exists.success == false) {
        console.log('Account does not exist.');
        let responses = await Promise.all([insertAccount(account), insertAccountEmail(account), insertAccountPhone(account)]);
        // return responses;
        console.log(responses);
        responses.forEach((response) => {
            if (!response.success) {
                console.log(response.success);
                // resolve({ success: false });
                return Promise.resolve(false);
            }
        })
        // resolve({ success: true });
        return Promise.resolve(true);
    }
    else {
        console.log('Row Already exists.');
        // resolve({ success: false });
        return Promise.reject(false);
    }
    // });
}
function checkIfAccountExists(accountId) {
    console.log('checkIfAccountExists');
    return new Promise((resolve, reject) => {
        con.query(`select 'y' from ${SCHEMA.TABLE_NAME.accounts}
        where ${SCHEMA.COLUMNS.accountId} = ${mysql.escape(accountId)}`, (error, result) => {
                if (error) {
                    console.log(error);
                }
                if (result[0] && result[0].y == 'y')
                    resolve({ success: true });
                else
                    resolve({ success: false });
            });
    });

}

module.exports = router;