// cli-mongodb-crud.js

const readline = require('readline');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno y modelos
dotenv.config();
const User = require('./models/User'); 
const Group = require('./models/Group'); 

const MONGO_URI = process.env.MONGO_URI;

// --- Interfaz de Consola ---
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

// --- Funciones de Utilidad ---

function printMenu() {
    console.log('\n======================================');
    console.log('🔗 Menú de Gestión CRUD (MongoDB)');
    console.log('======================================');
    console.log('1. Crear Usuario');
    console.log('2. Listar Usuarios');
    console.log('3. Modificar Usuario');
    console.log('4. Borrar Usuario');
    console.log('---');
    console.log('5. Crear Grupo');
    console.log('6. Listar Grupos');
    console.log('7. Borrar Grupo');
    console.log('---');
    console.log('0. Salir');
    console.log('======================================');
}

// Función principal para manejar el menú
function handleMainMenu() {
    printMenu();
    rl.question('Elige una opción: ', (choice) => {
        switch (choice.trim()) {
            case '1': createUserPrompt(); break;
            case '2': listUsers(); break;
            case '3': updateUserPrompt(); break;
            case '4': deleteUserPrompt(); break;
            case '5': createGroupPrompt(); break;
            case '6': listGroups(); break;
            case '7': deleteGroupPrompt(); break;
            case '0': 
                mongoose.connection.close(() => {
                    console.log('👋 Conexión a MongoDB cerrada. ¡Adiós!'); 
                    rl.close();
                });
                return;
            default: console.log('Opción no válida. Inténtalo de nuevo.'); handleMainMenu();
        }
    });
}

// --- Lógica CRUD: USUARIOS (Implementación con Mongoose) ---

async function createUserPrompt() {
    rl.question('Grupo', (name))
    rl.question('Nombre de usuario: ', (username) => {
        rl.question('Contraseña: ', (password) => {
            rl.question('Email: ', async (email) => {
                try {
                    const newUser = new User({ name, username, password, email });
                    await newUser.save();
                    console.log(`✅ Usuario creado exitosamente: ${username}`);
                } catch (error) {
                    console.error('❌ Error al crear usuario:', error.message);
                }
                handleMainMenu();
            });
        });
    });
}

async function listUsers() {
    try {
        const users = await User.find({});
        console.log('\n--- LISTA DE USUARIOS ---');
        if (users.length === 0) {
            console.log('No hay usuarios registrados.');
        } else {
            users.forEach(u => console.log(`ID: ${u._id} | Grupo: ${u.name} | Nombre: ${u.username} | Email: ${u.email}`));
        }
    } catch (error) {
        console.error('❌ Error al listar usuarios:', error.message);
    }
    handleMainMenu();
}

async function updateUserPrompt() {
    rl.question('ID del usuario a modificar: ', async (id) => {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('⚠️ ID inválido. Por favor, usa un ID válido de 24 caracteres.');
            handleMainMenu();
            return;
        }
        rl.question('Nuevo grupo (dejar vacío para no cambiar): ', (newName) => {
        rl.question('Nuevo nombre (dejar vacío para no cambiar): ', (newUsername) => {
            rl.question('Nueva contraseña (dejar vacío para no cambiar): ', async (newPassword) => {
                const updates = {};
                if (newUsername) updates.username = newUsername;
                if (newPassword) updates.password = newPassword; 

                try {
                    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
                    if (!updatedUser) {
                        console.log('⚠️ Usuario no encontrado.');
                    } else {
                        console.log(`✅ Usuario ID ${id} modificado. Nuevo nombre: ${updatedUser.username}`);
                    }
                } catch (error) {
                    console.error('❌ Error al modificar usuario:', error.message);
                }
                handleMainMenu();
                });
            });
        });
    });
}

async function deleteUserPrompt() {
    rl.question('ID del usuario a borrar: ', async (id) => {
        try {
            const result = await User.findByIdAndDelete(id);
            if (!result) {
                console.log('⚠️ Usuario no encontrado.');
            } else {
                console.log(`🗑️ Usuario ID ${id} eliminado.`);
            }
        } catch (error) {
            console.error('❌ Error al borrar usuario:', error.message);
        }
        handleMainMenu();
    });
}

// --- Lógica CRUD: GRUPOS (Similar a Usuarios) ---

async function createGroupPrompt() {
    rl.question('Nombre del grupo: ', (name) => {
        rl.question('Descripción del grupo: ', async (description) => {
            try {
                const newGroup = new Group({ name, description });
                await newGroup.save();
                console.log(`✅ Grupo creado exitosamente: ${name}`);
            } catch (error) {
                console.error('❌ Error al crear grupo:', error.message);
            }
            handleMainMenu();
        });
    });
}

async function listGroups() {
    try {
        const groups = await Group.find({});
        console.log('\n--- LISTA DE GRUPOS ---');
        if (groups.length === 0) {
            console.log('No hay grupos registrados.');
        } else {
            groups.forEach(g => console.log(`ID: ${g._id} | Nombre: ${g.name} | Descripción: ${g.description}`));
        }
    } catch (error) {
        console.error('❌ Error al listar grupos:', error.message);
    }
    handleMainMenu();
}

async function deleteGroupPrompt() {
    rl.question('ID del grupo a borrar: ', async (id) => {
        try {
            const result = await Group.findByIdAndDelete(id);
            if (!result) {
                console.log('⚠️ Grupo no encontrado.');
            } else {
                console.log(`🗑️ Grupo ID ${id} eliminado.`);
            }
        } catch (error) {
            console.error('❌ Error al borrar grupo:', error.message);
        }
        handleMainMenu();
    });
}

// --- INICIO DEL PROGRAMA ---

async function initializeApp() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔗 Conexión a MongoDB establecida exitosamente.');
        handleMainMenu(); // Inicia el menú principal
    } catch (error) {
        console.error('❌ Error fatal al conectar a MongoDB:', error.message);
        rl.close();
        process.exit(1);
    }
}

initializeApp();