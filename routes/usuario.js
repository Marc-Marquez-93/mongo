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

const router = new Router();

router.get(
  "/",
  // [a,
  // validarCampos],
  getUsuario,
);
router.post(
  "/",
  // [a,
  // validarCampos],
  postUsuario,
);
router.put(
  "/:email",
  // [a,
  // validarCampos],
  putUsuario,
);
router.put(
  "/activar/:email",
  // [a,
  // validarCampos],
  putUsuarioActivar,
);
router.put(
  "/inactivar/:email",
  // [a,
  // validarCampos],
  putUsuarioInactivar,
);
router.delete(
  "/:email",
  // [a,
  // validarCampos],
  deleteUsuario,
);

export default router;
