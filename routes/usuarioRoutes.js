import express from "express";
const router = express.Router();
import {
  autenticar,
  registrar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
} from "../controllers/usuarioController.js";

import checkAuth from "../middleware/checkAuth.js";

//Autenticación, Registro y Confirmación de Usuarios
router.post("/", registrar); //Crea un nuevo usuario
router.post("/login", autenticar);
router.get("/confirmar/:token", confirmar); //con la sintaxis de los 2 puntos (:token), creamos routing dinámico.
router.post("/olvide-password", olvidePassword);
/* router.get("/olvide-password/:token", comprobarToken);
router.post("/olvide-password/:token", nuevoPassword); */

//Se puede ocupar esta sintaxis cuando tenemos la url repetida
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword);

router.get("/perfil", checkAuth, perfil);

export default router;
