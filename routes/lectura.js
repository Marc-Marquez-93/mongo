import { Router } from "express";
import {
  getLectura,
  getLecturaId,
  postLecturaPrincipal,
  postLecturaDiaria,
} from "../controllers/lectura.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { check } from "express-validator";
import { get } from "mongoose";

const router = Router();

router.post(
  "/principal/:email",
  [check("email", "El email es obligatorio").isEmail().not().isEmpty(),
  validarCampos],
  postLecturaPrincipal,
);

router.post(
  "/diaria/:email",
  [check("email", "El email es obligatorio").isEmail().not().isEmpty(),
  validarCampos],
  postLecturaDiaria,
);

router.get(
  "/usuario/:email",
  [check("email", "El email es obligatorio").isEmail().not().isEmpty(),
  validarCampos],
  getLectura,
);

router.get(
  "/:id",
  [check("id", "El id es obligatorio").not().isEmpty().isMongoId(),
  validarCampos],
  getLecturaId,
);

export default router;
