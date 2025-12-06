import { Router } from "express";
import { deleteUsuario, getUsuario, postUsuario, putUsuario, putUsuarioActivar, putUsuarioInactivar } from "../controllers/usuario.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { check } from "express-validator";

const router = new Router()

router.get("/",
    // [a,
    // validarCampos],
     getUsuario)
router.post("/",
    // [a,
    // validarCampos],
    postUsuario)
router.put("/:id",
    // [a,
    // validarCampos],
     putUsuario)
router.put("/activar", 
    // [a,
    // validarCampos],
     putUsuarioActivar)
router.put("/inactivar", 
    // [a,
    // validarCampos],
     putUsuarioInactivar)
router.delete("/", 
    // [a,
    // validarCampos],
     deleteUsuario)

export default router