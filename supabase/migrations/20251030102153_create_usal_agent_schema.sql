/*
  Universidad de Salamanca - Esquema de Base de Datos del Agente AI

  ## Resumen
  Esta migración crea la estructura completa de la base de datos para el sistema USAL AI Agent,
  incluyendo perfiles de estudiantes, tareas académicas, horarios, calificaciones y recursos universitarios.

  ## Tablas Nuevas

  ### 1. `students`
  Información de los estudiantes
  - `id` (uuid, clave primaria) - Identificador único del estudiante
  - `user_id` (uuid, referencias auth.users) - Vinculado al sistema de autenticación
  - `name` (text) - Nombre completo
  - `email` (text) - Correo electrónico
  - `faculty` (text) - Facultad o escuela
  - `degree` (text) - Programa de estudios
  - `year` (integer) - Año académico actual
  - `created_at` (timestamptz) - Fecha de creación del registro

  ### 2. `tasks`
  Tareas académicas, asignaciones y exámenes
  - `id` (uuid, clave primaria) - Identificador único de la tarea
  - `student_id` (uuid, clave foránea) - Referencia a la tabla students
  - `title` (text) - Título de la tarea
  - `description` (text) - Descripción detallada
  - `type` (text) - Tipo: 'assignment', 'exam', 'project', 'reading'
  - `subject` (text) - Nombre de la asignatura
  - `due_date` (timestamptz) - Fecha límite
  - `priority` (text) - Prioridad: 'low', 'medium', 'high'
  - `status` (text) - Estado: 'pending', 'in_progress', 'completed'
  - `created_at` (timestamptz) - Fecha de creación del registro

  ### 3. `schedules`
  Horarios de clases y bloques de estudio
  - `id` (uuid, clave primaria) - Identificador único del horario
  - `student_id` (uuid, clave foránea) - Referencia a la tabla students
  - `title` (text) - Título del evento
  - `type` (text) - Tipo: 'class', 'study', 'exam', 'meeting'
  - `location` (text) - Ubicación física
  - `day_of_week` (integer) - Día de la semana (0=domingo, 6=sábado)
  - `start_time` (time) - Hora de inicio
  - `end_time` (time) - Hora de finalización
  - `color` (text) - Color para visualización
  - `created_at` (timestamptz) - Fecha de creación del registro

  ### 4. `grades`
  Calificaciones y desempeño académico
  - `id` (uuid, clave primaria) - Identificador único de la calificación
  - `student_id` (uuid, clave foránea) - Referencia a la tabla students
  - `subject` (text) - Nombre de la asignatura
  - `assessment_name` (text) - Nombre de la evaluación
  - `grade` (numeric) - Valor de la calificación (escala 0-10)
  - `weight` (numeric) - Peso porcentual en la nota final
  - `date` (date) - Fecha de la evaluación
  - `created_at` (timestamptz) - Fecha de creación del registro

  ### 5. `resources`
  Recursos universitarios (bibliotecas, salas de estudio, cafeterías, etc.)
  - `id` (uuid, clave primaria) - Identificador único del recurso
  - `name` (text) - Nombre del recurso
  - `type` (text) - Tipo: 'library', 'study_room', 'cafeteria', 'computer_lab', 'other'
  - `location` (text) - Ubicación o edificio
  - `description` (text) - Descripción detallada
  - `opening_hours` (text) - Horario de atención
  - `capacity` (integer) - Capacidad máxima
  - `amenities` (text[]) - Servicios o características disponibles
  - `faculty` (text) - Facultad asociada (si aplica)
  - `created_at` (timestamptz) - Fecha de creación del registro

  ## Seguridad
  
  Todas las tablas cuentan con Row Level Security (RLS) y políticas restrictivas:
  - Los estudiantes solo pueden acceder a sus propios datos
  - Todas las operaciones requieren autenticación
  - Cada tabla tiene políticas separadas para SELECT, INSERT, UPDATE y DELETE

  ## Notas Importantes
  
  1. Se utiliza UUID como clave primaria, con generación automática
  2. Las fechas usan `timestamptz` para soporte de zonas horarias
  3. Las claves foráneas garantizan integridad referencial
  4. Se definen valores por defecto cuando es necesario
  5. Todas las tablas aplican RLS para seguridad de los datos
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  faculty text NOT NULL DEFAULT '',
  degree text NOT NULL DEFAULT '',
  year integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL DEFAULT 'assignment',
  subject text NOT NULL,
  due_date timestamptz NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'class',
  location text DEFAULT '',
  day_of_week integer NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  color text DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now()
);

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  assessment_name text NOT NULL,
  grade numeric NOT NULL,
  weight numeric NOT NULL DEFAULT 0,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  location text NOT NULL,
  description text DEFAULT '',
  opening_hours text DEFAULT '',
  capacity integer DEFAULT 0,
  amenities text[] DEFAULT '{}',
  faculty text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table
CREATE POLICY "Students can view own profile"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own profile"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own profile"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can delete own profile"
  ON students FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for tasks table
CREATE POLICY "Students can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = tasks.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = tasks.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = tasks.student_id
      AND students.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = tasks.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = tasks.student_id
      AND students.user_id = auth.uid()
    )
  );

-- RLS Policies for schedules table
CREATE POLICY "Students can view own schedules"
  ON schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = schedules.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own schedules"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = schedules.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own schedules"
  ON schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = schedules.student_id
      AND students.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = schedules.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can delete own schedules"
  ON schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = schedules.student_id
      AND students.user_id = auth.uid()
    )
  );

-- RLS Policies for grades table
CREATE POLICY "Students can view own grades"
  ON grades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = grades.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own grades"
  ON grades FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = grades.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own grades"
  ON grades FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = grades.student_id
      AND students.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = grades.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can delete own grades"
  ON grades FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = grades.student_id
      AND students.user_id = auth.uid()
    )
  );

-- RLS Policies for resources table (public read access, no write access for students)
CREATE POLICY "Anyone can view resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample university resources
INSERT INTO resources (name, type, location, description, opening_hours, capacity, amenities, faculty) VALUES
  ('Biblioteca General Histórica', 'library', 'Escuelas Mayores', 'Biblioteca histórica con fondos antiguos y sala de lectura', 'Lun-Vie: 9:00-20:00, Sáb: 9:00-14:00', 100, ARRAY['wifi', 'ordenadores', 'sala_silencio', 'escaner'], ''),
  ('Biblioteca Abraham Zacut', 'library', 'Campus Unamuno', 'Biblioteca moderna con amplios espacios de estudio', 'Lun-Vie: 8:30-21:00, Sáb-Dom: 9:00-14:00', 200, ARRAY['wifi', 'ordenadores', 'sala_grupo', 'cafe'], ''),
  ('Sala de Estudio 24h', 'study_room', 'Facultad de Derecho', 'Sala de estudio abierta 24 horas durante exámenes', '24 horas', 80, ARRAY['wifi', 'enchufes', 'climatizado'], 'Derecho'),
  ('Aula de Informática A1', 'computer_lab', 'Facultad de Ciencias', 'Laboratorio con 40 ordenadores y software especializado', 'Lun-Vie: 8:00-20:00', 40, ARRAY['wifi', 'software_cientifico', 'impresora'], 'Ciencias'),
  ('Cafetería Central', 'cafeteria', 'Campus Unamuno', 'Cafetería principal con menú del día y bocadillos', 'Lun-Vie: 8:00-18:00', 150, ARRAY['wifi', 'terraza', 'menu_dia'], ''),
  ('Sala de Trabajo en Grupo', 'study_room', 'Biblioteca Francisco de Vitoria', 'Salas reservables para trabajo en equipo', 'Lun-Vie: 9:00-21:00', 24, ARRAY['wifi', 'pizarra', 'proyector'], ''),
  ('Aula Multimedia', 'computer_lab', 'Facultad de Filología', 'Aula con equipos multimedia para idiomas', 'Lun-Vie: 9:00-19:00', 30, ARRAY['wifi', 'software_idiomas', 'auriculares'], 'Filología')
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_student_id ON tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_schedules_student_id ON schedules(student_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
