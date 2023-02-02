const { Server } = require("socket.io");

const config = require("./config.json");
const fs = require("fs");

global.io = new Server(global.app,{
    cors: {
        origin: "http://127.0.0.1:8000"
    }
});

io.on("connection", (socket) => {
    // ...
    //console.log('listen to '+config.websocket.port)
    if (authed){
        io.emit('log','CLIENT READY');

        /*socket.on('send',async (socket)=>{
            console.log(socket.data)
            if (socket.data.number && socket.data.message){
                isRegistered = await client.isRegisteredUser(socket.data.number);
                if (isRegistered){
                    response = await client.sendMessage(socket.data.number, socket.data.message);
                    if (response.id.fromMe) {
                        status = 'success';
                    }else{
                        status = 'failed';
                    }
                }else{
                    status = 'undefined';
                }
                if (status === 'success'){
                    socket.emit('log','[TERKIRIM] '+socket.data.number+' ');
                }
                if (status === 'undefined'){
                    socket.emit('log','[ERROR: Bukan nomor WhatsApp] '+socket.data.number+' ');
                }
                if (status === 'failed'){
                    socket.emit('log','[ERROR: GAGLAT] '+socket.data.number+' ');
                }
            }
        })*/
    }else {
        fs.readFile("components/last.qr", (err, last_qr) => {
            if (!err)
                io.emit('qr',`${last_qr}`);
        });
    }
});
var isRegistered, response, status;

io.listen(config.websocket.port);


function sanitizedNumber(number){
    return number.replace(/\D/gm,'').replace(/^(08|8)/gm,'628') + '@c.us';
}