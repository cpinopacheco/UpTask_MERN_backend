import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import Usuario from "../models/Usuario.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";

//Registrar usuario
const registrar = async (req, res) => {
  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({ email }); //find one encuentra la primera coincidencia del valor que le entregamos

  if (existeUsuario) {
    const error = new Error("Usuario ya registrado");
    return res.status(400).json({ msg: error.message });
  }

  try {
    const usuario = new Usuario(req.body);
    usuario.token = generarId();
    await usuario.save();

    //enviar el email de confirmación
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });

    res.json({
      msg: "Usuario creado correctamente, Revisa tú email para confirmar tú cuenta",
    });
  } catch (error) {
    console.log(error);
  }
};

//Autenticación de usuario
const autenticar = async (req, res) => {
  const { email, password } = req.body;
  //comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email });

  //valida si el usuario existe
  if (!usuario) {
    const error = new Error("El usuario no existe");

    return res.status(404).json({ msg: error.message });
  }

  //comprobar si el usuario esta confirmado
  if (!usuario.confirmado) {
    const error = new Error("Tu cuenta no ha sido confirmada");

    return res.status(403).json({ msg: error.message });
  }

  //Comprobar su password
  if (await usuario.comprobarPassword(password)) {
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    });
  } else {
    const error = new Error("El Password es Incorrecto");

    return res.status(403).json({ msg: error.message });
  }
};

//Confirmación cuenta de usuario
const confirmar = async (req, res) => {
  const { token } = req.params;

  const usuarioConfirmar = await Usuario.findOne({ token });

  if (!usuarioConfirmar) {
    const error = new Error("Token no válido");

    return res.status(403).json({ msg: error.message });
  }

  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = "";
    await usuarioConfirmar.save(); //almacena en la DB
    res.json({ msg: "Usuario confirmado correctamente" });
  } catch (error) {
    console.log(error);
  }
};

//Restablecer contraseña
const olvidePassword = async (req, res) => {
  const { email } = req.body;

  //comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email });

  //valida si el usuario existe
  if (!usuario) {
    const error = new Error("El usuario no existe");

    return res.status(404).json({ msg: error.message });
  }

  try {
    usuario.token = generarId();
    await usuario.save();

    //Enviar el email
    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });

    res.json({ msg: "Hemos enviado un email con las instrucciones" });
  } catch (error) {
    console.log(error);
  }
};

const comprobarToken = async (req, res) => {
  const { token } = req.params; //extraemos valores de la url, si queremos extraer de un formulario es req.body

  const tokenValido = await Usuario.findOne({ token });

  if (!tokenValido) {
    const error = new Error("Token no válido");

    return res.status(404).json({ msg: error.message });
  }

  res.json({ msg: "Token válido, y el usuario existe" });
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;

  const { password } = req.body;

  //verificamos el token
  const usuario = await Usuario.findOne({ token });

  //si no es correcto el token
  if (!usuario) {
    const error = new Error("Token no válido");

    return res.status(404).json({ msg: error.message });
  }

  //si es correcto el token, almacenamos el nuevo password, reseteamos el token, y guardamos.
  usuario.password = password;
  usuario.token = "";
  try {
    await usuario.save();
    res.json({ msg: "Password modificado correctamente" });
  } catch (error) {
    console.log(error);
  }
};

const perfil = async (req, res) => {
  const { usuario } = req;

  res.json(usuario);
};

export {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};
