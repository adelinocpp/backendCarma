import crypto  from "crypto";
import fs from "fs";
import {IImageFileData} from "./Interfaces";

// ----------------------------------------------------------------------------
const sanatiFileName = function(nFileName:string):string{
    const newStr = nFileName.replace(/[^A-Za-z0-9.]/g, '');
    return newStr;
}
// ----------------------------------------------------------------------------
class ImageFileData{
    private base64_data:string = '';
	private original_file_name:string = '';
    private current_full_file_path = '';
	private hash_sha3:string = '';
    private is_complete:boolean = false;
    constructor(nImgData:IImageFileData){
        var strFormat: string = '';
        var ckData64  = false, ckFileName = false;
        //console.log("nImgData.base64_data !== undefined",nImgData.base64_data === undefined)
        if (! (nImgData.base64_data === undefined)){
            let isImageData: boolean = nImgData.base64_data.split("/")[0] === 'data:image';
            let isMinSize: boolean = (nImgData.base64_data.length > 66);
            let baseFirstStr:string = nImgData.base64_data.split("/")[1]
            strFormat = baseFirstStr.split(';')[0];
            let isFormat: boolean = (strFormat === 'jpg') || (strFormat === 'png') || (strFormat === 'jpeg');
            if (isImageData && isMinSize && isFormat){
                this.base64_data = nImgData.base64_data;
                ckData64 = true;
            }
        }
        if (nImgData.file_name !== undefined){
            // console.log(nImgData.file_name)
            let fileParts = nImgData.file_name.split(".");
            let fileExt = fileParts[fileParts.length-1];
            // console.log(fileExt)
            if(fileExt === strFormat){
                this.original_file_name = nImgData.file_name
                ckFileName = true;
            }
        }
        if (ckData64 && ckFileName){
            try {
            const hashMD5 = crypto.createHash('MD5');
            const hashsha3 = crypto.createHash('SHA3-224');
            var NewName = hashMD5.update(this.original_file_name + Date.now()).digest("hex").toString() + 
                                "-" + sanatiFileName(this.original_file_name);
            var curDirParts:string = '' 
            
            if (process.env.NODE_ENV == 'development'){
                let DirParts = process.cwd().split("/");
                curDirParts = DirParts.slice(0,curDirParts.length-1).join("/")
            //  this.current_full_file_path = curDirParts.slice(0,curDirParts.length-1).join("/") + "/backendCarmaImages/" + NewName;
            } else{
                curDirParts = process.cwd()
            }
            console.log("curDirParts",curDirParts)
            this.current_full_file_path = curDirParts + "/backendCarmaImages/" + NewName;

            // console.log("Class:ImageFileData; function:constructor; Data: process.cwd():", process.cwd());    
            // console.log("Class:ImageFileData; function:constructor; Data: current_full_file_path:", this.current_full_file_path);
            var base64Data = this.base64_data.split("base64,").pop() as string;            
            this.hash_sha3 = hashsha3.update(base64Data).digest("hex").toString();
            fs.writeFileSync(this.current_full_file_path, base64Data,{encoding: 'base64'}); 
            this.is_complete = true;
            } catch(e:any){
                console.log("ERROR from constructor() of ImageFileData: ", e.stack.split("at")[0]);
            }
        }
    }
    getOriginalFileName():string{return this.original_file_name;};
    getFullFilePath(){return this.current_full_file_path;};
    getHash():string{return this.hash_sha3;};
    checkComplete():boolean{return this.is_complete;};
    // -----------------------------------------------------------------------
    
}
// ----------------------------------------------------------------------------
export {IImageFileData, ImageFileData};
