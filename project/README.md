# Sistema de Control de Equipos Externos - Hospital

Sistema web para el control y registro de equipos externos en un hospital, con autenticación basada en roles y gestión completa de entradas y salidas.

## Características

- **Autenticación con Supabase**: Login seguro con email/password
- **Control de Acceso Basado en Roles**: ADMIN, SEGURIDAD, BIOMEDICO
- **Gestión de Equipos**: CRUD completo de equipos externos (solo ADMIN)
- **Registro de Entradas**: Registro con fotografía y datos del equipo
- **Registro de Salidas**: Actualización de registros abiertos
- **Historial Completo**: Filtros avanzados por estado, marca, empresa y fecha
- **Dashboard**: Estadísticas en tiempo real
- **Gestión de Usuarios**: Administración de usuarios y roles (solo ADMIN)

## Tecnologías

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase (Auth + Database + Storage)
- Lucide React (iconos)

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── ProtectedRoute.tsx
├── context/            # Contextos de React
│   └── AuthContext.tsx
├── hooks/              # Custom hooks
│   └── useRoles.ts
├── layouts/            # Layouts principales
│   └── AppLayout.tsx
├── lib/                # Configuraciones
│   └── supabaseClient.ts
├── pages/              # Páginas de la aplicación
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── EquiposListPage.tsx
│   ├── EquipoFormPage.tsx
│   ├── RegistrarEntradaPage.tsx
│   ├── RegistrarSalidaPage.tsx
│   ├── HistorialMovimientosPage.tsx
│   └── UsuariosPage.tsx
├── types/              # Tipos TypeScript
│   └── domain.ts
└── routes.tsx          # Configuración de rutas
```

## Base de Datos

### Tablas

- **roles**: Roles del sistema (ADMIN, SEGURIDAD, BIOMEDICO)
- **usuarios**: Usuarios del sistema con sus roles
- **equipos_externos**: Catálogo de equipos de terceros
- **registros_movimiento**: Historial de entradas y salidas

### Storage

- **equipos-fotos**: Bucket público para almacenar fotografías de equipos

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (crear archivo `.env`):
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

4. Ejecutar el proyecto:
```bash
npm run dev
```

## Scripts

- `npm run dev`: Iniciar servidor de desarrollo
- `npm run build`: Construir para producción
- `npm run preview`: Previsualizar build de producción
- `npm run lint`: Ejecutar linter
- `npm run typecheck`: Verificar tipos TypeScript

## Roles y Permisos

### ADMIN
- Gestión completa de equipos
- Gestión de usuarios
- Registro de entradas y salidas
- Acceso al historial

### SEGURIDAD
- Registro de entradas y salidas
- Acceso al historial

### BIOMEDICO
- Registro de entradas y salidas
- Acceso al historial

## Flujo de Trabajo

1. **Login**: Autenticación con email/password
2. **Dashboard**: Vista general de estadísticas
3. **Registrar Entrada**: Seleccionar equipo, subir foto, registrar datos
4. **Registrar Salida**: Seleccionar registro abierto y completar salida
5. **Historial**: Visualizar y filtrar todos los movimientos
6. **Gestión de Equipos**: CRUD de equipos (solo ADMIN)
7. **Gestión de Usuarios**: Administrar usuarios y roles (solo ADMIN)

## Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Políticas restrictivas basadas en autenticación y roles
- Validación de permisos en frontend y backend
- Storage con políticas de acceso controladas

## Despliegue

El proyecto está configurado para desplegarse en Netlify como sitio estático:

1. Conectar repositorio con Netlify
2. Configurar variables de entorno en Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

## Licencia

Propietario
