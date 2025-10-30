import { useState, useEffect } from 'react';
import { supabase, Task } from '../lib/supabase';
import { Plus, CheckCircle2, Clock, AlertCircle, Trash2 } from 'lucide-react';

type TaskManagerProps = {
  studentId: string;
};

export default function TaskManager({ studentId }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'assignment' as Task['type'],
    subject: '',
    due_date: '',
    priority: 'medium' as Task['priority'],
  });

  useEffect(() => {
    loadTasks();
  }, [studentId]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('student_id', studentId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('tasks').insert({
        student_id: studentId,
        ...formData,
      });

      if (error) throw error;
      await loadTasks();
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        type: 'assignment',
        subject: '',
        due_date: '',
        priority: 'medium',
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'exam':
        return '📝';
      case 'project':
        return '📁';
      case 'reading':
        return '📖';
      default:
        return '✏️';
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  if (loading) {
    return <div className="text-center py-8">Cargando tareas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tareas Académicas</h2>
          <p className="text-gray-600">Organiza tus asignaciones y exámenes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nueva Tarea
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Crear Nueva Tarea</h3>
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
                />
              </div>

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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as Task['type'] })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="assignment">Tarea</option>
                  <option value="exam">Examen</option>
                  <option value="project">Proyecto</option>
                  <option value="reading">Lectura</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Entrega
                </label>
                <input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as Task['priority'] })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Crear Tarea
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-orange-600" size={24} />
            <h3 className="text-lg font-semibold">Pendientes ({pendingTasks.length})</h3>
          </div>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={updateTaskStatus}
                onDelete={deleteTask}
                getPriorityColor={getPriorityColor}
                getTypeIcon={getTypeIcon}
              />
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-gray-500 text-sm">No hay tareas pendientes</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold">En Progreso ({inProgressTasks.length})</h3>
          </div>
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={updateTaskStatus}
                onDelete={deleteTask}
                getPriorityColor={getPriorityColor}
                getTypeIcon={getTypeIcon}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-gray-500 text-sm">No hay tareas en progreso</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold">Completadas ({completedTasks.length})</h3>
          </div>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={updateTaskStatus}
                onDelete={deleteTask}
                getPriorityColor={getPriorityColor}
                getTypeIcon={getTypeIcon}
              />
            ))}
            {completedTasks.length === 0 && (
              <p className="text-gray-500 text-sm">No hay tareas completadas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onDelete,
  getPriorityColor,
  getTypeIcon,
}: {
  task: Task;
  onStatusChange: (id: string, status: Task['status']) => void;
  onDelete: (id: string) => void;
  getPriorityColor: (priority: Task['priority']) => string;
  getTypeIcon: (type: Task['type']) => string;
}) {
  const dueDate = new Date(task.due_date);
  const isOverdue = dueDate < new Date() && task.status !== 'completed';

  return (
    <div className={`border rounded-lg p-3 ${getPriorityColor(task.priority)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          <span className="text-lg">{getTypeIcon(task.type)}</span>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{task.title}</h4>
            <p className="text-xs opacity-75">{task.subject}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-600 hover:text-red-800 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className={`text-xs mb-2 ${isOverdue ? 'text-red-700 font-medium' : ''}`}>
        {dueDate.toLocaleDateString('es-ES')} - {dueDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="flex gap-1">
        {task.status !== 'pending' && (
          <button
            onClick={() => onStatusChange(task.id, 'pending')}
            className="text-xs px-2 py-1 bg-white rounded hover:bg-gray-100 transition-colors"
          >
            Pendiente
          </button>
        )}
        {task.status !== 'in_progress' && (
          <button
            onClick={() => onStatusChange(task.id, 'in_progress')}
            className="text-xs px-2 py-1 bg-white rounded hover:bg-gray-100 transition-colors"
          >
            En Progreso
          </button>
        )}
        {task.status !== 'completed' && (
          <button
            onClick={() => onStatusChange(task.id, 'completed')}
            className="text-xs px-2 py-1 bg-white rounded hover:bg-gray-100 transition-colors"
          >
            Completar
          </button>
        )}
      </div>
    </div>
  );
}
