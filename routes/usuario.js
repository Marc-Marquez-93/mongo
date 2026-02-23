import { Router } from "express";
import { check } from "express-validator";
import {
  deleteUsuario,
  getUsuario,
  postUsuario,
  putUsuario,
  putUsuarioActivar,
  putUsuarioInactivar,
  login, // Importamos login
} from "../controllers/usuario.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js"; // Importamos el middleware de seguridad
import { esFechaValida } from "../helpers/validar-fecha.js";

const router = new Router();

// --- RUTA LOGIN (NUEVA) ---
router.post(
  "/login",
  [
    check("email", "El correo es obligatorio").isEmail(),
    check("password", "La contraseña es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  login
);

// --- RUTAS PÚBLICAS ---
router.post(
  "/",
  [
    check("email", "Error en el email").isEmail().not().isEmpty(),
    check("password", "La contraseña debe tener entre 7 y 10 caracteres").isLength({ min: 7, max: 10 }),
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("fecha_nacimiento", "Fecha inválida").custom(esFechaValida),
    validarCampos,
  ],
  postUsuario
);

// --- RUTAS PROTEGIDAS (Requieren Token) ---
// Agregamos validarJWT al inicio del array de middlewares

router.get(
  "/:email",
  [
    validarJWT, // PROTEGIDA
    check("email", "El email es obligatorio").isEmail(),
    validarCampos
  ],
  getUsuario
);

router.put(
  "/:email",
  [
    validarJWT, // PROTEGIDA
    check("email", "Email inválido").isEmail(),
    validarCampos
  ],
  putUsuario
);

router.put(
  "/activar/:email",
  [
    validarJWT, // PROTEGIDA
    check("email", "Email inválido").isEmail(),
    validarCampos
  ],
  putUsuarioActivar
);

router.put(
  "/inactivar/:email",
  [
    validarJWT, // PROTEGIDA
    check("email", "Email inválido").isEmail(),
    validarCampos
  ],
  putUsuarioInactivar
);

router.delete(
  "/:email",
  [
    validarJWT, // PROTEGIDA
    check("email", "Email inválido").isEmail(),
    validarCampos
  ],
  deleteUsuario
);

export default router;