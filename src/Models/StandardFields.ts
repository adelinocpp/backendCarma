import { getEmbeddingModelVersion } from "../Database/General";
import { ImageFileData } from "./ImageFileData";
import { IFaceData } from "./Interfaces";
import fs from "fs";
import crypto  from "crypto";

class StandardFields{
    protected id: string = '';
    protected created_at:Date = new Date(); 
    getId(){return this.id;};
    getCreateDateTime(){return this.created_at;};
    setId(nId:string){this.id = nId;};
    setCreateDateTime(nCreated_at:Date){this.created_at = nCreated_at};
}

class HystoricalFields{
    protected action: string = 'insert';
    protected revision: string = '';
    protected revisor: string = '';
    protected changed_at:Date = new Date(); 
    getAction(){return this.action;};
    getRevision(){return this.revision;};
    getRevisor(){return this.revisor;};
    getChangeDateTime(){return this.changed_at;};
}

class Face extends StandardFields{
    protected id_user_owner: string = '';
    protected json_face_data: IFaceData = {};
    protected appendix:string = '';
    protected embedding_complete:boolean = false;
    constructor(){
        super();
    };
    //-------------------------------------------------------------------------
    setEmbeddingComplete(nEmbedding:boolean){this.embedding_complete = nEmbedding;};
    setUserOwner(nUserOwner:string){this.id_user_owner = nUserOwner;};
    setAppendix(nAppendix:string){this.appendix = nAppendix;};
    setJsonFaceData(jsonFaceData: IFaceData){
        this.json_face_data = jsonFaceData;
    }
    //-------------------------------------------------------------------------
    getEmbeddingComplete(){return this.embedding_complete;};
    getUserOwner(){return this.id_user_owner;};
    getAppendix(){return this.appendix;};
    getFullFilePath(){return this.json_face_data.face_image_path === undefined?"":this.json_face_data.face_image_path};
    //-------------------------------------------------------------------------
    clearEmbedding(){
        var clear_json_face_data: IFaceData = {};
        clear_json_face_data = this.json_face_data;
        clear_json_face_data.face_embedding = [];
        clear_json_face_data.face_plda = [];
        clear_json_face_data.embedding_version = '';
        this.json_face_data = clear_json_face_data;
    };
    //------------------------------------------------------------------------- 
    setImageFileData(nImageFileData:ImageFileData){
        let jsonFaceData:IFaceData = {};
        jsonFaceData.face_image_path = nImageFileData.getFullFilePath();
        jsonFaceData.hash_sha3 = nImageFileData.getHash();
        // console.log("jsonFaceData",jsonFaceData)
        this.json_face_data = jsonFaceData;
    }
    //------------------------------------------------------------------------- 
    loadBase64Data(){
      if (this.json_face_data.face_image_path !== undefined){
        console.log("loadBase64Data 1")
        let filename:string = this.json_face_data.face_image_path;
        let fileParts = filename.split(".");
        let fileExt:string = fileParts[fileParts.length-1]
        const hashsha3 = crypto.createHash('SHA3-224');
        var base64Data = fs.readFileSync(filename, {encoding: 'base64'});
        let hash_sha3_check = hashsha3.update(base64Data).digest("hex").toString();
        console.log("hash_sha3",this.json_face_data.hash_sha3)
        console.log("hash_sha3_check",hash_sha3_check)
        this.json_face_data.base64_data = `data:image/${fileExt};base64,` + base64Data;
      } 
    };
    //-------------------------------------------------------------------------
    async setEmbeddingVersion(){
        this.json_face_data.embedding_version = await getEmbeddingModelVersion();
    }
}

export {StandardFields, HystoricalFields, Face}
