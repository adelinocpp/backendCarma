// ----------------------------------------------------------------------------
interface IFaceData{//json_face_data
    face_image_path?:string;
    hash_sha3?:string;
    base64_data?:string; // Usar apenas em algumas devolutivas para o cliente
    face_embedding?: Number[];
    face_plda?:Number[];
    embedding_version?: string;
    appendix?:string;
  }
// ----------------------------------------------------------------------------
interface IReport{
    id_report?:Number
}
// ----------------------------------------------------------------------------
interface IImageFileData{ //json_image_file
    base64_data?:string;
	file_name?:string;
}
// ----------------------------------------------------------------------------
// interface IImageFileDigest{ //json_image_hash
//     base64_data?:string;
// 	hash_sha3?:string;
//     appendix?:string;
// }
// ----------------------------------------------------------------------------
interface ISearchRequest{ //json_request
    id_user?:string;
    force_new?:boolean;
    expand_result?:boolean;
    appendix?:string;
    json_face_data?:IImageFileData;
}
// ----------------------------------------------------------------------------
interface ISearchError{ //json_error
    stage?:string;
    question?:string;
}
// ----------------------------------------------------------------------------
interface IFaceCompResult{ //json_report_unit
    send_face_is?:string;
    know_face_id?:string;
    filename?:string;
    rg_mg?:string;
    cpf?:string;
    prontuario?:string;
    prob_same_face?:Number;
    prob_diff_face?:Number;
    score?:Number;
}
// ----------------------------------------------------------------------------
export{
    IFaceData,
    IReport,
    IImageFileData,
    ISearchRequest,
    ISearchError,
    IFaceCompResult
}