import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res)=>{

    //obtener todos los proyectos creados por la persona que inició sesión
    // colaboradores y creadores pueden obtener los poryectos
    const proyectos = await Proyecto.find(
        {'$or' : [
            {'colaboradores': {$in: req.usuario}},
            {'creador': {$in: req.usuario}}
        ]}
        ).select("-tareas")
    res.json(proyectos)
}

const nuevoProyecto = async (req, res)=>{
console.log(req.usuario);

    //crear un obj con lo que el usuario envia
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id; //asignar creador por el id del usuario autenticado

    try {
        const proyectoAlmacenado = await proyecto.save() //guardar proyecto en db
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error);
    }
}

const obtenerProyecto = async (req, res)=>{
    //obtener proyecto por su id
    const {id} = req.params;

    //consultar a ld DB si el proyecto existe    
    //segundo parametro del populate son los campos que quiero traer, no funciona select  pq cruzo otras colecciones
    const proyecto = await Proyecto.findById(id)
        .populate({ path: "tareas", populate: {path: "completado", select: "nombre"}})
        .populate("colaboradores", "nombre email")

    if (!proyecto) {
        const error = new Error("No Encontrado");
        return res.status(404).json({msg: error.message})
    }

    //comprobar que la persona que quiere acceder al proyecto sea la misma que lo creo
    if(proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error("Acción no válida");
        return res.status(401).json({msg: error.message})
    }

    //obtener tareas del proyecto
    // const tareas = await Tarea.find().where("proyecto").equals(proyecto._id);
    res.json(proyecto)
}

const editarProyecto = async (req, res)=>{
    //obtener proyecto por su id
    const {id} = req.params;

    //consultar a ld DB si el proyecto existe
    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        const error = new Error("No Encontrado");
        return res.status(404).json({msg: error.message})
    }

    //comprobar que la persona que quiere acceder al proyecto sea la misma que lo creo
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida");
        return res.status(401).json({msg: error.message})
    }

    //asignar nuevo dato o mantener el que está en DB
    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.fechaEntrega

    try {
        //guardar en db
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)

    } catch (error) {
        console.log(error);
    }
    
}

const eliminarProyecto = async (req, res)=>{
    //obtener proyecto por su id
    const {id} = req.params;

    //consultar a ld DB si el proyecto existe
    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        const error = new Error("No Encontrado");
        return res.status(404).json({msg: error.message})
    }

    //comprobar que la persona que quiere acceder al proyecto sea la misma que lo creo
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida");
        return res.status(401).json({msg: error.message})
    }

    try {
        await proyecto.deleteOne();
        res.json({msg: "Proyecto Eliminado"})
    } catch (error) {
        console.log(error);
    }
}

const buscarColaborador = async (req, res)=>{
    const {email} = req.body;
    const usuario = await Usuario.findOne({email}).select("-confirmado -createdAt -password -token -updatedAt -__v");

    if(!usuario){
        const error = new Error("Usuario No Encontrado");
        return res.status(404).json({msg: error.message})
    }

    res.json(usuario)
}

const agregarColaborador = async (req, res)=>{
    const proyecto = await Proyecto.findById(req.params.id)

    if(!proyecto){
        const error = new Error("Proyecto No Encontrado");
        return res.status(404).json({msg: error.message})
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Accion no valida");
        return res.status(404).json({msg: error.message})
    }

    const {email} = req.body;
    const usuario = await Usuario.findOne({email}).select("-confirmado -createdAt -password -token -updatedAt -__v");

    if(!usuario){
        const error = new Error("Usuario No Encontrado");
        return res.status(404).json({msg: error.message})
    }

    // el colaborador no es el admin del proyecto
    if (proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error("El creador del proyecto no puede ser colaborador");
        return res.status(404).json({msg: error.message})
    }

    // revisar que no este agregado al proyecto
    if(proyecto.colaboradores.includes(usuario._id)){
        const error = new Error("El usuario ya está en el proyecto");
        return res.status(404).json({msg: error.message})
    }


    // agregar al usuario
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({msg: "Colaborador agregado Correctamente"})
}

const eliminarColaborador = async (req, res)=>{
    const proyecto = await Proyecto.findById(req.params.id)

    if(!proyecto){
        const error = new Error("Proyecto No Encontrado");
        return res.status(404).json({msg: error.message})
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Accion no valida");
        return res.status(404).json({msg: error.message})
    }

    // eliminar
    proyecto.colaboradores.pull(req.body.id)
    await proyecto.save()
    res.json({msg: "Colaborador eliminado Correctamente"})
}

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador
}