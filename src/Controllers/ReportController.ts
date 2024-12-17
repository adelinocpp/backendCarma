import { Request, Response, NextFunction } from "express";
import { IImageFileData,ImageFileData } from "../Models/ImageFileData";
import Report from "../Models/Report";
import { listDataFromTable } from "../Database/ReportTB";
import { FitData } from "../Database/General";

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// ----------------------------------------------------------------------------
class ReportController {  
    //---------------------------------------------------------------------------
    async getReportByID(req: Request, res: Response) {
      var returnReport:Report = new Report();
      let haveID = (req.body.id_user !== undefined) && (req.body.id_report !== undefined)
      var id_user:string = FitData(req.body.id_user);
      var id_report:string = FitData(req.body.id_report);
      var message:string = `Falha oa requerer o relatório com User: ${id_user} e relatório: ${id_report}`;
      console.log("haveID",haveID)
      if (haveID){
        await returnReport.loadFromDatabaseById(id_report,id_user);
        console.log("returnReport",returnReport)
        message = `Relatório ${id_report} do usuário ${id_user}.`;
      }
      return res.status(200).json({ "message":message,
                                    "report": returnReport
            });  
    }
    //---------------------------------------------------------------------------
    async getReportList(req: Request, res: Response) {
      var reportList:any[] = [];
      let idList = await listDataFromTable(true);
      console.log("idList", idList.length)
      for (let i = 0; i < idList.length; i++){
        let tempReport:any = {};
        tempReport= {"Report_id": idList[i].getId(),
                     "is_user_owner": idList[i].getUserOwner(),
                     "status": idList[i].getStatus(),
                     "id_share": idList[i].getIdShare(),
                     "error": idList[i].getSearchError()
        };
        reportList.push(tempReport);
      }
      console.log("Before return", reportList.length);
      console.log("Before return", reportList);
    //   return res.status(200).json({ "message":`Lista com ${reportList.length} elementos.`});

      return res.status(200).json({ "message":`Lista com ${reportList.length} elementos.`,
                                    "report_list": reportList});
    }
    //---------------------------------------------------------------------------
  }
  export default new ReportController();