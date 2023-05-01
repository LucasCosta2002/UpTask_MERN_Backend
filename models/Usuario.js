import mongoose from 'mongoose';
import bcrypt from "bcrypt"

//crear tabla para DB
const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        require: true,
        trim: true
    },
    password: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    token: {
        type: String,
    },
    confirmado: {
        type: Boolean,
        default: false
    },
},  {
        timestamps: true    
    }
);


//lo que se almacena (objeto en db) en el controlador se pasa al modelo y se hashea
usuarioSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)//hash y se almacena
});

usuarioSchema.methods.comprobarPassword = async function(passwordFormulario){
    return await bcrypt.compare(passwordFormulario, this.password)
}

//definir modelo, le damos un nombre y su tabla 
const Usuario = mongoose.model("Usuario", usuarioSchema)

export default Usuario