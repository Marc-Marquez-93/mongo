import { Router } from "express";
import {
  deleteUsuario,
  getUsuario,
  postUsuario,
  putUsuario,
  putUsuarioActivar,
  putUsuarioInactivar,
} from "../controllers/usuario.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { check } from "express-validator";
import { esFechaValida } from "../helpers/validar-fecha.js";

const router = new Router();

router.get(
  "/:email",
  [check("email", "El email es obligatorio").isEmail().not().isEmpty(),
  validarCampos],
  getUsuario,
);
router.post(
  "/",
  [check("email", "Error en el email").isEmail().not().isEmpty(),
  check("password", "La contraseña es obligatoria, debe contener entre 7 y 10 caracteres, numeros y letras").not().isEmpty().isLength({ min: 7, max: 10 }).not().isString().not().isNumeric(),
  check("nombre", "El nombre es obligatorio").not().isEmpty().isLength({ min: 5, max: 30 }),
  check("fecha_nacimiento", "La fecha de nacimiento es obligatoria y debe ser una fecha válida").not().isEmpty().isDate().custom(esFechaValida),
  check("estado", "Error en el estado").isIn([1, 0]),
  validarCampos],
  postUsuario,
);
router.put(
  "/:email",
  [check("email", "Error en el email").isEmail().not().isEmpty(),
  check("email_nuevo", "Error en el nuevo email").isEmail().not().isEmpty(),
  check("password", "La contraseña es obligatoria, debe contener entre 7 y 10 caracteres, numeros y letras").not().isEmpty().isLength({ min: 7, max: 10 }).not().isString().not().isNumeric(),
  check("nombre", "El nombre es obligatorio").not().isEmpty().isLength({ min: 5, max: 30 }),
  check("fecha_nacimiento", "La fecha de nacimiento es obligatoria y debe ser una fecha válida").not().isEmpty().isDate().custom(esFechaValida),
  validarCampos],
  putUsuario,
);
router.put(
  "/activar/:email",
  [check("email", "Error en el email").isEmail().not().isEmpty(),
  validarCampos],
  putUsuarioActivar,
);
router.put(
  "/inactivar/:email",
  [check("email", "Error en el email").isEmail().not().isEmpty(),
  validarCampos],
  putUsuarioInactivar,
);
router.delete(
  "/:email",
  [check("email", "Error en el email").isEmail().not().isEmpty(),
  validarCampos],
  deleteUsuario,
);

export default router;
