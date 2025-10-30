import { useState, useEffect } from 'react';
import { supabase, Grade } from '../lib/supabase';
import { Plus, TrendingUp, Award, Trash2 } from 'lucide-react';

type GradeCalculatorProps = {
  studentId: string;
};

export default function GradeCalculator({ studentId }: GradeCalculatorProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    subject: '',
    assessment_name: '',
    grade: '',
    weight: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadGrades();
  }, [studentId]);

  const loadGrades = async () => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('grades').insert({
        student_id: studentId,
        subject: formData.subject,
        assessment_name: formData.assessment_name,
        grade: parseFloat(formData.grade),
        weight: parseFloat(formData.weight),
        date: formData.date,
      });

      if (error) throw error;
      await loadGrades();
      setShowForm(false);
      setFormData({
        subject: '',
        assessment_name: '',
        grade: '',
        weight: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error creating grade:', error);
    }
  };

  const deleteGrade = async (gradeId: string) => {
    try {
      const { error } = await supabase.from('grades').delete().eq('id', gradeId);
      if (error) throw error;
      await loadGrades();
    } catch (error) {
      console.error('Error deleting grade:', error);
    }
  };

  const getSubjects = () => {
    return Array.from(new Set(grades.map((g) => g.subject)));
  };

  const calculateSubjectAverage = (subject: string) => {
    const subjectGrades = grades.filter((g) => g.subject === subject);
    if (subjectGrades.length === 0) return 0;

    const totalWeight = subjectGrades.reduce((sum, g) => sum + Number(g.weight), 0);
    if (totalWeight === 0) {
      return subjectGrades.reduce((sum, g) => sum + Number(g.grade), 0) / subjectGrades.length;
    }

    const weightedSum = subjectGrades.reduce(
      (sum, g) => sum + Number(g.grade) * Number(g.weight),
      0
    );
    return weightedSum / totalWeight;
  };

  const calculateOverallAverage = () => {
    const subjects = getSubjects();
    if (subjects.length === 0) return 0;
    const sum = subjects.reduce((total, subject) => total + calculateSubjectAverage(subject), 0);
    return sum / subjects.length;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return 'text-green-600';
    if (grade >= 7) return 'text-blue-600';
    if (grade >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLabel = (grade: number) => {
    if (grade >= 9) return 'Sobresaliente';
    if (grade >= 7) return 'Notable';
    if (grade >= 5) return 'Aprobado';
    return 'Suspenso';
  };

  if (loading) {
    return <div className="text-center py-8">Cargando calificaciones...</div>;
  }

  const overallAverage = calculateOverallAverage();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calculadora de Notas</h2>
          <p className="text-gray-600">Registra tus notas y calcula tu promedio</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nueva Nota
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={32} />
            <h3 className="text-lg font-medium opacity-90">Promedio General</h3>
          </div>
          <p className="text-5xl font-bold">{overallAverage.toFixed(2)}</p>
          <p className="text-blue-100 mt-2">{getGradeLabel(overallAverage)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Award size={32} />
            <h3 className="text-lg font-medium opacity-90">Asignaturas</h3>
          </div>
          <p className="text-5xl font-bold">{getSubjects().length}</p>
          <p className="text-green-100 mt-2">Total registradas</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Award size={32} />
            <h3 className="text-lg font-medium opacity-90">Evaluaciones</h3>
          </div>
          <p className="text-5xl font-bold">{grades.length}</p>
          <p className="text-amber-100 mt-2">Total registradas</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Registrar Nueva Nota</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asignatura
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Ej: Matemáticas I"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluación
                </label>
                <input
                  type="text"
                  value={formData.assessment_name}
                  onChange={(e) =>
                    setFormData({ ...formData, assessment_name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Ej: Parcial 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nota (0-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="7.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="40"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Guardar Nota
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {getSubjects().map((subject) => {
          const subjectGrades = grades.filter((g) => g.subject === subject);
          const average = calculateSubjectAverage(subject);

          return (
            <div key={subject} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{subject}</h3>
                  <p className="text-sm text-gray-600">
                    {subjectGrades.length} evaluación(es)
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${getGradeColor(average)}`}>
                    {average.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">{getGradeLabel(average)}</p>
                </div>
              </div>

              <div className="space-y-2">
                {subjectGrades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{grade.assessment_name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(grade.date).toLocaleDateString('es-ES')} • Peso: {grade.weight}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${getGradeColor(Number(grade.grade))}`}>
                        {Number(grade.grade).toFixed(1)}
                      </span>
                      <button
                        onClick={() => deleteGrade(grade.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {getSubjects().length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500">
              No hay notas registradas. ¡Añade tu primera nota para comenzar!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
