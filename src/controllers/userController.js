//src/controllers/userController.js
const prisma = require("../../prismaClient"); // Importa la instancia de Prisma para acceder a la base de datos
const bcrypt = require("bcrypt"); // Librería para encriptar contraseñas
const jwt = require("jsonwebtoken"); // Librería para generar y verificar tokens JWT

/**
 * ✅ Registro de nuevo usuario
 * Recibe: name, email, password
 * Verifica si el usuario ya existe, encripta la contraseña y guarda al nuevo usuario en la base de datos.
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verifica si ya existe un usuario con ese email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    // Encripta la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea el nuevo usuario en la base de datos
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword, // Asegúrate de que tu modelo se llame "password_hash"
        role: {
          connect: { name: "user" }, // Opcional: asigna rol por defecto si lo usas
        },
      },
    });

    // Devuelve el nuevo usuario (sin la contraseña)
    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * ✅ Inicio de sesión (login)
 * Recibe: email, password
 * Verifica credenciales y devuelve un token JWT y datos del usuario.
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Busca el usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true, // Incluye el rol si lo usas en el sistema de permisos
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Compara la contraseña en texto plano con el hash almacenado
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Genera el token JWT con ID del usuario
    const token = jwt.sign(
      { id: user.id, role: user.role?.name }, // Puedes incluir rol si es útil para el frontend
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Token válido por 1 día
    );

    // Devuelve el token y los datos del usuario
    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Exporta las funciones para ser usadas en las rutas
module.exports = {
  registerUser,
  loginUser,
};
