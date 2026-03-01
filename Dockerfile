# Utilizamos la imagen oficial de Node.js (versión 20 ligera)
FROM node:20-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar el package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para compilar TypeScript)
RUN npm install

# Copiar el resto del código del proyecto
COPY . .

# Compilar el código TypeScript a JavaScript
RUN npm run build

# Exponer el puerto en el que la aplicación se ejecuta (por defecto 3000)
EXPOSE 3000

# Comando para iniciar la aplicación (usando el código compilado)
CMD ["npm", "start"]
