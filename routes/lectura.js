import { Router } from 'express';
import { validarCampos } from "../middlewares/validar-campos.js";
import { check } from "express-validator";  

const router = Router();

router.post('/principal/:usuario_id', [a,
    validarCampos], );
router.post('/diaria/:usuario_id', [a,
    validarCampos], );
router.get('/usuario/:usuario_id', [a,
    validarCampos],);
router.get('/:id',[a,
    validarCampos], );

export default router;
