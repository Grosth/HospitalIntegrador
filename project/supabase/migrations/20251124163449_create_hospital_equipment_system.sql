/*
  # Sistema de Control de Equipos Externos - Hospital

  1. Tablas Nuevas
    - `roles` - Roles de usuario (ADMIN, SEGURIDAD, BIOMEDICO)
      - `id` (serial, primary key)
      - `nombre` (text, unique)
    - `usuarios` - Usuarios del sistema
      - `id` (uuid, primary key, FK a auth.users)
      - `nombre` (text)
      - `apellido` (text)
      - `email` (text, unique)
      - `estado` (boolean, activo/inactivo)
      - `rol_id` (int, FK a roles)
      - `created_at` (timestamptz)
    - `equipos_externos` - Equipos de terceros
      - `id` (bigserial, primary key)
      - `tipo` (text)
      - `marca` (text)
      - `modelo` (text)
      - `serial` (text, unique)
      - `empresa_tercero` (text)
      - `contacto` (text)
      - `telefono_contacto` (text)
      - `activo` (boolean)
      - `created_at` (timestamptz)
    - `registros_movimiento` - Registro de entradas/salidas
      - `id` (bigserial, primary key)
      - `equipo_id` (bigint, FK a equipos_externos)
      - `fecha_hora_entrada` (timestamptz)
      - `fecha_hora_salida` (timestamptz, nullable)
      - `area_destino` (text)
      - `motivo` (text)
      - `estado` (text: ENTRADA, SALIDA)
      - `foto_url` (text)
      - `observacion` (text)
      - `registrado_por` (uuid, FK a usuarios)
      - `created_at` (timestamptz)

  2. Storage
    - Bucket `equipos-fotos` para almacenar fotografías

  3. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas restrictivas según rol de usuario
*/

-- Crear tabla roles
CREATE TABLE IF NOT EXISTS roles (
  id serial PRIMARY KEY,
  nombre text UNIQUE NOT NULL
);

-- Insertar roles predefinidos
INSERT INTO roles (nombre) VALUES ('ADMIN'), ('SEGURIDAD'), ('BIOMEDICO')
ON CONFLICT (nombre) DO NOTHING;

-- Crear tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  apellido text NOT NULL,
  email text UNIQUE NOT NULL,
  estado boolean DEFAULT true,
  rol_id int REFERENCES roles(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver usuarios"
  ON usuarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo ADMIN puede insertar usuarios"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'ADMIN'
    )
  );

CREATE POLICY "Solo ADMIN puede actualizar usuarios"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'ADMIN'
    )
  );

-- Crear tabla equipos_externos
CREATE TABLE IF NOT EXISTS equipos_externos (
  id bigserial PRIMARY KEY,
  tipo text NOT NULL,
  marca text NOT NULL,
  modelo text NOT NULL,
  serial text UNIQUE NOT NULL,
  empresa_tercero text NOT NULL,
  contacto text NOT NULL,
  telefono_contacto text NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE equipos_externos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver equipos"
  ON equipos_externos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo ADMIN puede insertar equipos"
  ON equipos_externos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'ADMIN'
    )
  );

CREATE POLICY "Solo ADMIN puede actualizar equipos"
  ON equipos_externos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'ADMIN'
    )
  );

CREATE POLICY "Solo ADMIN puede eliminar equipos"
  ON equipos_externos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'ADMIN'
    )
  );

-- Crear tabla registros_movimiento
CREATE TABLE IF NOT EXISTS registros_movimiento (
  id bigserial PRIMARY KEY,
  equipo_id bigint REFERENCES equipos_externos(id) ON DELETE CASCADE NOT NULL,
  fecha_hora_entrada timestamptz DEFAULT now(),
  fecha_hora_salida timestamptz,
  area_destino text NOT NULL,
  motivo text NOT NULL,
  estado text NOT NULL CHECK (estado IN ('ENTRADA', 'SALIDA')),
  foto_url text,
  observacion text,
  registrado_por uuid REFERENCES usuarios(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE registros_movimiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver movimientos"
  ON registros_movimiento FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar movimientos"
  ON registros_movimiento FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = registrado_por);

CREATE POLICY "Usuarios autenticados pueden actualizar movimientos"
  ON registros_movimiento FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_id ON usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_equipos_serial ON equipos_externos(serial);
CREATE INDEX IF NOT EXISTS idx_equipos_activo ON equipos_externos(activo);
CREATE INDEX IF NOT EXISTS idx_movimientos_equipo ON registros_movimiento(equipo_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_estado ON registros_movimiento(estado);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha_entrada ON registros_movimiento(fecha_hora_entrada);

-- Crear bucket de storage para fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('equipos-fotos', 'equipos-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Usuarios autenticados pueden subir fotos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'equipos-fotos');

CREATE POLICY "Fotos son públicas para lectura"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'equipos-fotos');