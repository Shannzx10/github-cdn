// xziyy
const chalk = require('chalk')
const figlet = require('figlet')

const Connecting = async ({update, fuzzy, Boom, DisconnectReason, startBotz}) => {
const { connection, lastDisconnect } = update;
try{
if (connection === 'close') {
let reason = new Boom(lastDisconnect?.error)?.output.statusCode
if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete Session and Verifikasi Again`); fuzzy.logout(); }
else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting...."); startBotz(); }
else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting..."); startBotz(); }
else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); fuzzy.logout(); }
else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Verifikasi Again And Run.`); fuzzy.logout(); }
else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); startBotz(); }
else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); startBotz(); }
else fuzzy.end(`Unknown DisconnectReason: ${reason}|${connection}`)
} if (update.connection == "open" || update.receivedPendingNotifications == "true") {
// succes Console log
     console.log(figlet.textSync('Mayura Bot', {
      font: 'Standard',
      horizontalLayout: 'default',
      vertivalLayout: 'default',
      whitespaceBreak: false
     }))
}
} catch (err) {
console.log('Error Di Connection.update '+err)
}
}
   
   module.exports = { Connecting }       