/*
  # Universidad de Salamanca AI Agent - Database Schema

  ## Overview
  This migration creates the complete database structure for the USAL AI Agent system,
  including student profiles, academic tasks, schedules, grades, and university resources.

  ## New Tables

  ### 1. `students`
  Student profile information
  - `id` (uuid, primary key) - Unique student identifier
  - `user_id` (uuid, references auth.users) - Links to authentication
  - `name` (text) - Student full name
  - `email` (text) - Student email
  - `faculty` (text) - Faculty/School name
  - `degree` (text) - Degree program
  - `year` (integer) - Current academic year
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `tasks`
  Academic tasks, assignments, and exams
  - `id` (uuid, primary key) - Unique task identifier
  - `student_id` (uuid, foreign key) - References students table
  - `title` (text) - Task title
  - `description` (text) - Detailed description
  - `type` (text) - Type: 'assignment', 'exam', 'project', 'reading'
  - `subject` (text) - Subject/course name
  - `due_date` (timestamptz) - Deadline
  - `priority` (text) - Priority level: 'low', 'medium', 'high'
  - `status` (text) - Status: 'pending', 'in_progress', 'completed'
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `schedules`
  Class schedules and study time blocks
  - `id` (uuid, primary key) - Unique schedule identifier
  - `student_id` (uuid, foreign key) - References students table
  - `title` (text) - Event title
  - `type` (text) - Type: 'class', 'study', 'exam', 'meeting'
  - `location` (text) - Physical location
  - `day_of_week` (integer) - Day (0=Sunday, 6=Saturday)
  - `start_time` (time) - Start time
  - `end_time` (time) - End time
  - `color` (text) - Display color
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `grades`
  Student grades and academic performance
  - `id` (uuid, primary key) - Unique grade identifier
  - `student_id` (uuid, foreign key) - References students table
  - `subject` (text) - Subject/course name
  - `assessment_name` (text) - Name of assessment
  - `grade` (numeric) - Grade value (0-10 scale)
  - `weight` (numeric) - Weight percentage in final grade
  - `date` (date) - Assessment date
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. `resources`
  University resources (libraries, study rooms, cafeterias, etc.)
  - `id` (uuid, primary key) - Unique resource identifier
  - `name` (text) - Resource name
  - `type` (text) - Type: 'library', 'study_room', 'cafeteria', 'computer_lab', 'other'
  - `location` (text) - Physical location/building
  - `description` (text) - Detailed description
  - `opening_hours` (text) - Operating hours
  - `capacity` (integer) - Maximum capacity
  - `amenities` (text[]) - Available amenities/features
  - `faculty` (text) - Associated faculty (if applicable)
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  
  All tables have Row Level Security (RLS) enabled with restrictive policies:
  - Students can only access their own data
  - All operations require authentication
  - Each table has separate policies for SELECT, INSERT, UPDATE, and DELETE

  ## Important Notes
  
  1. Uses UUID for all primary keys with automatic generation
  2. Timestamps use `timestamptz` for timezone awareness
  3. Foreign key constraints ensure referential integrity
  4. Default values provided where appropriate
  5. All tables use RLS for data security
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