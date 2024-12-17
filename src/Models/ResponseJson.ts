if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
  // const mariadb = require('mariadb');
//   import {CheckToken,
//           GenerateToken,
//           FitData} from "../Cryptography/Authentication";
//   import { tokenInfoInterface, tokenReturnInterface } from "./Authentication";   
  // import { pgInterfaceUser} from "./User";   
//   import {AdminDbPool} from "../Database/General";
  
  // ------------------------------------------------------------------------
  export default class ResponseJSON {
    // --- Variaveis informativas do backend
    version: string;
    isRunning: boolean;
    databaseUp:boolean;
    helloMessage?: JSON;
    // --- Variaveis de altenticação de token de acesso
    autenticate: boolean;
    // tokenReturn: tokenReturnInterface;
    // tokenInfo!:tokenInfoInterface;
    // userData!:pgInterfaceUser;
    notAtackAccess?: boolean;
    accessmessage: string;
    // --- 
    loginData!:{
      login: boolean;
      ckUsername?: boolean;
      ckUserPassWord?: boolean;
      ckUserEmail?:boolean;
      verify?: boolean,
      passwordNeedUpdate?: boolean,
      message?: string
    };
    // --- 
    // --- Variaveis de informacoes do banco de dados
    //tableList?: string[];
    // --- Variaveis de retorno das tabelas (Dados praticamente brutos da tabela)
    tableData?: JSON;
    // --- Variaveis de retorno de requisicao
    requestData?: any;
    requestSucess?: boolean;
    feedbackString?: string;
    requestMessage?: string[];
    // --- 
    signUpData!: {
      signup: boolean,
      UserExist: boolean,
      EmailExist: boolean,
      Email: string,
      message: string
    };
  
    // ---
    closeAccountData!:{
      closeAccount: boolean;
      ckUser?: boolean;
      ckUserPassWord?: boolean;
      passwordNeedUpdate?: boolean,
      message?: string
    }
    // ----------------------------------------------------------------------------
    constructor(){
      this.version = (process.env.API_VERSION === null || process.env.API_VERSION === undefined)? "0.0.0": process.env.API_VERSION;
    //   this.tokenReturn = {accessToken: "", exp: new Date()};;
    //   this.tokenInfo = {id: -1, validy: false};
      this.isRunning = true;
      this.autenticate = false;
      this.databaseUp = false;
      this.notAtackAccess = true;
      this.requestSucess = false;
      this.accessmessage = ""
    };
    // ----------------------------------------------------------------------------
    deauthenticate(){
        this.autenticate = false;
        // this.tokenReturn = {accessToken: "", exp: new Date()};
        // this.tokenInfo = {id: -1, validy: false};
        // this.tableData = undefined;
        // this.rowData = undefined;
        //this.userData = {};
    };
    // ----------------------------------------------------------------------------
    databaseIsUp(){
        this.databaseUp = true;
    };
    // ----------------------------------------------------------------------------
    
    // ----------------------------------------------------------------------------
    // async processAccessToken(token:string,time:number = (<number>(process.env.TOKEN_VALIDITY == undefined? 24: <unknown>process.env.TOKEN_VALIDITY))*60*60){
    //     var tokenInfo:tokenInfoInterface = {id: -1, exp: "", validy: false};
    //     token = FitData(token);
    //     if (( token === undefined) || (token.length < 136)){
    //         return;
    //     }
    //     let date_now = new Date();
    //     try{
    //         tokenInfo = await CheckToken(token);
    //         let date_exp = new Date((Number(tokenInfo.exp) - 5) * 1000 ); // - date_now.getTimezoneOffset());
    //         let tokenRenevalTime = (<number>((process.env.TOKEN_RENEVAL_TIME === undefined) ? 1 : <unknown>process.env.TOKEN_RENEVAL_TIME))
    //         if (tokenInfo.validy && 
    //             ((date_exp.getTime() - date_now.getTime())/(3600*1000) <  tokenRenevalTime) ){
    //                 token = GenerateToken(tokenInfo.id.toString(),time);
    //                 tokenInfo = await CheckToken(token);
    //                 this.requestSucess = true;
    //         }
    //         this.databaseIsUp()
    //     } catch(err:any) {
    //         console.log("ERROR em processAccessToken() (token verify) em ResponseJSON: ", err.stack.split("at")[0]);
    //         throw err;
    //     } finally {
    //         this.tokenReturn = {accessToken: token, exp: new Date(Number(tokenInfo.exp) * 1000) };
    //         this.tokenInfo = tokenInfo;
    //         this.autenticate = (tokenInfo.validy === undefined ? false: tokenInfo.validy);
    //     }
    // }
  };