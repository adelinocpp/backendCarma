import {AdminDbPool} from "../Database/General";
import fs from "fs";
import axios from "axios";
import {IReport, IFaceData} from "./Interfaces";
import Report from "./Report";
import { Face } from "./Face";

//-----------------------------------------------------------------------------
class SendFace extends Face{
  private id_share: string = '0';
  private json_report_list: IReport[] = [];
  constructor(){
      super();
  };
  //-------------------------------------------------------------------------
  setReportList(nReport:IReport[]){this.json_report_list = nReport};
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
      conn = await AdminDbPool.getConnection();
      try{
          let querySetUser = `SET @user_id = '${id_user_owner}' `;
          const resp = await conn.query(querySetUser);
          let queryInsertUser = `SELECT * FROM tb_send_face WHERE ((id = ${id_face}) AND (id_user_owner = '${id_user_owner}'));`
          const rows = await conn.query(queryInsertUser);
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
    if (runScript){
      try {
        var cook_waiter_json = {
          "token":"qJT28XHm5ra8Ce4C",
          "command":commandString,
          "tag": strTag,
          "config": "assync"
        }
        returnValue.logChecaPython = "Executando python...";
        axios.defaults.insecureHTTPParser = true 
        var response = await axios.post("http://localhost:12142/queue", cook_waiter_json);
        console.log("response",response.data)
        returnValue.EmbedData = response.data;
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
          returnValue.logChecaPython = "Executando python...";
          console.log("cook_waiter_json",cook_waiter_json)
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
      console.log("ERROR em searchById() na classe SendFace: ", err);
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