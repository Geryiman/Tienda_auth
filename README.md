GameBench Backend API

Este repositorio aloja la arquitectura de backend para la plataforma GameBench. El sistema está construido utilizando una arquitectura de microservicios orquestada mediante Docker, diseñada para desacoplar la gestión de usuarios, el catálogo de videojuegos y la lógica de reseñas.

Arquitectura del Sistema

El sistema expone un único punto de entrada (API Gateway) que redirige el tráfico a los servicios internos correspondientes.

API Gateway (Puerto 8080): Punto de entrada único para el cliente.

Users Service (Puerto 3001): Gestión de identidad y perfiles de hardware.

Catalog Service (Puerto 3002): Integración con IGDB/Steam y gestión de juegos.

Reviews Service (Puerto 3003): Gestión de reseñas y algoritmo de predicción.

Pre-requisitos

Docker Desktop (versión reciente)

Git

No es necesaria la instalación local de Node.js o MongoDB, ya que el entorno está completamente contenerizado.

Instalación y Ejecución

Siga estos pasos para iniciar el entorno de desarrollo local:

Clonar el repositorio

git clone <url-del-repositorio>
cd gamebench-backend


Iniciar los servicios
Ejecute el siguiente comando en la raíz del proyecto para construir las imágenes e iniciar los contenedores:

docker-compose up --build


Verificación
El sistema estará operativo cuando los logs indiquen que los servicios están escuchando en sus respectivos puertos.

Base URL para Frontend: http://localhost:8080

Documentación de Endpoints (API Reference)

Nota Importante: Todas las peticiones deben dirigirse exclusivamente al API Gateway (http://localhost:8080). No se debe acceder directamente a los microservicios.

1. Servicio de Usuarios (Auth & Profile)

Base path: /api/auth

Método

Endpoint

Estado (Semana 2)

Descripción

POST

/login

Mock

Retorna un token JWT simulado para pruebas de sesión.

POST

/register

Mock

Simula el registro de un nuevo usuario.

GET

/profile

Mock

Retorna datos de usuario y especificaciones de hardware (CPU/GPU).

2. Servicio de Catálogo (Games)

Base path: /api/games

Método

Endpoint

Estado (Semana 2)

Descripción

GET

/search?q={term}

Mock

Retorna resultados de búsqueda simulados (preparado para IGDB).

GET

/details/{id}

Mock

Retorna detalles del juego y requisitos técnicos mínimos/recomendados.

3. Servicio de Reseñas (Core)

Base path: /api/reviews

Método

Endpoint

Estado (Semana 2)

Descripción

GET

/game/{gameId}

Mock

Lista las reseñas asociadas a un ID de juego específico.

POST

/create

Mock

Endpoint para la creación de nuevas reseñas (técnicas y artísticas).

POST

/predict

Mock

Recibe especificaciones de hardware y retorna una predicción de rendimiento (FPS).

Tecnologías Utilizadas

Runtime: Node.js v20 (Alpine Linux distribution)

Framework: Express.js

Base de Datos: MongoDB (Database-per-service pattern)

Infraestructura: Docker & Docker Compose

Proxy: Express HTTP Proxy