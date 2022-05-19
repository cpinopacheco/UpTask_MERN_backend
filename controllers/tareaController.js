import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tareas.js";

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;

  const existeProyecto = await Proyecto.findById(proyecto);

  //validamos si el proyecto existe
  if (!existeProyecto) {
    const error = new Error("El Proyecto no existe");
    return res.status(404).json({ msg: error.message });
  }

  //validamos los permisos adecuados
  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes los permisos para añadir tareas");
    return res.status(403).json({ msg: error.message });
  }

  try {
    //almacenamos la tarea
    const tareaAlmacenada = await Tarea.create(req.body);

    //Almacenar el ID en el proyecto.
    existeProyecto.tareas.push(tareaAlmacenada._id);
    await existeProyecto.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const obtenerTarea = async (req, res) => {
  const { id } = req.params;

  const tarea = await Tarea.findById(id).populate("proyecto"); //populate cruza la información y trae lo que hay en tarea y en proyecto y se le pasa el nombre de la columna de en la que hacemos referencia en el modelo de tarea.

  //error 404: no se encontró el recurso
  //error 403: no se tienen los permisos
  //error 401: require Autenticación de usuario
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(403).json({ msg: error.message });
  }

  res.json(tarea);
};

const actualizarTarea = async (req, res) => {
  const { id } = req.params;

  const tarea = await Tarea.findById(id).populate("proyecto"); //populate cruza la información y trae lo que hay en tarea y en proyecto y se le pasa el nombre de la columna de en la que hacemos referencia en el modelo de tarea.

  //error 404: no se encontró el recurso
  //error 403: no se tienen los permisos
  //error 401: require Autenticación de usuario
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(403).json({ msg: error.message });
  }

  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

  try {
    const tareaAlmacenada = await tarea.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const eliminarTarea = async (req, res) => {
  const { id } = req.params;

  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(403).json({ msg: error.message });
  }

  try {
    const proyecto = await Proyecto.findById(tarea.proyecto);

    proyecto.tareas.pull(tarea._id);

    await Promise.all([await proyecto.save(), await tarea.deleteOne()]);

    res.json({ msg: "La Tarea se eliminó" });
  } catch (error) {
    console.log(error);
  }
};

const cambiarEstado = async (req, res) => {
  //obtenemos el id de la tarea
  const { id } = req.params;

  //consultamos la BD y llenamos con la información del proyecto.
  const tarea = await Tarea.findById(id).populate("proyecto");

  console.log(tarea);

  //
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (
    tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Acción no válida");
    return res.status(403).json({ msg: error.message });
  }

  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id;
  await tarea.save();

  const tareaAlmacenada = await Tarea.findById(id)
    .populate("proyecto")
    .populate("completado");

  res.json(tareaAlmacenada);
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};
