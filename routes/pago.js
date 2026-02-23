import { Router } from "express";
import {
  getPago,
  getByUsuario,
  crearPago,
  getEstado,
} from "../controllers/pago.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js"; // 1. Importar el middleware
import { check } from "express-validator";

const router = Router();

// Ver todos los pagos (Protegido)
router.get(
  "/",
  [
    validarJWT, // 2. Agregarlo aquí para validar token antes de mostrar nada
    // Si tenías otras validaciones comentadas, puedes dejarlas o quitarlas,
    // pero el validarJWT es el que protege la ruta.
    validarCampos 
  ],
  getPago
);

// Ver pagos por email (Protegido)
router.get(
  "/:email",
  [
    validarJWT, // Primero validamos el token
    check("email", "El email es obligatorio").isEmail().not().isEmpty(),
    validarCampos
  ],
  getByUsuario
);

// Crear pago (Protegido - Opcional, pero recomendable)
router.post(
  "/",
  [
    validarJWT, // Así sabes quién está creando el pago realmente
    check("usuario_email", "El email del usuario es obligatorio").isEmail().not().isEmpty(),
    check("metodo", "El método de pago es obligatorio").not().isEmpty().isIn([0, 1, 2]),
    validarCampos
  ],
  crearPago
);

// Ver estado por email (Protegido)
router.get(
  "/estado/:email",
  [
    validarJWT, // Primero validamos el token
    check("email", "El email es obligatorio").isEmail().not().isEmpty(),
    validarCampos
  ],
  getEstado
);

export default router;