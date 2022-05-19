import mongoose from "mongoose";

//Creamos el schema
const proyectosSchema = mongoose.Schema(
  {
    nombre: {
      type: String,
      trim: true,
      required: true,
    },
    descripcion: {
      type: String,
      trim: true,
      required: true,
    },
    fechaEntrega: {
      type: Date,
      default: Date.now(),
    },
    cliente: {
      type: String,
      trim: true,
      required: true,
    },
    creador: {
      type: mongoose.Schema.Types.ObjectId, //de esta forma hacemos referencia con la colección de usuarios
      ref: "Usuario",
    },
    tareas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tarea",
      },
    ],
    //Los corchetes indican que puede haber mas de 1. Colaboradores va a ser una colección de usuarios
    colaboradores: [
      {
        type: mongoose.Schema.Types.ObjectId, //de esta forma hacemos referencia con la colección de usuarios
        ref: "Usuario",
      },
    ],
  },
  {
    timestamps: true, //crea las columnas para saber cuando fue creada y actualizada
  }
);

const Proyecto = mongoose.model("Proyecto", proyectosSchema);
export default Proyecto;
