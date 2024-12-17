import { Request, Response, NextFunction } from "express";
import { IImageFileData,ImageFileData } from "../Models/ImageFileData";
import KnowFace from "../Models/KnowFace";
import { listDataFromTable } from "../Database/KnowFaceTB";

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// ----------------------------------------------------------------------------
class KnowFacesController {  
  //---------------------------------------------------------------------------
  async postKnowFace(req: Request, res: Response) {
    var imageData:IImageFileData;
    var imageObject:ImageFileData;
    var logEmbed = 'aaa';
    var imageId:string = ''
    imageData = req.body.json_face_data;
    console.log("imageData",Object.keys(imageData))
    imageObject = new ImageFileData(imageData);
    let haveID = !(req.body.rg_mg === undefined) || !(req.body.cpf === undefined) || !(req.body.prontuario === undefined);
    
    if (imageObject.checkComplete() && haveID){
      var sendImageObj:KnowFace = new KnowFace();
      sendImageObj.setImageFileData(imageObject);
      await sendImageObj.setEmbeddingVersion();
      sendImageObj.setRGMG(req.body.rg_mg);
      sendImageObj.setCPF(req.body.cpf);
      sendImageObj.setProntuario(req.body.prontuario);
      sendImageObj.setObsoleto(req.body.obsoleto);
      await sendImageObj.insertOnDatabase();
      logEmbed = await sendImageObj.EmbedFace();
      imageId = sendImageObj.getId();
    }
    else{
      return res.status(422).json({ "id": '',
        "log": {"Imagem completa": imageObject.checkComplete(),
                "registros": haveID
                }
      });  
    }   
    return res.status(200).json({ "id": imageId,
                                  "log": logEmbed});
  }
  //---------------------------------------------------------------------------
  async getKnowFaceList(req: Request, res: Response) {
    var strList:string[] = [];
    var clearEmbed = true;
    var getBase64 = false
    if (req.body.id_know_faces !== undefined){
      strList = req.body.id_know_faces;
      getBase64 = true;
    }
    if (req.body.ignore_base64 !== undefined)
      getBase64 = !(req.body.ignore_base64.toUpperCase() === "TRUE")
     
    if (req.body.get_embedding !== undefined)
      clearEmbed = !(req.body.get_embedding.toUpperCase() === "TRUE");
    
    console.log(strList)
    var knowFacesList:KnowFace[] = [];
    let idList = await listDataFromTable(strList,clearEmbed,getBase64);
    console.log("idList", idList.length)
    for (let i = 0; i < idList.length; i++){
      let tempKnowFace :KnowFace = new KnowFace();
      tempKnowFace=idList[i] as KnowFace;
      knowFacesList.push(tempKnowFace);
    }
    return res.status(200).json({ "face_list": knowFacesList});
  }
  //---------------------------------------------------------------------------
}
export default new KnowFacesController();



