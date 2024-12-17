import express from "express";
// import {Request, Response, NextFunction } from "express";
// import { urlencoded } from "body-parser";
import cors from "cors";
// import path from "path";
import helmet from "helmet";
import compression from "compression";

var registerLog:boolean = true;
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  registerLog = false;
}
// USE MARIADB versao 10.11.6
// ----------------------------------------------------------------------------
const app = express();
// app.use(express.urlencoded({ extended: true }))
// app.use(express.json())

// const HTTPS_PORT = process.env.HTTPS_PORT || 3000;
const HTTP_PORT = process.env.HTTP_PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(compression()) // compressão
app.use(helmet());// Segurança

// if (registerLog){
//   const httpLogger = require('./httpLogger')
//   const logger = require('./logger')
//   const morgan = require('morgan')
//   app.use(morgan('combined')) // log (sera que precisa?)
//   app.use(httpLogger)
//   app.use(logErrors)
//   app.use(errorHandler)
// }

app.use(express.json({limit: process.env.URL_ENCODED_LIMIT || '500mb' }));
app.use(cors({ credentials: true, origin: true, exposedHeaders: 'filename' }));
app.use(require("./routes"));
app.set('trust proxy', true);

// --- SEQUENCIA PARA HTTPS ---------------------------------------------------
// var fs = require('fs');
// var privateKeySSLFile = path.resolve(__dirname, "./sslcert/server.key");
// var certificateKeySSLFile = path.resolve(__dirname, "./sslcert/server.ctr");
// if (fs.existsSync(privateKeySSLFile) &&  fs.existsSync(certificateKeySSLFile)){
//   var https = require('https');
//   var privateKey = fs.readFileSync(privateKeySSLFile,'utf8');
//   var certificate = fs.readFileSync(certificateKeySSLFile,'utf8');
//   var credentials = {key: privateKey, cert: certificate};
  
//   app.all('*', ensureSecure); // Redireciona HTTP -> HTTPS 
//   https.createServer(credentials, app).listen(HTTPS_PORT);
//   console.log("Listen https port:",HTTPS_PORT);
// }
var http = require('http');
http.createServer(app).listen(HTTP_PORT);
var date = new Date()
let data_hora = date.toLocaleString('pt-BR')
console.log(`['${data_hora}']-----------------------------------------------------------------`);
console.log("Listen http port:",HTTP_PORT);
console.log("NODE_ENV:",process.env.NODE_ENV);

// --- Redireciona HTTP -> HTTPS ----------------------------------------------
// function ensureSecure(req: Request, res: Response, next: () => any){
//     if(req.secure)
//       return next(); // OK, continue
//     console.log("ensureSecure: ",req.hostname, req.url);
//     // res.redirect('https://' + req.hostname + req.url); // express 4.x
//     res.redirect('https://' + req.hostname + ":" + HTTPS_PORT + req.url);
// }
// ----------------------------------------------------------------------------
// function logErrors (err: any, req:Request, res:Response, next: NextFunction) {
//   console.error(err.stack)
//   next(err)
// }
// ----------------------------------------------------------------------------
// function errorHandler (err:any, req:Request, res:Response, next: NextFunction) {
//   res.status(500).send('Error!')
// }
// ----------------------------------------------------------------------------