//Creación del JSON Web Token
import jwt from "jsonwebtoken";

const generarJWT = (id) => {
  //.sing permite firmar el token con la variable de entorno
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generarJWT;
