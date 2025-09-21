# GreenScape – Tienda de Plantas (Frontend + Backend)

Proyecto full‑stack con **React + Vite** en el frontend y **Spring Boot** (Java) en el backend, **JWT** para auth y **MySQL** como base de datos.

>
> 1. Levanta MySQL (Docker abajo) · 2) Arranca el **backend** en `:8080` · 3) Arranca el **frontend** en `:5173` · 4) Inicia sesión con `client@tienda.com / client123`.

---

## Requisitos

* **Java 17+** (recomendado 21)
* **Node 18+** y **npm** (o pnpm/yarn)
* **MySQL 8+** (o Docker)
* **Maven** (`./mvnw`) o **Gradle** (`./gradlew`) según tu proyecto

---

## Arranque rápido

### 1) Base de datos (Docker)

```bash
# Crea una instancia MySQL expuesta en 3314 con DB inicial "store_plants"
docker run --name mysql-plantas -p 3314:3306 -e MYSQL_ROOT_PASSWORD=ironhack \
  -e MYSQL_DATABASE=store_plants -d mysql:8
```

### 2) Backend (Spring Boot)

1. Configura variables (opcional, ver tabla más abajo). Por defecto el backend intenta conectar a `jdbc:mysql://localhost:3314/store_plants` con `root/ironhack`.
2. Arranca:

   * con **Maven**: `./mvnw spring-boot:run`
   * con **Gradle**: `./gradlew bootRun`
3. API disponible en: [http://localhost:8080](http://localhost:8080)

### 3) Frontend (React + Vite)

1. Crea `.env` en el frontend:

   ```ini
   VITE_API_BASE_URL=http://localhost:8080
   ```
2. Instala y arranca:

   ```bash
   npm install
   npm run dev
   # Vite por defecto: http://localhost:5173
   ```

### 4) Usuarios de demo (seed)

* **admin**: `admin@tienda.com / admin123`
* **client**: `client@tienda.com / client123`
* **supplier**: `supplier@tienda.com / supplier123`

> El seeder crea datos de ejemplo (usuarios, plantas y posts). Si cambias `spring.jpa.hibernate.ddl-auto`, recuerda cómo afecta al seed.

---

## Variables de entorno

### Backend (Spring Boot)

Las siguientes propiedades pueden configurarse como **variables de entorno** (formato `MAYUS_CON_GUIONES`) o en `application.properties`.

| Propiedad Spring / Env          | Valor por defecto                                                                                        | Descripción                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `SPRING_DATASOURCE_URL`         | `jdbc:mysql://localhost:3314/store_plants?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC` | Cadena de conexión MySQL                   |
| `SPRING_DATASOURCE_USERNAME`    | `root`                                                                                                   | Usuario DB                                 |
| `SPRING_DATASOURCE_PASSWORD`    | `ironhack`                                                                                               | Password DB                                |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `create-drop`                                                                                            | Esquema: `create-drop`/`update`/`validate` |
| `SERVER_PORT`                   | `8080`                                                                                                   | Puerto del backend                         |
| `SECURITY_JWT_SECRET`           | `supersecreto-para-demo-...`                                                                             | **Cámbialo en local/prod**                 |
| `SECURITY_JWT_EXPIRATION_MS`    | `86400000`                                                                                               | Expiración del JWT en ms                   |

> CORS ya permite `http://localhost:*` (ver `SecurityConfig`). Si cambias puertos/orígenes, ajústalo allí.

### Frontend (Vite)

| Variable            | Por defecto             | Uso                         |
| ------------------- | ----------------------- | --------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Base para `axios` del front |

---

## API del backend

**Base URL:** `http://localhost:8080/api`

> Autenticación: `Authorization: Bearer <token>` tras `/auth/login`. Rutas públicas indicadas abajo.

### Salud

* `GET /health` → `{ status, db, time }` (pública)

### Auth

* `POST /auth/register` → crea cliente
* `POST /auth/login` → `{ token, user, ... }`
* `GET /auth/me` → info del usuario logueado
* `POST /auth/admin/create-user?role=ADMIN|CLIENT|SUPPLIER` (solo ADMIN)

**Ejemplo login**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@tienda.com","password":"client123"}'
```

### Plantas (`/plants`) – públicas salvo CRUD admin/supplier

* `GET /plants/{id}`
* `GET /plants/page?query=&page=&size=&sort=`
* `GET /plants/search` (búsqueda básica)
* `GET /plants/page/advanced` (búsqueda avanzada)
* `GET /plants/mine` y `GET /plants/mine/page` (plantas del proveedor actual)
* **ADMIN**: `POST /plants` · `PUT /plants/{id}` · `DELETE /plants/{id}`

### Órdenes / Carrito (`/orders`)

* **Cliente**

  * `GET /orders/cart` → carrito actual
  * `POST /orders/cart/add` → `{ plantId, quantity }`
  * `DELETE /orders/cart/items/{itemId}`
  * `POST /orders/cart/checkout`
  * `GET /orders/cart/history`
* **Supplier**

  * `GET /orders/supplier/inbox`
  * `GET /orders/supplier/mine`
  * `POST /orders/supplier/{id}/accept`
  * `POST /orders/supplier/{id}/complete`
* **Admin / compras**

  * `GET /orders/purchase` y `GET /orders/purchase/mine`
  * `POST /orders/purchase` → crea pedido de compra a proveedor

### Blog (`/blog`)

* `GET /blog` (lista pública)
* `GET /blog/{id}` (público)
* **ADMIN**: `POST /blog` · `PUT /blog/{id}` · `DELETE /blog/{id}`

### Reportes admin

* **ADMIN**: `GET /admin/reports/overview` → `{ totalUsers, totalPlants, totalOrders, totalRevenue }`

---

## Rutas del frontend (UI)

* `/` (home)
* `/tienda` (catálogo)
* `/blog` · `/blog/:id`
* `/contact`
* `/login` · `/register`
* **Privadas (login):** `/profile`, `/cart`, `/orders` (`/mi-historial`)
* **Admin:** `/admin`, `/admin/pedidos` (alias de `/admin/orders`)
* **Supplier:** `/supplier/inbox`

> El enrutado usa **React Router**. Los componentes `Protected` y `RoleProtected` bloquean acceso según JWT.

---

## Scripts útiles

### Backend

* Tests: `./mvnw test` · `./gradlew test`
* Empaquetar: `./mvnw -DskipTests package` o `./gradlew build`

### Frontend

* Dev: `npm run dev`
* Build: `npm run build`
* Preview: `npm run preview`

---

## Problemas comunes

* **No conecta a la DB** → verifica `SPRING_DATASOURCE_URL/USER/PASSWORD` y que MySQL está en `:3314`.
* **CORS** desde el front → asegúrate de usar `VITE_API_BASE_URL` correcto y que el back está en `http://localhost:8080`.
* **401** al llamar APIs privadas → confirma que envías `Authorization: Bearer <token>` y que no expiró.


