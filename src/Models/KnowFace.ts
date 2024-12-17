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
import crypto  from "crypto";

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
  // clearEmbedding(){
  //   var clear_json_face_data: IFaceData = {};
  //   clear_json_face_data = this.json_face_data;
  //   clear_json_face_data.face_embedding = [];
  //   clear_json_face_data.face_plda = [];
  //   clear_json_face_data.embedding_version = '';
  //   this.json_face_data = clear_json_face_data;
  // };
  //-------------------------------------------------------------------------
  setRGMG(strValue:string){this.rg_mg = strValue;};
  //-------------------------------------------------------------------------
  setCPF(strValue:string){this.cpf = strValue;};
  //-------------------------------------------------------------------------
  setProntuario(strValue:string){this.prontuario = strValue;};
  //-------------------------------------------------------------------------
  setObsoleto(strValue:boolean){this.obsoleto = strValue;};
  //-------------------------------------------------------------------------
  // setJsonFaceData(jsonFaceData: IFaceData){
  //   this.json_face_data = jsonFaceData;
  // }
  // //-------------------------------------------------------------------------
  // getFullFilePath(){return this.json_face_data.face_image_path === undefined?"":this.json_face_data.face_image_path};
  // //------------------------------------------------------------------------- 
  // setImageFileData(nImageFileData:ImageFileData){
  //     let jsonFaceData:IFaceData = {};
  //     jsonFaceData.face_image_path = nImageFileData.getFullFilePath();
  //     jsonFaceData.hash_sha3 = nImageFileData.getHash();
  //     // console.log("jsonFaceData",jsonFaceData)
  //     this.json_face_data = jsonFaceData;
  // }
  // //------------------------------------------------------------------------- 
  // loadBase64Data(){
  //   if (this.json_face_data.face_image_path !== undefined){
  //     console.log("loadBase64Data 1")
  //     let filename:string = this.json_face_data.face_image_path;
  //     let fileParts = filename.split(".");
  //     let fileExt:string = fileParts[fileParts.length-1]
  //     const hashsha3 = crypto.createHash('SHA3-224');
  //     var base64Data = fs.readFileSync(filename, {encoding: 'base64'});
  //     let hash_sha3_check = hashsha3.update(base64Data).digest("hex").toString();
  //     console.log("hash_sha3",this.json_face_data.hash_sha3)
  //     console.log("hash_sha3_check",hash_sha3_check)
  //     this.json_face_data.base64_data = `data:image/${fileExt};base64,` + base64Data;
  //     // if (hash_sha3_check === this.json_face_data.hash_sha3){
  //     //   console.log("loadBase64Data 2")
  //     //   this.json_face_data.base64_data = base64Data;
  //     // }
  //   } 
  // };
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
          
          // let querySetUser = `SET @user_id = '${this.id_user_owner}' `;
          // const resp = await conn.query(querySetUser);
          let queryInsertUser = `SELECT * FROM tb_know_face WHERE (id = ${id_face});`
          // conn = await AdminDbPool.getConnection();
          const rows = await conn.query(queryInsertUser);
          // console.log("rows",rows[0].id)
          if (rows.length > 0){
            this.id = rows[0].id.toString();
            // console.log("id",rows[0].id.toString())
            this.created_at = rows[0].created_at;
            this.json_face_data = rows[0].json_face_data;
            this.rg_mg = rows[0].rg_mg;
            // console.log("rg_mg",rows[0].rg_mg)
            this.cpf = rows[0].cpf;
            this.prontuario = rows[0].prontuario;
            this.embedding_complete = rows[0].embedding_complete;
            returnSucess = true;
          } else{
            returnSucess = false
          }
      } catch(err:any){
          console.log("ERROR em loadFromDatabaseById() na classe KnowFace: ", err);
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
    // console.log("runScript",runScript)
    // console.log("commandString",commandString)
    if (runScript){
      try {
        returnValue.logChecaPython = "Executando python...";
        // console.log('Dir: ',__dirname)
        // console.log('Python comand: ',commandString)
        let result = child.execSync(commandString).toString();
        // let result = execProm(commandString).toString();
        returnValue.logChecaPython = result;
      }catch(e:any){
        returnValue.logChecaPython = "Problema na execução do codigo python...";
        throw e;
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
        
        // let querySetUser = `SET @user_id = '${this.id_user_owner}' `;
        // const resp = await conn.query(querySetUser);
        let queryInsertUser = `UPDATE tb_know_face SET json_face_data = '${JSON.stringify(this.json_face_data)}',
                rg_mg = '${this.rg_mg}', cpf='${this.cpf}',prontuario='${this.prontuario}',
                obsoleto = '${this.obsoleto}' WHERE id = ${this.id};`
        // conn = await AdminDbPool.getConnection();
        const rows = await conn.query(queryInsertUser);
        returnSucess = true;
    } catch(err:any){
      returnSucess = false;
      console.log("ERROR em updateInDatabaseById() na classe KnowFace: ", err);
      throw(err);
    } 
    if (conn) conn.end(); //release to pool
    return returnSucess; 
  }
  // --------------------------------------------------------------------------
}

export default KnowFace;