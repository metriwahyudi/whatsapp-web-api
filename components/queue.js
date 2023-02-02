
const cron = require('node-cron');
const mysql = require('mysql');
const config = require("./../config.json");
const {stat} = require("fs");

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
var row;
cron.schedule('*/5 * * * * *',()=>{
    try{

        if (sessionIsRunning || !authed) return null;

        sessionIsRunning = true;

        connection = mysql.createConnection(config.mysql);
        connection.connect();
        connection.query("SELECT * FROM messages where status = 'waiting' ORDER BY created_at ASC LIMIT 10",async (error, results, fields)=>{

            if (error) {
                sessionIsRunning = false;
                io.emit('error',error);
                return null;
            }

            for (row of results){
                selectedNumber = sanitizedNumber(row.number);
                isRegistered = await client.isRegisteredUser(selectedNumber);
                if (isRegistered){
                    response = await client.sendMessage(selectedNumber, row.message);
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
                connection.query(`UPDATE messages SET status = '${status}' WHERE id = '${row.id}' `,(error)=>{
                    if (error) {
                        io.emit('error',error);
                    }else{
                        if (status === 'success'){
                            io.emit('log','[TERKIRIM] '+selectedNumber+' ('+row.reference_id+') ');
                        }
                        if (status === 'undefined'){
                            io.emit('log','[ERROR: Bukan nomor WhatsApp] '+selectedNumber+' ('+row.reference_id+') ');
                        }
                        if (status === 'failed'){
                            io.emit('log','[ERROR: GAGLAT] '+selectedNumber+' ('+row.reference_id+') ');
                        }
                    }
                })
                connection.end();
            }
            sessionIsRunning = false;
        });
        connection.end();
    }catch (e) {
        io.emit('error',e)
    }
})

function sanitizedNumber(number){
    return number.replace(/\D/gm,'').replace(/^(08|8)/gm,'628') + '@c.us';
}
