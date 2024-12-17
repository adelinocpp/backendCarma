// import mariadb from 'mariadb';
// import { dencriptString } from "../Cryptography/CryptoString";
// import child from "child_process";
import util from "util";
import path from "path";
// import { ExtractFileExt, ExtractFileName, FitData } from "../Cryptography/Authentication";
// import { itfTableDataAcess } from "../Models/User";
import mariadb, { PoolConfig } from 'mariadb';
import { IFaceData } from "../Models/Interfaces";
// ----------------------------------------------------------------------------
const connectionJsonAdmim = 
                        {host: process.env.DB_HOST,
                         port: process.env.DB_PORT, 
                         user: process.env.DB_USER,
                         password: process.env.DB_PASSWORD,
                         database: process.env.DB_DATABASE,
                         connectionLimit: 5
                        };
const connectionJsonWebUser = 
                        {host: process.env.DB_HOST,
                         port: process.env.DB_PORT,
                         user: process.env.DB_WEBUSER,
                         password: process.env.DB_WEBPASSWORD,
                         database: process.env.DB_DATABASE,
                         connectionLimit: 5};


const AdminDbPool = mariadb.createPool(<PoolConfig>connectionJsonAdmim);
const WebUserDbPool = mariadb.createPool(<PoolConfig>connectionJsonWebUser);
// ----------------------------------------------------------------------------
function FitData(data: string):string{
  var returnString: string = "";
  returnString = (data === undefined)? "": data;
  return returnString.replace(/\s/g, "");
}
// ----------------------------------------------------------------------------
async function GetDataFromTable(strTableName:string, ):Promise<any>{
}


// ----------------------------------------------------------------------------
async function searchHashInFaceTable(hash_sha3:string, strTableName:string):Promise<any>{
  var QS:string = `SELECT id, json_face_data from ${strTableName};`
  console.log("QS",QS)
  console.log("strTableName",strTableName);
  let conn;
  let listOfIDs: string[] = [];
  var json_face_data:IFaceData = {};
  conn = await AdminDbPool.getConnection();
  try{
    const rows = await conn.query(QS);
    if (rows.length > 0){
      // console.log("rows",rows)  
      for (let i = 0; i < rows.length; i++){
        json_face_data = rows[i].json_face_data;
        if (json_face_data.hash_sha3 === hash_sha3)
          listOfIDs.push(rows[i].id.toString());
      }
    }
  } catch(err:any){
    console.log("ERROR em searchHashInFaceTable() em General: ", err.stack.split("at")[0]);
    throw(err);
  } 
  if (conn) conn.end(); //release to pool
  return listOfIDs;
}
// ----------------------------------------------------------------------------
async function listIDsFromTable(strTableName:string):Promise<any>{
  var QS:string = `SELECT id from ${strTableName};`
  console.log("QS",QS);
  console.log("strTableName",strTableName);
  let conn;
  let listOfIDs: string[] = [];
  conn = await AdminDbPool.getConnection();
  try{
    const rows = await conn.query(QS);
    if (rows.length > 0){
      console.log("rows",rows)  
      for (let i = 0; i < rows.length; i++)
        listOfIDs.push(rows[i].id.toString());
    }
  } catch(err:any){
    console.log("ERROR em listIDsFromTable() em General: ", err.stack.split("at")[0]);
    throw(err);
  } 
  if (conn) conn.end(); //release to pool
  return listOfIDs;
}
// ----------------------------------------------------------------------------
async function listDatasFromTable(strTableName:string):Promise<any>{
  var QS:string = `SELECT * from ${strTableName};`
  console.log("QS",QS);
  console.log("strTableName",strTableName);
  let conn;
  let listOfIDs: any[] = [];
  conn = await AdminDbPool.getConnection();
  try{
    const rows = await conn.query(QS);
    if (rows.length > 0){
      // console.log("rows",rows)  
      for (let i = 0; i < rows.length; i++)
        listOfIDs.push(rows[i]);
    }
  } catch(err:any){
    console.log("ERROR em listIDsFromTable() em General: ", err.stack.split("at")[0]);
    throw(err);
  }
  if (conn) conn.end(); //release to pool
  return listOfIDs;
}
// ----------------------------------------------------------------------------
async function getEmbeddingModelVersion():Promise<string>{
  var QS:string = `SELECT * from tb_face_models ORDER BY created_at DESC LIMIT 1;`
    let conn;
    let modelName = "sepaelv2";
    conn = await AdminDbPool.getConnection();
    try{
      const rows = await conn.query(QS);
      if (rows.length > 0){
        // console.log("rows",rows)  
        modelName = rows.name;
      }
    } catch(err:any){
      console.log("ERROR em getEmbeddingModelVersion() em SendFacesController: ", err.stack.split("at")[0]);
      throw(err);
    } 
    if (conn) conn.end(); //release to pool
    return modelName
}
    // ----------------------------------------------------------------------------
async function CheckDataBase(){
    var QS:string = `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${process.env.DB_DATABASE}';`
    let conn;
    let databaseUp = false;
    conn = await AdminDbPool.getConnection();
    try{
      const rows = await conn.query(QS);
      databaseUp = (rows.length > 0);
    } catch(err:any){
      console.log("ERROR em checkDataBase() em ResponseJSON: ", err.stack.split("at")[0]);
      throw(err);
    }
    if (conn) conn.end(); //release to pool
    return databaseUp;
  };
//-------------------------------------------------------------------------
function checkID(uuid:string){
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid);
};
// ----------------------------------------------------------------------------
export {AdminDbPool, 
        WebUserDbPool,
        FitData,
        CheckDataBase,
        checkID,
        getEmbeddingModelVersion,
        listIDsFromTable,
        searchHashInFaceTable,
        listDatasFromTable
    };