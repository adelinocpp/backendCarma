import { Request, Response, NextFunction } from "express";
import ResponseJSON from "../Models/ResponseJson"
import { CheckDataBase} from "../Database/General"
// import { encriptString, generatePrefixFrontEnd, stringInvalid } from "../Cryptography/CryptoString";
// import {UserRegistry} from "../Database/UserRegistry";
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
// ----------------------------------------------------------------------------
const checkUserId = function (id_user:string):boolean{
  var returnValue:boolean = false;
  // console.log("id_user:",id_user)
  if ((id_user != undefined) && (id_user != null) && (id_user !== "")){
    // TODO: check is masp or CPF?
    let IdVal = Number(id_user);
    // console.log("IdVal:",IdVal);
    returnValue = !isNaN(IdVal);
    // console.log("!isNaN(IdVal):",returnValue);
  }
  return returnValue;
}
// ----------------------------------------------------------------------------
const checkToken = function (req: Request, res: Response, next: NextFunction){
    var checkPass = false, checkUser = false;
    var AuthPair:string[] | undefined = req.headers.authorization?.split(" ")
    // console.log("checkToken function - req.headers.authorization: ",req.headers.authorization)
    // console.log("checkToken function - req.body: ",req.body)
    try {
      
      // console.log("checkToken function - AuthPair: ",AuthPair)
      if (AuthPair !== undefined)
        checkPass = (checkPass || (AuthPair[0] == "Bearer") && (AuthPair[1] == process.env.TOKEN_ACCESS));
      // var reqBody = req.body;
      if (checkUserId(req.body.id_user as string))
        checkUser = true
    } catch (e) {
      // console.log("Falha na checagem do token.")
    } finally{
      // console.log("checkToken function - checkPass: ",checkPass)
      // console.log("checkToken function - checkUser: ",checkUser)
      if (checkPass && checkUser)
        return next();
      else
        return res.status(401).json({
            "message": "Não autorizado. Precisa enviar um id_user numérico válido"
            // "data": [req.headers.authorization, checkPass, checkUser],
            // "AuthPair": AuthPair,
            // "req.body":req.body
            });
    }
}
// ----------------------------------------------------------------------------
class BackEndController {  
  async statusBackEnd(req: Request, res: Response) {
    /**
     * requisição do tipo get que retorna apenas uma mensagem de bas vindas de estatus do servidor
     */
    var response = new ResponseJSON();
    var databaseUp:boolean = false;
    try {
      databaseUp = await CheckDataBase();
    } catch(e:any){
      console.log("ERROR from statusBackEnd() in BackEndController: ", e.stack.split("at")[0]);
    } finally{
      let JSONmessage = {Mensagem: "Olá esta é a página de testes de acesso a API Orumilá para Reconhecimento Facial!",
                  HEADERS: req.headers,
                  IP: req.ip,
                  IPS: req.ips,
                  hostname: req.hostname,
                  Original_URL: req.originalUrl,
                  PARAMS: req.params,
                  QUERY: req.query,
                  BODY: req.body,
                  URL:req.url};
      response.helloMessage = JSON.parse(JSON.stringify(JSONmessage));
      response.isRunning = true;
      response.databaseUp = databaseUp;
      response.requestSucess = true;
      
      return res.status(200).json(response);
    }
  }
  // ------------------------------------------------------------------------
  // async encriptSequence(req: Request, res: Response){
  //   var response = new ResponseJSON();
  //   // await response.processAccessToken(req.body.accessToken);
  //   // response.databaseIsUp();
  //   let JSONmessage = {"encript":"","phrase":"","id":""};
  //   if (req.query.key === process.env.SHA256_KEY){
  //     response.requestSucess = true;
  //     JSONmessage = { "encript": encriptString(req.query.phrase as string,req.query.id as string),
  //     "phrase": req.query.phrase as string,
  //     "id": req.query.id as string};
  //   }
  //   response.requestData = JSON.parse(JSON.stringify(JSONmessage));
  //     return res.status(200).json(response);
  // }
    // ------------------------------------------------------------------------
    // async checkAcessToken(req: Request, res: Response){
    //   var response = new ResponseJSON();
    //   await response.processAccessToken(req.body.accessToken);
    //   response.databaseIsUp();
    //   response.requestSucess = true;
    //   await StoreLogAccess("-1",req,true);
    //   return res.status(200).json(response);
    // }
  // ------------------------------------------------------------------------
}
export default new BackEndController();
export {checkToken}
