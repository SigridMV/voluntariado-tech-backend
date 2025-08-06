// src/prismaClient.js

// Importa el cliente de Prisma, que nos permite interactuar con la base de datos
const { PrismaClient } = require("@prisma/client");

// Crea una nueva instancia del cliente de Prisma
const prisma = new PrismaClient();

// Exporta la instancia para que pueda ser utilizada en otras partes de la aplicación
module.exports = prisma;
