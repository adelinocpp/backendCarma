import express from "express";

import BackEndController, {checkToken} from "./Controllers/BackEndController";
import SendFacesController from "./Controllers/SendFacesController";
import KnowFacesController from "./Controllers/KnowFacesController";
import ReportController from "./Controllers/ReportController";

const routes  = express.Router();
// ==== ROTAS DE CONTROLE DO BACKEND ==========================================
routes.get("/status", checkToken, BackEndController.statusBackEnd); //



/**
 * /send_know_face
 * Rota para envio e armazenamento de uma face conhecida
 * */ 
routes.post("/send_know_face",checkToken,KnowFacesController.postKnowFace);
routes.get("/list_know_faces",checkToken,KnowFacesController.getKnowFaceList);

routes.get("/list_reports",checkToken,ReportController.getReportList);
routes.get("/report_by_id",checkToken,ReportController.getReportByID);

/**
 * /send_unknow_face
 * Rota para envio e armazenamento de uma face desconhecida
 * */ 
routes.post("/send_unknow_face",checkToken,SendFacesController.postUnknowFace);
routes.post("/encode_unknow_face",checkToken,SendFacesController.postEncodeUnknowFace);
routes.get("/list_send_face",checkToken,SendFacesController.getSendFaceList);

routes.post("/send_and_search_unknow_face",checkToken,SendFacesController.postSearchUnknowFace);
//routes.post("/search_unknow_face_by_id",checkToken,SendFacesController.postSearchById);

// ============================================================================
module.exports = routes;
// ----------------------------------------------------------------------------
// ============================================================================