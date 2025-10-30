import { useState, useEffect } from 'react';
import { supabase, Schedule } from '../lib/supabase';
import { Plus, Calendar, Trash2 } from 'lucide-react';

type ScheduleManagerProps = {
  studentId: string;
};

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'
];

export default function ScheduleManager({ studentId }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    type: 'class' as Schedule['type'],
    location: '',
    day_of_week: 1,
    start_time: '',
    end_time: '',
    color: COLORS[0],
  });

  useEffect(() => {
    loadSchedules();
  }, [studentId]);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('student_id', studentId)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('schedules').insert({
        student_id: studentId,
        ...formData,
      });

      if (error) throw error;
      await loadSchedules();
      setShowForm(false);
      setFormData({
        title: '',
        type: 'class',
        location: '',
        day_of_week: 1,
        start_time: '',
        end_time: '',
        color: COLORS[0],
      });
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', scheduleId);
      if (error) throw error;
      await loadSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const getSchedulesForDay = (day: number) => {
    return schedules
      .filter((s) => s.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const getTypeLabel = (type: Schedule['type']) => {
    switch (type) {
      case 'class': return '📚 Clase';
      case 'study': return '📖 Estudio';
      case 'exam': return '📝 Examen';
      case 'meeting': return '👥 Reunión';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando horarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Horario Semanal</h2>
          <p className="text-gray-600">Organiza tus clases y tiempo de estudio</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nuevo Evento
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Crear Nuevo Evento</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Ej: Matemáticas I"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as Schedule['type'] })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="class">Clase</option>
                  <option value="study">Estudio</option>
                  <option value="exam">Examen</option>
                  <option value="meeting">Reunión</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Ej: Aula 2.3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Día
                </label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) =>
                    setFormData({ ...formData, day_of_week: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  {DAYS.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Inicio
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Fin
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
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
                Crear Evento
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

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {DAYS.slice(1).map((day, index) => (
            <div key={day} className="bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-amber-600" />
                <h3 className="font-semibold text-gray-900">{day}</h3>
              </div>
              <div className="space-y-2">
                {getSchedulesForDay(index + 1).map((schedule) => (
                  <div
                    key={schedule.id}
                    className="rounded-lg p-3 text-white text-sm relative group"
                    style={{ backgroundColor: schedule.color }}
                  >
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-white text-gray-700 rounded p-1 hover:bg-gray-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className="font-medium mb-1">{schedule.title}</div>
                    <div className="text-xs opacity-90">
                      {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                    </div>
                    {schedule.location && (
                      <div className="text-xs opacity-90 mt-1">📍 {schedule.location}</div>
                    )}
                    <div className="text-xs opacity-90 mt-1">{getTypeLabel(schedule.type)}</div>
                  </div>
                ))}
                {getSchedulesForDay(index + 1).length === 0 && (
                  <div className="text-gray-400 text-xs text-center py-4">
                    Sin eventos
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
