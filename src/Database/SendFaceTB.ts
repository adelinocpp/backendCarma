import SendFace from "../Models/SendFace";
import { AdminDbPool } from "./General";
// ----------------------------------------------------------------------------
async function listDataFromTable(id_list:string[]=[],clearEmbed:boolean=true,getBase64:boolean=false):Promise<SendFace[]>{
  console.log("id_list.length",id_list.length)
  var QS:string = ''
  if ((id_list.length === 0) || (id_list.length === undefined))
    QS = `SELECT * from tb_send_face;`
  else
    QS = `SELECT * from tb_send_face WHERE (id IN (${id_list.join(",")}));`

  console.log("QS",QS);
  let conn;
  let listOfIDs: SendFace[] = [];
  conn = await AdminDbPool.getConnection();
  try{
    const rows = await conn.query(QS);
    if (rows.length > 0){
      for (let i = 0; i < rows.length; i++){
        var tempKnowFace:SendFace = new SendFace(); 
        tempKnowFace.setId(rows[i].id.toString());
        tempKnowFace.setCreateDateTime(rows[i].created_at);
        tempKnowFace.setJsonFaceData(rows[i].json_face_data);
        tempKnowFace.setUserOwner(rows[i].id_user_owner);
        tempKnowFace.setAppendix(rows[i].appendix);
        tempKnowFace.setReportList(rows[i].json_report_list);
        if (clearEmbed)
          tempKnowFace.clearEmbedding();
        if (getBase64)
          tempKnowFace.loadBase64Data();
        listOfIDs.push(tempKnowFace);
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
      
    };