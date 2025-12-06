import { Router } from 'express';
import {getPago, getByUsuario, crearPago, getEstado} from "../controllers/pago.js"
import { validarCampos } from "../middlewares/validar-campos.js";
import { check } from "express-validator";

const router = Router();

router.get('/', 
    // [a,
    // validarCampos],
    getPago);
router.get('/:email', 
    // [a,
    // validarCampos],
     getByUsuario);
router.post('/', 
    // [a,
    // validarCampos],
     crearPago);
router.get('/estado/:email', 
    // [a,
    // validarCampos], 
    getEstado);

export default router;
