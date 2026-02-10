import { Router } from "express";
import {
  getPago,
  getByUsuario,
  crearPago,
  getEstado,
} from "../controllers/pago.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { check } from "express-validator";

const router = Router();

router.get(
  "/",
  // [check("email", "El email es obligatorio").isEmail().not().isEmpty(),
  // validarCampos],
  getPago,
);
router.get(
  "/:email",
  [check("email", "El email es obligatorio").isEmail().not().isEmpty(),
  validarCampos],
  getByUsuario,
);
router.post(
  "/",
  [check("usuario_email", "El email del usuario es obligatorio").isEmail().not().isEmpty(),
  check("metodo", "El método de pago es obligatorio").not().isEmpty().isIn([0, 1, 2]),
  validarCampos],
  crearPago,
);
router.get(
  "/estado/:email",
  [check("email", "El email es obligatorio").isEmail().not().isEmpty(),
  validarCampos],
  getEstado,
);

export default router;
