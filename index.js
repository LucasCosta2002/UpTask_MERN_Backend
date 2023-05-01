import express from "express";
import dotenv from "dotenv";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";
import cors from 'cors';


const app = express();
app.use(express.json());

//ocultar credenciales
dotenv.config();

conectarDB()

// confirgurar cors 
//lista blanca de los dominios que pueden consultar la api
const whiteList = [process.env.FRONTEND_URL];

const corsOption = {
    origin: function(origin, callback){
        if(whiteList.includes(origin)){
            //puede consultar API
            callback(null, true)
        }else{
            //No esta permitido
            callback(new Error("Error de CORS"))
        }
    }
}
app.use(cors(corsOption))

//Routing
app.use("/api/usuarios", usuarioRoutes)
app.use("/api/proyectos", proyectoRoutes)
app.use("/api/tareas", tareaRoutes)

//ocultar puerto
const PORT = process.env.PORT || 4000;
const servidor = app.listen(PORT, ()=>{
    console.log(`iniciando servidor en el puerto ${PORT}`);
})

// socket io - tiempo real
import { Server} from 'socket.io'

const io = new Server(servidor, {
    pingTimeOut: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
})

// Abrir conexion de socket
io.on('connection', (socket)=>{
    // console.log("conectado a socket io");

    // definir los eventos de socket io - recibir eventos
    socket.on("abrir proyecto", (proyecto)=>{
        socket.join(proyecto);
    })

    socket.on('nueva tarea', tarea =>{
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit("tarea agregada", tarea)
    })

    socket.on('eliminar tarea', tarea =>{
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit("tarea eliminada", tarea)
    })

    socket.on('actualizar tarea', tarea =>{
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit("tarea actualizada", tarea)
    })
    
    socket.on('cambiar estado', tarea =>{
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit("nuevo estado", tarea)
    })
})