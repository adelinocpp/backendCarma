import { StandardFields } from "./StandardFields";
import {AdminDbPool} from "../Database/General";
// import { ImageFileData } from "./ImageFileData";
// import {getEmbeddingModelVersion} from "../Database/General";
// import fs from "fs";
// import path from "path";
// import child from "child_process";
// import api from "../Services/api";
// import axios from "axios";
import {ISearchRequest,
    ISearchError,
    IFaceCompResult} from "./Interfaces";

//-----------------------------------------------------------------------------
class Report extends StandardFields{
  private id_user_owner: string = '';
  private id_share: string = '0'
  private status: string = '';
  private json_error: ISearchError = {};
  private json_request: ISearchRequest = {};
  private json_report: IFaceCompResult[] = [];
  constructor(){
      super();
  };
  //----------------------------------------------------------------------------
  setUserOwner(nUserOwner:string){this.id_user_owner = nUserOwner;};
  setIdShare(nIdShare:string){this.id_share = nIdShare;};
  setStatus(nStatus:string){this.status = nStatus;};
  setSearchError(nSearchError:ISearchError){this.json_error = nSearchError;};
  setSearchRequest(nSearchRequest:ISearchRequest){this.json_request = nSearchRequest;};
  setFaceCompResult(nFaceCompResult:IFaceCompResult[]){this.json_report = nFaceCompResult;};
  //----------------------------------------------------------------------------
  getStatus(){return this.status;};
  getUserOwner(){return this.id_user_owner;};
  getIdShare(){return this.id_share;};
  getSearchError(){return this.json_error;};
  //----------------------------------------------------------------------------
  async insertOnDatabase():Promise<boolean>{
    var returnSucess = false;
    let conn;
    conn = await AdminDbPool.getConnection();
    try{
        let querySetUser = `SET @user_id = '${this.id_user_owner}' `;
        const resp = await conn.query(querySetUser);
        let queryInsertUser = `INSERT INTO tb_report (id_user_owner,status,
                    json_error,json_request,json_report) 
                    VALUES ('${this.id_user_owner}','${this.status}',
                    '${JSON.stringify(this.json_error)}','${JSON.stringify(this.json_request)}',
                    '${JSON.stringify(this.json_report)}') RETURNING id;`
        
        // let queryInsertUser = `INSERT INTO tb_report (id_user_owner,status) 
        //             VALUES ('${this.id_user_owner}','${this.status}') RETURNING id;`                    

        console.log("Report queryInsertUser",queryInsertUser)
        // conn = await AdminDbPool.getConnection();
        const rows = await conn.query(queryInsertUser);
        this.id = rows[0].id.toString();
        console.log("rows.id",this.id);
        returnSucess = (rows.length > 0);
    } catch(err:any){
        console.log("ERROR em insertOnDatabase() na classe Report: ", err);
        throw(err);
    }  
    if (conn) conn.end(); //release to pool
    return returnSucess;
};
  //----------------------------------------------------------------------------
  async loadFromDatabaseById(id_report:string, id_user_owner:string):Promise<boolean>{
    var returnSucess = false;
    let conn;
    console.log("load Report this", this)
    // if((this.id != '') || (this.id_user_owner != ''))
    //     return returnSucess
    conn = await AdminDbPool.getConnection();
    try{
        let querySetUser = `SET @user_id = '${id_user_owner}' `;
        const resp = await conn.query(querySetUser);
        let queryInsertUser = `SELECT * FROM tb_report WHERE ((id = ${id_report}) AND (id_user_owner = '${id_user_owner}'));`
        console.log("loadFromDatabaseById:", queryInsertUser);
        // conn = await AdminDbPool.getConnection();
        const rows = await conn.query(queryInsertUser);
        console.log("load Report row", rows);
        if (rows.length > 0){
          this.id = rows[0].id.toString();
          this.created_at = rows[0].created_at;
          this.id_user_owner = rows[0].id_user_owner;
          this.id_share = (rows[0].id_share === null)? null: rows[0].id_share.toString();
          this.status = rows[0].status;
          this.json_error = rows[0].json_error;
          this.json_request = rows[0].json_request;
          this.json_report = rows[0].json_report;
          returnSucess = true;
        } else{
          returnSucess = false
        }
    } catch(err:any){
        console.log("ERROR em loadFromDatabaseById() na classe Report: ", err);
        throw(err);
    }  
    if (conn) conn.end(); //release to pool
    return returnSucess;
  };
  // --------------------------------------------------------------------------
  async updateInDatabaseById(){
    var returnSucess = false;
    let conn;
    conn = await AdminDbPool.getConnection();
    try{
        let querySetUser = `SET @user_id = '${this.id_user_owner}' `;
        const resp = await conn.query(querySetUser);
        // let queryInsertUser = `UPDATE tb_report (id_user_owner,id_share,status,
        //             json_error,json_request,json_report) 
        //             VALUES ('${this.id_user_owner}',${this.id_share},'${this.status}'
        //             '${JSON.stringify(this.json_error)}','${JSON.stringify(this.json_request)}',
        //             '${JSON.stringify(this.json_report)}') WHERE id = ${this.id};`
        // id_share = ${this.id_share}, status = '${this.status}',
        let queryInsertUser = `UPDATE tb_report SET id_user_owner = '${this.id_user_owner}', 
                          json_error = '${JSON.stringify(this.json_error)}', 
                          json_request = '${JSON.stringify(this.json_request)}',
                          json_report = '${JSON.stringify(this.json_report)}' WHERE id = ${this.id};`
        console.log("query in updateInDatabaseById",queryInsertUser);
        // conn = await AdminDbPool.getConnection();
        const rows = await conn.query(queryInsertUser);
        returnSucess = true;
    } catch(err:any){
      returnSucess = false;
      console.log("ERROR em updateInDatabaseById() na classe Report: ", err);
      throw(err);
    } 
    if (conn) conn.end(); //release to pool
    return returnSucess;
  }
}

export default Report;