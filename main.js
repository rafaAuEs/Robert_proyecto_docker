// main.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Configuración inicial de Express
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/api_local";//mongodb://rafarealeisv_db_user:UcPcwzhjf5kVvzJj@localhost:27017/api_local?authSource=admin

// Middleware: Permite leer cuerpos de petición JSON
app.use(express.json());

// ---------------------------------------------------------------------
// --- 1. DEFINICIÓN DE MODELOS (ESQUEMAS) ---
// ---------------------------------------------------------------------

// El nombre del modelo 'Usuario' generará la colección 'usuarios'
const esquemaUsuario = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        required: true
    },
    grupo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grupo',
        required: false
    }
});
const Usuario = mongoose.model('Usuario', esquemaUsuario);

// El nombre del modelo 'Grupo' generará la colección 'grupos'
const esquemaGrupo = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    descripcion: {
        type: String
    },
    usuarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }]
});
const Grupo = mongoose.model('Grupo', esquemaGrupo);


// ---------------------------------------------------------------------
// --- 2. RUTAS CRUD (USUARIOS) ---
// ---------------------------------------------------------------------

// C: Crear usuario (POST)
app.post('/api/usuarios', async (req, res) => {
    try {
        const nuevoUsuario = new Usuario(req.body);
        const usuarioGuardado = await nuevoUsuario.save();
        res.status(201).json(usuarioGuardado);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear usuario', error: error.message });
    }
});

// R: Listar usuarios (GET)
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find({}).populate('grupo');
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al listar usuarios', error: error.message });
    }
});

// U: Actualizar usuario por ID (PUT)
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!usuarioActualizado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        res.status(200).json(usuarioActualizado);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al actualizar usuario', error: error.message });
    }
});

// D: Eliminar usuario por ID (DELETE)
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuarioEliminado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        res.status(200).json({ mensaje: 'Usuario eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar usuario', error: error.message });
    }
});

// ---------------------------------------------------------------------
// --- 3. RUTAS CRUD (GRUPOS) ---
// ---------------------------------------------------------------------

// C: Crear grupo (POST)
app.post('/api/grupos', async (req, res) => {
    try {
        const nuevoGrupo = new Grupo(req.body);
        const grupoGuardado = await nuevoGrupo.save();
        res.status(201).json(grupoGuardado);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear grupo', error: error.message });
    }
});

// R: Listar grupos (GET)
app.get('/api/grupos', async (req, res) => {
    try {
        const grupos = await Grupo.find({}).populate('usuarios');
        res.status(200).json(grupos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al listar grupos', error: error.message });
    }
});

// U: Modificar grupo por ID (PUT)
app.put('/api/grupos/:id', async (req, res) => {
    try {
        const grupoActualizado = await Grupo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!grupoActualizado) return res.status(404).json({ mensaje: 'Grupo no encontrado' });
        res.status(200).json(grupoActualizado);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al actualizar grupo', error: error.message });
    }
});

// D: Eliminar grupo por ID (DELETE)
app.delete('/api/grupos/:id', async (req, res) => {
    try {
        const grupoEliminado = await Grupo.findByIdAndDelete(req.params.id);
        if (!grupoEliminado) return res.status(404).json({ mensaje: 'Grupo no encontrado' });

        // Mantenimiento: Quitar la referencia a este grupo de los usuarios
        await Usuario.updateMany(
            { grupo: req.params.id },
            { $unset: { grupo: 1 } }
        );
        res.status(200).json({ mensaje: 'Grupo y referencias de usuarios eliminadas con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar grupo', error: error.message });
    }
});

// ---------------------------------------------------------------------
// --- 4. CONEXIÓN E INICIO ---
// ---------------------------------------------------------------------

const conectarDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB conectado exitosamente a la base de datos api_local.');

        app.listen(PORT, () => {
            console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Error de conexión a MongoDB:', error.message);
        process.exit(1);
    }
};

conectarDB();//crear una accion que avise de algo