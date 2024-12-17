import { Face, StandardFields } from "./StandardFields";
import {AdminDbPool} from "../Database/General";
import { ImageFileData } from "./ImageFileData";
import {getEmbeddingModelVersion} from "../Database/General";
import fs from "fs";
import path from "path";
import child from "child_process";
import api from "../Services/api";
import axios from "axios";
import {IReport, IFaceData} from "./Interfaces";
import Report from "./Report";

//-----------------------------------------------------------------------------
class SendFace extends Face{
  // private id_user_owner: string = '';
  private id_share: string = '0';
  private json_report_list: IReport[] = [];
  // private json_face_data: IFaceData = {};
  // private appendix:string = '';
  constructor(){
      super();
  };
  //-------------------------------------------------------------------------
  setReportList(nReport:IReport[]){this.json_report_list = nReport};
  //-------------------------------------------------------------------------
  // setImageFileData(nImageFileData:ImageFileData){
  //     let jsonFaceData:IFaceData = {};
  //     jsonFaceData.face_image_path = nImageFileData.getFullFilePath();
  //     jsonFaceData.hash_sha3 = nImageFileData.getHash();
  //     this.json_face_data = jsonFaceData;
  // }
  // //-------------------------------------------------------------------------
  // setUserOwner(nUserOwner:string){this.id_user_owner = nUserOwner;};
  // //-------------------------------------------------------------------------
  // setAppendix(nAppendix:string){this.appendix = nAppendix;};
  // //-------------------------------------------------------------------------
  // async setEmbeddingVersion(){
  //     this.json_face_data.embedding_version = await getEmbeddingModelVersion();
  // }
  //-------------------------------------------------------------------------
  async insertOnDatabase():Promise<boolean>{
      var returnSucess = false;
      let conn;
      conn = await AdminDbPool.getConnection();
      try{
          let querySetUser = `SET @user_id = '${this.id_user_owner}' `;
          const resp = await conn.query(querySetUser);
          let queryInsertUser = `INSERT INTO tb_send_face (id_user_owner,json_face_data,appendix,embedding_complete) 
                      VALUES ('${this.id_user_owner}','${JSON.stringify(this.json_face_data)}',
                      '${this.appendix}','${this.embedding_complete}') RETURNING id;`
                      
          // conn = await AdminDbPool.getConnection();
          const rows = await conn.query(queryInsertUser);
          this.id = rows[0].id.toString();
          console.log("rows.id",this.id);
          returnSucess = (rows.length > 0);
      } catch(err:any){
          console.log("ERROR em insertOnDatabase() na classe SendFace: ", err);
          throw(err);
      }
      if (conn) conn.end(); //release to pool
      return returnSucess;
  };
  // --------------------------------------------------------------------------
  async loadFromDatabaseById(id_face:string, id_user_owner:string):Promise<boolean>{
      var returnSucess = false;
      let conn;
      // if((this.id !== '0') || (this.id_user_owner !== ''))
      //     return returnSucess
      conn = await AdminDbPool.getConnection();
      try{
          let querySetUser = `SET @user_id = '${id_user_owner}' `;
          const resp = await conn.query(querySetUser);
          let queryInsertUser = `SELECT * FROM tb_send_face WHERE ((id = ${id_face}) AND (id_user_owner = '${id_user_owner}'));`
          // conn = await AdminDbPool.getConnection();
          const rows = await conn.query(queryInsertUser);
          // console.log("rows",rows)
          if (rows.length > 0){
            this.id = rows[0].id.toString();
            this.created_at = rows[0].created_at;
            this.id_user_owner = rows[0].id_user_owner;
            this.id_share = (rows[0].id_share === null)? null: rows[0].id_share.toString();
            this.json_report_list = rows[0].json_report_list;
            this.json_face_data = rows[0].json_face_data;
            this.appendix = rows[0].appendix;
            this.embedding_complete = rows[0].embedding_complete;
            returnSucess = true;
          } else{
            returnSucess = false
          }
      } catch(err:any){
          console.log("ERROR em loadFromDatabaseById() na classe SendFace: ", err);
          throw(err);
      }  
      if (conn) conn.end(); //release to pool
      return returnSucess;
  };
  // --------------------------------------------------------------------------
  async EmbedFace(force:boolean=false):Promise<any>{
    // const timeOut:number = 500; // milisegundos
    // const timeDelta:number = 10; // milisegundos

    var returnValue:any = {};
    var pythonScriptPath = process.env.FACE_EMBED_ROUTINE as string;
    var pythonScriptFileExist = fs.existsSync(pythonScriptPath);

    var embExist:boolean = this.json_face_data.face_embedding !== undefined;
    if (embExist && (!force)){
      console.log("Não codificou. Encodificação já existe e não força-se outra.")
      returnValue = {
        sucesso: "TRUE",
        message: "Encodificação já existe para este arquivo!"
      }
      return returnValue;
    }
    // console.log("pythonScriptPath",pythonScriptPath)
    var commandString: string = `${process.env.PYTHON3_PATH as string} ${pythonScriptPath}  ${this.id}`;
    console.log("Embed commandString",commandString)
    var runScript = true;
    if (!pythonScriptFileExist){
      returnValue = {
        sucesso: "FALSE",
        message: "Script python não existe!"
      }
      runScript = false
    }
    let strTag:string = `id face: ${this.id}, id user: ${this.id_user_owner}`
    // INICIA O PROCESSO PARA EXECUTAR O SCIPT PYTHON
    // console.log("runScript",runScript)
    // console.log("commandString",commandString)
    if (runScript){


      try {
        var cook_waiter_json = {
          "token":"qJT28XHm5ra8Ce4C",
          "command":commandString,
          "tag": strTag
        }
        returnValue.logChecaPython = "Executando python...";

        axios.defaults.insecureHTTPParser = true 
        var response = await axios.post("http://localhost:12142/queue", cook_waiter_json);
        console.log("response",response.data)
        // if (response.data.mensagem === "Comando executado"){
        //   console.log("Resposta cook and waiter recebida...")
        //   let buildReport:Report = new Report();
        //   await buildReport.loadFromDatabaseById(report_id,this.id_user_owner);
        //   buildReport.setStatus('QUEUE');
        //   await buildReport.updateInDatabaseById();
        //   console.log("buildReport QUEUE",buildReport)
        // }
        returnValue.EmbedData = response.data;
        

        /*
        
        // console.log('Dir: ',__dirname)
        // console.log('Python comand: ',commandString)
        let result = child.execSync(commandString).toString();
        // let result = execProm(commandString).toString();
        returnValue.logChecaPython = result;
        */
      }catch(err:any){
        console.log("ERROR em EmbedFace() na classe SendFace: ", err);
        returnValue.logChecaPython = "Problema na execução do codigo python...";
        throw(err);
      }finally{
          return returnValue;
      }

    }
  };
  // --------------------------------------------------------------------------
  async searchById(face_id:string, report_id:string,force_new=false, expand_result=false){
    try{
      this.id = face_id;
      await this.selectFromDatabaseById();
      
      var returnValue:any = {};
      var pythonScriptPath:string = process.env.FACE_SEARCH_ROUTINE as string;
      var pythonPath:string = process.env.PYTHON3_PATH as string;
      var commandString: string = `${pythonPath} ${pythonScriptPath} ${this.id} ${report_id} ${force_new} ${expand_result}`;
      var pythonScriptFileExist = fs.existsSync(pythonScriptPath);
      var runScript = true;
      if (!pythonScriptFileExist){
        returnValue = {
        sucesso: "FALSE",
        message: "Script python não existe!"
        }
        runScript = false
      }
      if (runScript){
        let strTag:string = `id face: ${this.id}, id user: ${this.id_user_owner}`
        try {
          var cook_waiter_json = {
              "token":"qJT28XHm5ra8Ce4C",
              "command":commandString,
              "tag": strTag
            }
          // var cook_waiter_json = {
          //   "insecureHTTPParser": true,
          //   "headers":{
          //     "Content-Type": "application/json",
          //     "Accept": "*/*",
          //     "Connection":"keep-alive"
          //   },
          //   "body": {
          //     "token":"qJT28XHm5ra8Ce4C",
          //     "command":commandString,
          //     "tag": strTag
          //   }
          // }
          //  http://127.0.0.1:12142/queue
          // TODO: enviar para cook and wait
          returnValue.logChecaPython = "Executando python...";
          console.log("cook_waiter_json",cook_waiter_json)
          
          // axios.post("http://localhost:12142/queue", { insecureHTTPParser: true }).then((response) => {
          //   console.log(response)
          // })
          axios.defaults.insecureHTTPParser = true 
          var response = await axios.post("http://localhost:12142/queue", cook_waiter_json);
          console.log("response",response.data)
          if (response.data.mensagem === "Comando executado"){
            console.log("Resposta cook and waiter recebida...")
            let buildReport:Report = new Report();
            await buildReport.loadFromDatabaseById(report_id,this.id_user_owner);
            buildReport.setStatus('QUEUE');
            await buildReport.updateInDatabaseById();
            console.log("buildReport QUEUE",buildReport)
          }
          returnValue.response = response.data;
        }catch(err:any){
          console.log("ERROR em searchById() na classe SendFace (etapa python): ", err);
          returnValue.logChecaPython = returnValue.logChecaPython + "Problema na execução do codigo python...";
          throw(err);
        }finally{
            return returnValue;
        }
      }
      //---
      await this.updateInDatabaseById();
    } catch(err:any){
      console.log("ERROR em insertOnDatabase() na classe SendFace: ", err);
      throw(err);
    }
    return returnValue
  };
  // --------------------------------------------------------------------------
  async selectFromDatabaseById(){
    var returnSucess = false;
    let conn;
    conn = await AdminDbPool.getConnection();
    try{
        let querySetUser = `SET @user_id = '${this.id_user_owner}' `;
        const resp = await conn.query(querySetUser);
        let queryInsertUser = `SELECT * FROM tb_send_face WHERE id = ${this.id};`
        // conn = await AdminDbPool.getConnection();
        const rows = await conn.query(queryInsertUser);
        console.log("rows",rows)
        if (rows.length > 0){
          this.id = rows[0].id.toString();
          this.created_at = rows[0].created_at;
          this.id_user_owner = rows[0].id_user_owner;
          this.id_share = (rows[0].id_share === null)? null: rows[0].id_share.toString();
          this.json_report_list = rows[0].json_report_list;
          this.json_face_data = rows[0].json_face_data;
          this.appendix = rows[0].appendix;
          this.embedding_complete = rows[0].embedding_complete;
          returnSucess = true;
        }
    } catch(err:any){
      returnSucess = false;
      console.log("ERROR em selectFromDatabaseById() na classe SendFace: ", err);
      throw(err);
    }  
    if (conn) conn.end(); //release to pool
    return returnSucess;
  }
  // --------------------------------------------------------------------------
  async updateInDatabaseById(){
    var returnSucess = false;
    let conn;
    if (this.id == '')
        return returnSucess
    conn = await AdminDbPool.getConnection();
    try{
        
        let querySetUser = `SET @user_id = '${this.id_user_owner}' `;
        const resp = await conn.query(querySetUser);
        //id_share = '${this.id_share}',
        let queryInsertUser = `UPDATE tb_send_face SET id_user_owner = '${this.id_user_owner}',
                  json_report_list='${this.json_report_list}',
                  json_face_data='${JSON.stringify(this.json_face_data)}',appendix = '${this.appendix}' 
                  WHERE id = ${this.id};`
        console.log("Send Face queryInsertUser",queryInsertUser)
        // conn = await AdminDbPool.getConnection();
        const rows = await conn.query(queryInsertUser);
        returnSucess = true;
    } catch(err:any){
      returnSucess = false;
      console.log("ERROR em updateInDatabaseById() na classe SendFace: ", err);
      throw(err);
    }
    if (conn) conn.end(); //release to pool
    return returnSucess;
  }
  // --------------------------------------------------------------------------
}

export default SendFace;