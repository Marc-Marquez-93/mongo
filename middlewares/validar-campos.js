import { validationResult } from 'express-validator';

export const validarCampos = (req, res, next) => {
 // validationResult extrae los errores acumulados por check()
 const errors = validationResult(req);

 if (!errors.isEmpty()) {
 return res.status(400).json(errors);
 }
 next(); // Si no hay errores, sigue al controlador
}