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
  // [a,
  // validarCampos],
  postLecturaPrincipal,
);

router.post(
  "/diaria/:email",
  // [a,
  // validarCampos],
  postLecturaDiaria,
);

router.get(
  "/usuario/:email",
  // [a,
  // validarCampos],
  getLectura,
);

router.get(
  "/:id",
  // [a,
  // validarCampos],
  getLecturaId,
);

export default router;
