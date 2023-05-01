import express from "express";
const router = express.Router();
import { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil } from "../controllers/usuarioController.js";
import checkAuth from "../middleware/checkAuth.js";

// autenticacion, registro y confirmacion de usuarios
router.post("/", registrar) //crear un nuevo usuario
router.post("/login", autenticar) //comprobar al nuevo usuario
router.get("/confirmar/:token", confirmar) //confirmar usuario
router.post("/olvide-password", olvidePassword) //resetear contraseña
router.get("/olvide-password/:token", comprobarToken) 
router.post("/olvide-password/:token", nuevoPassword) 
// router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword)

router.get("/perfil", checkAuth, perfil)

export default router