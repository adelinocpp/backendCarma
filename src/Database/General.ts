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
// function solveTableAccess(tableName: string, userId:string):itfTableDataAcess{
//     var returnValue:itfTableDataAcess = {user_id: parseInt(userId),
//                                         table_name: tableName,
//                                         can_access: false,
//                                         can_select_all: false,
//                                         can_select_yours: false,
//                                         can_insert: false,
//                                         can_edit: false,
//                                         can_edit_yours: false,
//                                         can_decript:false,
//                                         view_deactivate: false};
//     returnValue.id_key = (tableName === "access_keys")? "id": "access_keys_id";
//     if (returnValue.user_id === 1){
//         returnValue.can_access = true;
//         returnValue.can_select_all = true;
//         returnValue.can_select_yours = true;
//         returnValue.can_insert = true;
//         returnValue.can_edit = true;
//         returnValue.can_edit_yours = true;
//         returnValue.can_decript = true;
//         returnValue.view_deactivate = true;
//     } else{
//         if (tableName === "access_keys"){
//             returnValue.can_access = true;
//             returnValue.can_select_all = false;
//             returnValue.can_select_yours = true;
//             returnValue.can_insert = false;
//             returnValue.can_edit = false;
//             returnValue.can_edit_yours = true;
//             returnValue.can_decript = true;
//             returnValue.view_deactivate = false;
//         }
//         if (tableName === "audio_file"){
//             returnValue.can_access = true;
//             returnValue.can_select_all = true;
//             returnValue.can_select_yours = true;
//             returnValue.can_insert = false;
//             returnValue.can_edit = false;
//             returnValue.can_edit_yours = true;
//             returnValue.can_decript = true;
//             returnValue.view_deactivate = false;
//         }
//     }
//     return returnValue;
// }
// ----------------------------------------------------------------------------
// function decriptTable(result: any): any[]{
//     var tableNames:any = [];
//     var id:string;

//     for (let i = 0; i < result.rowCount; i++){
//         var obj = result.rows[i];
//         var keys = Object.keys(result.rows[i]);
//         if (keys.length == 0){
//             obj = {};
//         } else {
//             id = result.rows[i].id;
//             for (let j = 0; j < keys.length; j++) {
//                 if (obj[keys[j]] == null){
//                     obj[keys[j]] = obj[keys[j]]
//                     continue;
//                 }
//                 // console.log("keys[j]",keys[j])
//                 let n = obj[keys[j]].length;
//                 let power_of_2: boolean = ((n > 15) && ((n & (n-1)) == 0));
//                 if ( ( (keys[j] === "user_name") || (keys[j] === "email") || // (keys[j] === "userpw") ||
//                        (keys[j] === "access_key") )
//                     &&  power_of_2) {
//                         // console.log("keys[j]",keys[j], id);
//                         obj[keys[j]] = dencriptString(obj[keys[j]],id);
//                 }
//             }
//         }
//         tableNames.push(obj); 
//     }
//     return tableNames;
// }
// ----------------------------------------------------------------------------
// function deliveryTable(result: any): any[]{
//     var tableNames:any = [];
//     var id:string;

//     for (let i = 0; i < result.rowCount; i++){
//         var obj = result.rows[i];
//         var keys = Object.keys(result.rows[i]);
//         if (keys.length == 0){
//             obj = {};
//         } else {
//             id = result.rows[i].id;
//             for (let j = 0; j < keys.length; j++) {
//                 if (obj[keys[j]] == null){
//                     obj[keys[j]] = obj[keys[j]]
//                     continue;
//                 }
                
//                 switch (keys[j])
//                 {
//                     case "file_full_path":
//                         let filepath = obj[keys[j]];
//                         let fileName = ExtractFileName(filepath);
//                         if (ExtractFileExt(filepath) === 'zip')
//                             obj[keys[j]] = fileName;
//                         else
//                             obj[keys[j]] = fileName.slice(33);
//                         break;
//                     // case "file_full_path":
//                     //     filepath = obj[keys[j]];
//                     //     fileParts = filepath.split('/');
//                     //     obj[keys[j]] = fileParts[fileParts.length-1];
//                     //     break;
//                     default:
//                         obj[keys[j]] = obj[keys[j]];
//                         break;
//                 }
//             }
//         }
//         tableNames.push(obj); 
//     }
//     return tableNames;
// }
// ----------------------------------------------------------------------------
// async function InsertOnTable(tableName: string, Data: any):Promise<string>{
//     var returnValue: string = "-1";
//     const pool = new Pool({ connectionString: connectionStringAdmim });
//     var tableNames:string[] = [];
//     try{
//         const result = await pool
//             .query("insert * from information_schema.tables WHERE table_schema='public'");
//         pool.end();
//         if (result.rowCount > 0){    
//             for(let i = 0; i < result.rowCount; i++)
//                 tableNames.push(result.rows[i].table_name);      
//         }
//     } catch (e:any){
//         "ERROR from getPublicTables() in General: ", e.stack.split("at")[0]);
//     } finally{
//         return returnValue;
//     }
// }
// ----------------------------------------------------------------------------
// async function RemoveOfTableById(tableName: string, id: string):Promise<string>{
//     return "-1";
// }
// // ----------------------------------------------------------------------------
// async function UpdateInTableById(tableName: string, id: string, fieldName: string, Data: any):Promise<string>{
//     return "-1";
// }
// -* } catch (e:any) {
//         console.log("ERROR from CheckDataBase() in General: ", e.stack.split("at")[0]);
//     } finally{
//         return dbIsUp;
//     }
// };
// ----------------------------------------------------------------------------
// async function getTables():Promise<string[]> {
//     const pool = new Pool({ connectionString: connectionStringAdmim });
//     var tableNames:string[] = [];
//     try{
//         const result = await pool
//             .query("select * from information_schema.tables WHERE table_schema='public'");
//         pool.end();
//         if (result.rowCount > 0){    
//             for(let i = 0; i < result.rowCount; i++)
//                 tableNames.push(result.rows[i].table_name);      
//         }
//     } catch (e){
//         console.log("ERROR from getPublicTables() in General: ", e.stack.split("at")[0]);
//     } finally{
//         return tableNames;
//     }
// }
// ----------------------------------------------------------------------------
// async function checkTableExist(tableName: string):Promise<boolean> {
//     // const pool = mariadb.createPool(connectionJsonAdmim);
//     var tableExist:boolean = false,
//         // queryString:string = "select $1 from information_schema.tables WHERE table_schema='public'";
//         queryString:string = "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE  table_schema ='public' AND table_name = $1);";
//     try{
//         // const result = await pool
//         //     .query(queryString,[tableName]);
//         // pool.end();
//         // tableExist = result.rows[0].exists
//     } catch (e:any){
//         console.log("ERROR from checkTableExist() in General: ", e.stack.split("at")[0]);
//     } finally {
//         return tableExist;
//     }
// }
// ----------------------------------------------------------------------------
// async function getAllDataFromTable(tableName: string, user_id: string = "-1", deactivate: boolean = false, decript:boolean = false):Promise<any[]> {
//     const pool = new Pool({ connectionString: connectionStringAdmim });
//     var tableNames:any = [], QS, userid_QS, deactivate_QS: string;
//     var qsTableName, qsUserId;
//     if (tableName === undefined)
//         return tableNames; 
//     qsTableName = FitData(tableName);
//     qsUserId = FitData(user_id)
//     var userAccess:itfTableDataAcess = solveTableAccess(qsTableName,qsUserId);
//     if (!(userAccess.can_access as boolean))
//         return tableNames;
//     decript = decript && (userAccess.can_decript as boolean);
//     deactivate = deactivate && (userAccess.view_deactivate as boolean);

//     QS = `select * from ${qsTableName}`;

//     if (userAccess.can_select_all as boolean){
//         if (!deactivate)
//             QS += ` WHERE (active_record = TRUE);`;
//     } else if (userAccess.can_select_yours as boolean){
//         if (!deactivate)
//             QS += ` WHERE (${userAccess.id_key}=${qsUserId} AND active_record = TRUE);`;
//         else
//             QS += ` WHERE (${userAccess.id_key}=${qsUserId});`;
//     }
//     // console.log("getAllDataFromTable, QS:",QS)
//     try{
//         var result = await pool
//             .query(QS);
//         pool.end();
//         if (decript){
//             // console.log("decript",tableName)
//             tableNames = decriptTable(result);
//         } else {
//             tableNames = deliveryTable(result);
//             // for(let i = 0; i < result.rowCount; i++)
//             //     tableNames.push(result.rows[i]); 
//         }
//     } catch (e){
//         console.log("ERROR from getAllDataFromTable() in General: ", e); //e.stack.split("at")[0]
//     } finally {
//         return tableNames;
//     }
// }
// ----------------------------------------------------------------------------
// async function getListOfTablesByUserId(userID: string):Promise<string[]> {
//     const pool = new Pool({ connectionString: connectionStringAdmim });
//     var tableNames:string[] = [];
//     try{
//         const result = await pool
//             .query("select * from information_schema.tables WHERE table_schema='public'");
//         for(let i = 0; i < result.rowCount; i++){
//             let tempTableName = result.rows[i].table_name;
//             if (checkUsergetTable(userID,tempTableName))
//                 tableNames.push(result.rows[i].table_name);
//         }
//         pool.end();
//     } catch (e:any){
//         console.log("ERROR from getPublicTables() in General: ", e.stack.split("at")[0]);
//     } finally{
//         return tableNames;
//     }
// }
// ----------------------------------------------------------------------------
// function checkUsergetTable(userID: string, tableName:string):boolean{
//     var returnValue: boolean = false;
//     if (userID === '1')
//         returnValue = true
//     else if (tableName === 'audio_file')
//         returnValue = true
//     return returnValue;
// }
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
        // checkTableExist,
        // getAllDataFromTable,
        // getListOfTablesByUserId,
    };