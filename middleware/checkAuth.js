import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

//con next hacemos que el programa vaya hacia el siguiente middleware
const checkAuth = async (req, res, next) => {
  let token;

  console.log(req);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; //divide la cadena en los espacios en blanco, y le decimos que almacene lo que hay en la posición 1

      //.verify permite verificar el token con la variable de entorno
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.usuario = await Usuario.findById(decoded.id).select(
        "-password -confirmado -token -createdAt -updatedAt -__v"
      ); //.select("-password -confirmado -token -createdAt -updatedAt -__v") elimina esas propiedades de la respuesta

      return next(); //vamos al siguiente middleware
    } catch (error) {
      return res.status(404).json({ msg: "Hubo un error" });
    }
  }

  if (!token) {
    const error = new Error("Token no válido");

    return res.status(401).json({ msg: error.message });
  }

  next();
};

export default checkAuth;
