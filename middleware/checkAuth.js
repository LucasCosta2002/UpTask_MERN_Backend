import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js';


const checkAuth = async (req, res, next) =>{

    let token;

    //comprobar que exista el token y se envie via headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(' ')[1]; //separar el bearer y el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET); //leer token y verificar
            req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -createdAt -updatedAt -__v")//buscar el usuario por su id y le va a asignar el nuevo id
            return next()
        } catch (error) {
            return res.status(404).json({msg: "Hubo un Error"})
        }
    }    

    if(!token){
        const error = new Error('Token no Válido')
        return res.status(401).json({msg: error.message})
    }
    next()
}

export default checkAuth