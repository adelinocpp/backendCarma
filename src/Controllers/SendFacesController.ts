import { Request, Response, NextFunction } from "express";
import { IImageFileData,ImageFileData } from "../Models/ImageFileData";
import SendFace from "../Models/SendFace";
import {FitData, listIDsFromTable, searchHashInFaceTable} from "../Database/General";
import Report from "../Models/Report";
import { ISearchRequest } from "../Models/Interfaces";
import { listDataFromTable } from "../Database/SendFaceTB";
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// ----------------------------------------------------------------------------
class SendFacesController {  
  async postUnknowFace(req: Request, res: Response) {
    var imageData:IImageFileData;
    var imageObject:ImageFileData;
    var logEmbed = '';
    var imageId:string = '';
    imageData = req.body.json_face_data;
    imageObject = new ImageFileData(imageData);

    if (imageObject.checkComplete()){
      var sendImageObj:SendFace = new SendFace();
      sendImageObj.setImageFileData(imageObject);
      await sendImageObj.setEmbeddingVersion();
      sendImageObj.setAppendix(req.body.appendix);
      sendImageObj.setUserOwner(req.body.id_user);
      await sendImageObj.insertOnDatabase();
      logEmbed = await sendImageObj.EmbedFace();
      imageId = sendImageObj.getId();
    }   
    return res.status(200).json({ "id": imageId,
                                  "log": logEmbed});
  }
  //---------------------------------------------------------------------------
  async postSearchById(req: Request, res: Response) {
    var imageData:IImageFileData = {};
    var imageObject = new ImageFileData(imageData);
    var sendImageObj:SendFace = new SendFace();
    sendImageObj.setImageFileData(imageObject);

    //TODO: Ajustar essa chamada
    let buildReport:Report = new Report();
    buildReport.setUserOwner(req.body.id_user);
    let json_search_request:ISearchRequest = req.body

    let json_Image_data: IImageFileData = req.body.json_face_data;
    json_Image_data.base64_data = ""
    json_search_request.json_face_data = json_Image_data;
    buildReport.setSearchRequest(json_search_request);
    await buildReport.insertOnDatabase();

    let reportData = await sendImageObj.searchById(req.body.id_face,buildReport.getId(),true);

    return res.status(200).json({ "base": "nada",
                                  "report": reportData});
  }   
  //---------------------------------------------------------------------------
  async postEncodeUnknowFace(req: Request, res: Response) {

    var id_face = FitData(req.body.id_face);
    var id_user = FitData(req.body.id_user);
    var force = FitData(req.body.force).toUpperCase() === 'TRUE'? true:false;
    var logEmbed = 'aaa';
    var imageId:string = ''

    var sendImageObj:SendFace = new SendFace();
    imageId = sendImageObj.getId();
    // console.log("imageId",imageId)
    await sendImageObj.loadFromDatabaseById(id_face,id_user)
    imageId = sendImageObj.getId();
    // console.log("imageId",imageId)
    logEmbed = await sendImageObj.EmbedFace(force);
    imageId = sendImageObj.getId();
    // console.log("imageId",imageId)
    
    return res.status(200).json({ "id": imageId,
                                  "log": logEmbed});
  }
  //---------------------------------------------------------------------------
  async postSearchUnknowFace(req: Request, res: Response) {
    var imageData:IImageFileData;
    var imageObject:ImageFileData;
    let logEmbed:string = 'golfinhos\n';
    let logSearch:string = 'golfinhos too\n';
    var imageId:string = ''
    imageData = req.body.json_face_data;
    var force_new = FitData(req.body.force_new).toUpperCase() === 'TRUE'? true:false;
    var expand_result = FitData(req.body.expand_result).toUpperCase() === 'TRUE'? true:false;
    // var user_owner = req.body.id_user;
    imageObject = new ImageFileData(imageData);  
    var reportData: any = {};
    var reportId = '0';
    if (imageObject.checkComplete()){
      var sendImageObj:SendFace = new SendFace();
      sendImageObj.setImageFileData(imageObject);
      await sendImageObj.setEmbeddingVersion();
      sendImageObj.setAppendix(req.body.appendix);
      sendImageObj.setUserOwner(req.body.id_user);

      await sendImageObj.insertOnDatabase();
      logEmbed = await sendImageObj.EmbedFace();
      imageId = sendImageObj.getId();
      logSearch = "Vai EXECUTAr"
      let buildReport:Report = new Report();
      buildReport.setUserOwner(req.body.id_user);
      let json_search_request:ISearchRequest = req.body
      let json_Image_data: IImageFileData = req.body.json_face_data;
      json_Image_data.base64_data = ""
      json_search_request.json_face_data = json_Image_data;
      buildReport.setSearchRequest(json_search_request);
      await buildReport.insertOnDatabase();
      reportId = buildReport.getId();
      reportData = await sendImageObj.searchById(imageId,buildReport.getId(),expand_result);

      // TODO: Como tratar envio de de imagens duplicadas.
      /*
      let idList = await searchHashInFaceTable(imageObject.getHash(),"tb_send_face");
      console.log("idList",idList)
      if ((idList.length == 0) || (force_new)){
        await sendImageObj.insertOnDatabase();
        logEmbed = await sendImageObj.EmbedFace();
        imageId = sendImageObj.getId();
        logEmbed = 'VAI EXECUTAR';
        // reportData = await sendImageObj.searchById(imageId,force_new,expand_result);
      } else{
        // TODO: Como tratar envio de de imagens duplicadas.
        // Retorna id do relatório pronto?
        var getSendFaces:SendFace = new SendFace();
        for (let i = 0; i < idList.length; i++){
          getSendFaces = new SendFace();
          await getSendFaces.loadFromDatabaseById(idList[i].toString(),user_owner)
          if (getSendFaces.getId() !== ''){
            logEmbed = logEmbed + `Arquivo duplicado em ID ${idList[i]} mas de outro usuario.`
          } else
            logEmbed = logEmbed + `Arquivo duplicado em ID ${idList[i]} relatorio ja existe.`
        }
      }
      */
      
    }
    else{
      return res.status(422).json({ "id": reportId,
        "log": {"Imagem completa": imageObject.checkComplete()
                }
      }); 
    }
    return res.status(200).json({ "id_report": reportId,
      "log_Embed": logEmbed,
      "log_search": logSearch,
      "reportData": reportData});
  }
  //---------------------------------------------------------------------------
  async getSendFaceList(req: Request, res: Response) {
    var strList:string[] = [];
    var clearEmbed = true;
    var getBase64 = false
    if (req.body.id_send_faces !== undefined){
      strList = req.body.id_send_faces;
      getBase64 = true;
    }
    if (req.body.ignore_base64 !== undefined)
      getBase64 = !(req.body.ignore_base64.toUpperCase() === "TRUE")
     
    if (req.body.get_embedding !== undefined)
      clearEmbed = !(req.body.get_embedding.toUpperCase() === "TRUE");

    console.log(strList)
    var sendFacesList:SendFace[] = [];
    let idList = await listDataFromTable(strList,clearEmbed,getBase64);
    console.log("idList", idList.length)
    for (let i = 0; i < idList.length; i++){
      let tempSendFace :SendFace = new SendFace();
      tempSendFace=idList[i] as SendFace;
      sendFacesList.push(tempSendFace);
    }
    return res.status(200).json({ "face_list": sendFacesList});
  }
}
export default new SendFacesController();
