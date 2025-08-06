// src/controller/authController.js

// Prisma para interactuar con la base de datos
const prisma = require("../../prismaClient");

// Bcrypt para el hash y verificación de contraseñas
const bcrypt = require("bcrypt");

// JWT para autenticación basada en tokens
const jwt = require("jsonwebtoken");

// Carga variables de entorno desde .env
require("dotenv").config();

//
// ─── VALIDACIONES BÁSICAS ─────────────────────────────────────────────
//

/**
 * Valida si el email tiene un formato correcto.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida la fortaleza de la contraseña:
 * Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.
 */
function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

//
// ─── REGISTRO DE USUARIO ──────────────────────────────────────────────
//

/**
 * Controlador para registrar nuevos usuarios (escuelas o voluntarios).
 * Valida datos, encripta la contraseña, crea el usuario y retorna un JWT.
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validación de campos requeridos
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Formato de email inválido" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número",
      });
    }

    // Verifica si ya existe un usuario con ese email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email ya registrado" });
    }

    // Buscar el rol solicitado
    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    if (!roleRecord) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    // Encriptar la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role_id: roleRecord.id,
      },
    });

    let school = null;

    // Crear registros adicionales según el tipo de rol
    if (role === "school") {
      school = await prisma.school.create({
        data: {
          user_id: user.id,
          school_name: `Escuela de ${name}`,
          contact_person: name,
          phone: "", // opcional, puedes ajustarlo desde el frontend
        },
      });
    }

    if (role === "volunteer") {
      await prisma.volunteer.create({
        data: {
          user_id: user.id,
          specialties: [],
          modality: "online", // valor por defecto, puede cambiarse luego
        },
      });
    }

    // Construir el token JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: roleRecord.name,
      name: user.name,
      ...(school && { schoolId: school.id }),
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    // Respuesta al cliente
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleRecord.name,
        ...(school && { school: { id: school.id } }),
      },
    });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

//
// ─── INICIO DE SESIÓN ─────────────────────────────────────────────────
//

/**
 * Controlador para iniciar sesión.
 * Verifica credenciales y devuelve un token JWT si son correctas.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email y password son requeridos" });

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Formato de email inválido" });
    }

    // Buscar al usuario e incluir su rol y escuela si corresponde
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        school: true,
      },
    });

    if (!user)
      return res.status(401).json({ message: "Credenciales inválidas" });

    // Comparar contraseña ingresada con la almacenada
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ message: "Credenciales inválidas" });

    // Crear payload para el JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      name: user.name,
      ...(user.school && { schoolId: user.school.id }),
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    // Enviar respuesta con token y datos del usuario
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        ...(user.school && { school: { id: user.school.id } }),
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

//
// ─── EXPORTACIÓN DE FUNCIONES ────────────────────────────────────────
//

module.exports = { register, login };
