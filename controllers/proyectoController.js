import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
  //Proyecto es el modelo y .find() va a traer todos los proyectos que se encuentren en DB.

  //el select("-tareas") : es para que la consulta no se traiga la propiedad de tareas por que no es requerida
  const proyectos = await Proyecto.find({
    $or: [
      { colaboradores: { $in: req.usuario } },
      { creador: { $in: req.usuario } },
    ],
  }).select("-tareas");

  res.json(proyectos);
};

const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body); //Instancia el modelo de proyecto
  proyecto.creador = req.usuario._id;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

const obtenerProyecto = async (req, res) => {
  const { id } = req.params;

  //con select: "campo" (trae los datos que quieres) - "-campo" (no trae esos datos)
  const proyecto = await Proyecto.findById(id)
    .populate({
      path: "tareas",
      populate: { path: "completado", select: "nombre " },
    })
    .populate("colaboradores", "nombre email"); //los valores después de la coma indican los campos que queremos traer

  //validación si el proyecto existe
  if (!proyecto) {
    const error = new Error("No Encontrado");
    return res.status(404).json({ msg: error.message });
  }

  //validación quien trata de obtener el proyecto es el creador
  if (
    proyecto.creador.toString() !== req.usuario._id.toString() &&
    !proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Acción no válida");
    return res.status(404).json({ msg: error.message });
  }

  //Obtener las tareas del Proyecto
  //find se trae todo la data - where es la condición para el find.
  /*  const tareas = await Tarea.find().where("proyecto").equals(proyecto._id); */

  res.json(
    proyecto
    /*     tareas, */
  );
};

const editarProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error("No Encontrado");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(404).json({ msg: error.message });
  }

  //Si el usuario manda algo ocupamos el req.body.nombre sino se asigna lo que ya hay en la base de datos
  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
  proyecto.cliente = req.body.cliente || proyecto.cliente;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

const eliminarProyecto = async (req, res) => {
  const { id } = req.params; //identificamos el proyecto

  const proyecto = await Proyecto.findById(id); //encontrarlo en la base de datos

  //validación si no encuentra el proyecto
  if (!proyecto) {
    const error = new Error("No Encontrado");
    return res.status(404).json({ msg: error.message });
  }

  //Validar si la persona que quiere eliminar es la que lo creo
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(404).json({ msg: error.message });
  }

  try {
    await proyecto.deleteOne();
    res.json({ msg: "Proyecto Eliminado" });
  } catch (error) {
    console.log(error);
  }
};

const buscarColaborador = async (req, res) => {
  const { email } = req.body;

  //findOne : Busca por un campo, en este caso el email
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  res.json(usuario);
};

const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  /* VALIDACIONES */

  //valida que el proyecto exista
  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  //valida que quien esta agregando al proyecto tenga los permisos de hacerlo
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(404).json({ msg: error.message });
  }

  const { email } = req.body;

  //findOne : Busca por un campo, en este caso el email
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -password -token -updatedAt -__v"
  );

  //válida que el usuario exista
  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  //Validar que el colaborador no es el admin del proyecto
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error("El creador del proyecto no puede ser colaborador");
    return res.status(404).json({ msg: error.message });
  }

  //validar que no este ya agregado al proyecto
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error("El usuario ya pertenece al proyecto");
    return res.status(404).json({ msg: error.message });
  }

  // Si esta todo OK se puede agregar el colaborador al proyecto
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  res.json({ msg: "Colaborador agregado correctamente" });
};

const eliminarColaborador = async (req, res) => {
  //le pasamos el proyecto
  const proyecto = await Proyecto.findById(req.params.id);

  /* VALIDACIONES */

  //valida que el proyecto exista
  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  //valida que quien esta agregando al proyecto tenga los permisos de hacerlo
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(404).json({ msg: error.message });
  }

  // Si esta todo OK se puede eliminar el colaborador del proyecto
  proyecto.colaboradores.pull(req.body.id);

  await proyecto.save();
  res.json({ msg: "Colaborador eliminado correctamente" });
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
  /*   obtenerTareas, */
};
