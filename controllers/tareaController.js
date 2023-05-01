import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req,res)=>{

    //obtener proyecto para la tarea
    const {proyecto} = req.body;
    //buscar el proyecto
    const existeProyecto = await Proyecto.findById(proyecto)
    //comprobar que exista el proyecto
    if(!existeProyecto){
        const error = new Error("El proyecto no existe")
        return res.status(404).json({msg: error.message})
    }

    //comprobar que el creador sea quien lo está buscando
    if(existeProyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("No tienes los permisos para añadir tareas")
        return res.status(404).json({msg: error.message})
    }

    //Crear tarea y almacenarla
    try {
        const tareaAlmacenada = await Tarea.create(req.body)
        existeProyecto.tareas.push(tareaAlmacenada._id)
        await existeProyecto.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log();
    }

}

const obtenerTarea = async (req,res)=>{
    //obtener la tarea por su id
    const {id} = req.params;
    //identificar la tarea
    const tarea = await Tarea.findById(id).populate("proyecto");

    //Comprbar que exista la tarea
    if(!tarea){
        const error = new Error("La tarea no existe")
        return res.status(404).json({msg: error.message})
    }

    //comprobar que quien quiere obtener la tarea sea el mismo que la creó
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no Válida")
        return res.status(403).json({msg: error.message})
    }

    res.json(tarea)
}

const actualizarTarea = async (req,res)=>{
    //obtener la tarea por su id
    const {id} = req.params;
    //identificar la tarea
    const tarea = await Tarea.findById(id).populate("proyecto");

    //Comprbar que exista la tarea
    if(!tarea){
        const error = new Error("La tarea no existe")
        return res.status(404).json({msg: error.message})
    }

    //comprobar que quien quiere obtener la tarea sea el mismo que la creó
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no Válida")
        return res.status(403).json({msg: error.message})
    }

    //Actualizar con lo que el usuario escribe o mantener lo de la db
    tarea.nombre = req.body.nombre || tarea.nombre
    tarea.descripcion = req.body.descripcion || tarea.descripcion
    tarea.prioridad = req.body.prioridad || tarea.prioridad
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

    try {
        const tareaAlmacenada = await tarea.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log();
    }
}

const eliminarTarea = async (req,res)=>{
    //obtener la tarea por su id
    const {id} = req.params;
    //identificar la tarea
    const tarea = await Tarea.findById(id).populate("proyecto");

    //Comprbar que exista la tarea
    if(!tarea){
        const error = new Error("La tarea no existe")
        return res.status(404).json({msg: error.message})
    }

    //comprobar que quien quiere obtener la tarea sea el mismo que la creó
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no Válida")
        return res.status(403).json({msg: error.message})
    }

    try {
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)
        
        //se usa el promise pq el await bloquea la siguiente linea
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])

        res.json({msg: "Tarea Eliminada"})
    } catch (error) {
        console.log(error);
    }
 
}

const cambiarEstadoTarea = async (req,res)=>{
    const {id} = req.params;

    const tarea = await Tarea.findById(id).populate("proyecto");

    if(!tarea){
        const error = new Error("La tarea no existe")
        return res.status(404).json({msg: error.message})
    }
    
    //que no sea el creador ni el colaborador
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error("Acción no Válida")
        return res.status(403).json({msg: error.message})
    }

    //al hacer click establecer lo contrario, si esta incompleta pasa a completa
    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id;
    await tarea.save()

    const tareaAlmacenada = await Tarea.findById(id).populate("proyecto").populate("completado")

    res.json(tareaAlmacenada)
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstadoTarea
}