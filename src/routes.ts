import express from "express";
import * as PlantaController from "./controllers/PlantaController";

const routes = express.Router();

routes.get("/", (req, res) => {
  res.status(200).json({ message: "API do treinamento de CRUD do CITi 🚀" });
});

routes.post("/plantas", PlantaController.createPlanta);
routes.get("/plantas", PlantaController.findAllPlantas);
routes.get("/plantas/estoque/valor-total", PlantaController.getValorTotalEstoque);
routes.get("/plantas/esgotadas", PlantaController.findPlantasEsgotadas);

routes.post("/plantas/:id/venda", PlantaController.realizarVenda);
routes.get("/plantas/:id", PlantaController.findPlantaById);
routes.patch("/plantas/:id", PlantaController.updatePlanta);
routes.delete("/plantas/:id", PlantaController.deletePlanta);

export default routes;