# Tienda de Plantas – Frontend (React + Vite)

Frontend para la API de Tienda de Plantas.  
Incluye:
- Listado y detalle de plantas
- Alta/edición/eliminación de plantas (Admin)
- Búsqueda por ID
- Registro de cliente
- Login (HTTP Basic compatible con backend actual)
- Rutas protegidas por rol
- Indicador de salud (GET `/health`)
- Manejo de loading/errores
- CSS básico + responsive + accesibilidad mínima
- Docker Compose (db + back + front)
- CI (lint + test + build)

## Requisitos
- Node 18+ (se usa Node 20 en CI)
- Docker (para compose)
- Backend corriendo en `http://localhost:8080` o variable `VITE_API_BASE_URL`

## Variables
Crea `.env` desde `.env.example`:
