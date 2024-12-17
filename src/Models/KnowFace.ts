import {AdminDbPool} from "../Database/General";
import fs from "fs";
import child from "child_process";
import { Face } from "./Face";
import axios from "axios";

//-----------------------------------------------------------------------------
class KnowFace extends Face{
  private rg_mg: string = '';
  private cpf: string = '';
  private prontuario: string = '';
  // private json_face_data: IFaceData = {};
  private obsoleto: boolean = false;
  constructor(){
      super();
  };
  //-------------------------------------------------------------------------
  getIdValues(){
    return {"rg_mg": this.rg_mg ,
            "cpf": this.cpf,
            "prontuario": this.prontuario
            }
  };
  //-------------------------------------------------------------------------
  setRGMG(strValue:string){this.rg_mg = strValue;};
  //-------------------------------------------------------------------------
  setCPF(strValue:string){this.cpf = strValue;};
  //-------------------------------------------------------------------------
  setProntuario(strValue:string){this.prontuario = strValue;};
  //-------------------------------------------------------------------------
  setObsoleto(strValue:boolean){this.obsoleto = strValue;};
  //-------------------------------------------------------------------------
  async insertOnDatabase():Promise<boolean>{
      var returnSucess = false;
      let conn;
      conn = await AdminDbPool.getConnection();
      try{
          // let querySetUser = `SET @user_id = '${this.id_user_owner}' `;
          // const resp = await conn.query(querySetUser);
          let queryInsertUser = `INSERT INTO tb_know_face (json_face_data,rg_mg,cpf,prontuario) 
                      VALUES ('${JSON.stringify(this.json_face_data)}',
                      '${this.rg_mg}','${this.cpf}','${this.prontuario}') RETURNING id;`
          // conn = await AdminDbPool.getConnection();
          const rows = await conn.query(queryInsertUser);
          this.id = rows[0].id.toString();
          console.log("rows.id",this.id);
          returnSucess = (rows.length > 0);
      } catch(err:any){
          console.log("ERROR em insertOnDatabase() na classe KnowFace: ", err);
          throw(err);
      } 
      if (conn) conn.end(); //release to pool
      return returnSucess; 
  };
  // --------------------------------------------------------------------------
  async loadFromDatabaseById(id_face:string):Promise<boolean>{
      var returnSucess = false;
      let conn;
      if(this.id != '')
          return returnSucess
      try{
          conn = await AdminDbPool.getConnection();
          let queryInsertUser = `SELECT * FROM tb_know_face WHERE (id = ${id_face});`
          const rows = await conn.query(queryInsertUser);
          if (rows.length > 0){
            this.id = rows[0].id.toString();
            this.created_at = rows[0].created_at;
            this.json_face_data = rows[0].json_face_data;
            this.rg_mg = rows[0].rg_mg;
            this.cpf = rows[0].cpf;
            this.prontuario = rows[0].prontuario;
            this.embedding_complete = rows[0].embedding_complete;
            returnSucess = true;
          } else
            returnSucess = false
      } catch(err:any){
          console.log("ERROR em loadFromDatabaseById() na classe KnowFace: ", err);
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
    // console.log("pythonScriptPath",pythonScriptPath)
    var commandString: string = `${process.env.PYTHON3_PATH as string} ${pythonScriptPath}  ${this.id} tb_know_face`;
    var runScript = true;
    if (!pythonScriptFileExist){
      returnValue = {
        sucesso: "FALSE",
        message: "Script python não existe!"
      }
      runScript = false
    }
    // INICIA O PROCESSO PARA EXECUTAR O SCIPT PYTHON
    if (runScript){
      // try {
      //   returnValue.logChecaPython = "Executando python...";
        
      //   let result = child.execSync(commandString).toString();
        
      //   returnValue.logChecaPython = result;
      // }catch(e:any){
      //   returnValue.logChecaPython = "Problema na execução do codigo python...";
      //   throw e;
      // }finally{
      //     return returnValue;
      // }
      let strTag:string = `id face: ${this.id}, id user: ${this.id_user_owner}`
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
  async updateInDatabaseById(){
    var returnSucess = false;
    let conn;
    conn = await AdminDbPool.getConnection();
    try{
        let queryInsertUser = `UPDATE tb_know_face SET json_face_data = '${JSON.stringify(this.json_face_data)}',
                rg_mg = '${this.rg_mg}', cpf='${this.cpf}',prontuario='${this.prontuario}',
                obsoleto = '${this.obsoleto}' WHERE id = ${this.id};`
        const rows = await conn.query(queryInsertUser);
        returnSucess = true;
    } catch(err:any){
      returnSucess = false;
      console.log("ERROR em updateInDatabaseById() na classe KnowFace: ", err);
      throw(err);
    } 
    if (conn) 
      conn.end(); 
    return returnSucess; 
  }
  // --------------------------------------------------------------------------
}

export default KnowFace;