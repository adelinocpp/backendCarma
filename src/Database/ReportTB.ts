import Report from "../Models/Report";
import { AdminDbPool } from "./General";

async function listDataFromTable(clearEmbed=true):Promise<Report[]>{
    var QS:string = `SELECT * from tb_report;`
    // console.log("QS",QS);
    let conn;
    let listOfIDs: Report[] = [];
    conn = await AdminDbPool.getConnection();
    try{
      const rows = await conn.query(QS);
      if (rows.length > 0){
        for (let i = 0; i < rows.length; i++){
          var tempReport:Report = new Report(); 
          tempReport.setId(rows[i].id.toString());
          tempReport.setCreateDateTime(rows[i].created_at);
          tempReport.setUserOwner(rows[i].id_user_owner);
          tempReport.setIdShare((rows[i].id_share == null)?null: rows[i].id_share.toString());
          tempReport.setStatus(rows[i].status);
          tempReport.setSearchError(rows[i].json_error);
          tempReport.setSearchRequest(rows[i].json_request);
          tempReport.setFaceCompResult(rows[i].json_report);
          listOfIDs.push(tempReport);
        } 
      }
    } catch(err:any){
      console.log("ERROR em listDataFromTable() em KnowFaceTB: ", err.stack.split("at")[0]);
      throw(err);
    } finally{
        
    }
    if (conn) conn.end(); //release to pool
    return listOfIDs;
  }

// ----------------------------------------------------------------------------
export {listDataFromTable
    // checkTableExist,
    // getAllDataFromTable,
    // getListOfTablesByUserId,
};