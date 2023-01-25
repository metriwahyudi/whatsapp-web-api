
const cron = require('node-cron');
const mysql = require('mysql');
const config = require("./../config.json");

console.log('Queue')
/**
 * Mysql
 */
var connection = null;

/**
 * CRON
 */
var sessionIsRunning = false;
var status = 'failed';
var selectedNumber = '';
var isRegistered = false;
var response;
cron.schedule('*/5 * * * * *',()=>{
    if (sessionIsRunning || !authed) return null;

    sessionIsRunning = true;

    console.log('Make Connection');
    connection = mysql.createConnection(config.mysql);
    connection.connect();

    connection.query("SELECT * FROM notification where status = 'wait' ORDER BY created_at ASC LIMIT 1",async (error, results, fields)=>{

        if (error) {
            sessionIsRunning = false;
            throw error
        }

        if (results[0]){
            // check number
            selectedNumber = sanitizedNumber(results[0].number)
            console.log(selectedNumber);
            isRegistered = await client.isRegisteredUser(selectedNumber);

            if (isRegistered){
                response = await client.sendMessage(selectedNumber, results[0].message);
                if (response.id.fromMe) {
                    status = 'success';
                }else{
                    status = 'failed';
                }
            }else{
                status = 'undefined';
            }

            connection = mysql.createConnection(config.mysql);
            connection.connect();
            connection.query(`UPDATE notification SET status = '${status}' WHERE id = '${results[0].id}' `)
            connection.end();
        }
        sessionIsRunning = false;
    });
    connection.end();
})

function sanitizedNumber(number){
    return number.replace(/\D/gm,'').replace(/^(08|8)/gm,'628') + '@c.us';
}
