import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

const registrar = async (req, res)=>{

    const {email} = req.body; // req.body son los datos del usuario 
    const existeUsuario = await Usuario.findOne({email}) //buscar si el usuario existe

    if(existeUsuario){ //mostrar error
        const error = new Error("Usuario ya registrado");
        return res.status(400).json({msg: error.message})
    }

    try {
        const usuario = new Usuario(req.body) //Crear un obj con la informacion del usuario
        usuario.token = generarId(); //Generar un token para validar
        await usuario.save() //almacenarlo en la base de datos
        // enviar email de confirmacion
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })
        res.json({msg: "Usuario Creado Correctamente, Revisa tu Email para confirmar tu cuenta"})
    } catch (error) {
        console.log(error)
    }
}

const autenticar = async (req, res)=>{

    const {email, password} = req.body

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({email})
    if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg: error.message})
    }

    // Comprobar si esta confirmado
    if (!usuario.confirmado) {
        const error = new Error("Tu cuenta no fué confirmada");
        return res.status(403).json({msg: error.message})
    }

    // comprobar su password
    if(await usuario.comprobarPassword(password)){
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })
    }else{
        const error = new Error("Contraseña Incorrecta");
        return res.status(403).json({msg: error.message})
    }
}

const confirmar = async (req, res)=>{
    const {token} = req.params; //leer token de la url
    const usuarioConfirmar = await Usuario.findOne({token}) // buscar si el token existe
    
    if(!usuarioConfirmar){ //si no existe da error
        const error = new Error("Token no válido");
        return res.status(403).json({msg: error.message})
    }

    //si el token existe confirmamos al usuario, eliminamos el token y lo guardamos en la DB
    try { 
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = "";
        await usuarioConfirmar.save();
        res.json({msg: "Usuario Confirmado Correctamente"})
    } catch (error) {
        console.log(error)
    }
}

const olvidePassword = async (req, res) =>{
    const {email} = req.body;

    //comprobar que el email exista
    const usuario = await Usuario.findOne({email})
    if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg: error.message})
    }

    try {
        usuario.token = generarId() //generar nuevo token
        await usuario.save()

        // enviar email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({msg: "Hemos enviado un email con las instrucciones"})
    } catch (error) {
        console.log(error)
    }
}

const comprobarToken = async (req, res)=>{
    const {token} = req.params;
    const tokenValido = await Usuario.findOne({token})

    if(tokenValido){
        res.json({msg: "Token valido y el Usuario Existe"})
    }else{
        const error = new Error("Token no válido");
        return res.status(404).json({msg: error.message})
    }
}

const nuevoPassword = async (req, res)=>{
    const {token} = req.params;
    const {password} = req.body;
    
    const usuario = await Usuario.findOne({token})

    if(usuario){
        usuario.password = password;
        usuario.token = "";
        try {
            await usuario.save();
            res.json({msg: "Password Modificado Correctamente"})
        } catch (error) {
            console.log(error)
        }
    }else{
        const error = new Error("Token no válido");
        return res.status(404).json({msg: error.message})
    }
}

const perfil = async (req, res)=>{
    const {usuario} = req
    res.json(usuario)
}
export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
}