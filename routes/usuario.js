import { Router } from "express";
import { check } from "express-validator";
import {
  deleteUsuario,
  getUsuario,
  postUsuario,
  putUsuario,
  putUsuarioActivar,
  putUsuarioInactivar,
  login, 
  cambiarPassword,
  restablecerContraseña,
  solicitarRecuperacion,
  getAll
} from "../controllers/usuario.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js"; // Importamos el middleware de seguridad
import { esFechaValida, validarPasswordConfirmacion } from "../helpers/usuario.js";

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

router.post(
  "/cambiarPassword",
  [
    check("email", "El correo es obligatorio").isEmail(),
    check("passwordActual", "La contraseña actual es obligatoria").not().isEmpty(),
    check("password", "La nueva contraseña debe tener entre 7 y 10 caracteres").isLength({ min: 7, max: 10 }),
    check("confirmarPassword", "Debes confirmar la nueva contraseña").not().isEmpty(),
    check("password").custom(validarPasswordConfirmacion),
    validarCampos,
  ],
  cambiarPassword 
);

// Paso 1: Pedir el código
router.post(
  "/solicitarRecuperacion",
  [
    check("email", "El correo es obligatorio").isEmail(),
    validarCampos,
  ],
  solicitarRecuperacion
);

// Paso 2: Poner el código y la nueva contraseña
router.post(
  "/restablecerPassword",
  [
    check("email", "El correo es obligatorio").isEmail(),
    check("claveDinamica", "El código es obligatorio").not().isEmpty(),
    check("password", "Debe tener entre 7 y 10 caracteres").isLength({ min: 7, max: 10 }),
    check("password").custom((validarPasswordConfirmacion)),
    validarCampos,
  ],
  restablecerContraseña
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

router.get(
  "/",
  [
    validarJWT, // PROTEGIDA
    validarCampos
  ],
  getAll
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