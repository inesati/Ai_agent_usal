import { useEffect, useState } from 'react';
import { supabase, Student, Resource } from './lib/supabase';
import Auth from './components/Auth';
import AIAgent from './components/AIAgent';
import TaskManager from './components/TaskManager';
import ScheduleManager from './components/ScheduleManager';
import GradeCalculator from './components/GradeCalculator';
import ResourceFinder from './components/ResourceFinder';
import { Bot, CheckSquare, Calendar, Award, MapPin, LogOut, User } from 'lucide-react';

type View = 'ai' | 'tasks' | 'schedule' | 'grades' | 'resources';

function App() {
  const [session, setSession] = useState<any>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [currentView, setCurrentView] = useState<View>('ai');
  const [highlightResourceType, setHighlightResourceType] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadStudentData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadStudentData(session.user.id);
      } else {
        setStudent(null);
        setLoading(false);
      }
    });

    loadResources();

    return () => subscription.unsubscribe();
  }, []);

  const loadStudentData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setStudent(data);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const { data, error } = await supabase.from('resources').select('*');
      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleRecommendResource = (type: string) => {
    setHighlightResourceType(type);
    setCurrentView('resources');
    setTimeout(() => setHighlightResourceType(''), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 rounded-full mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">USAL</span>
          </div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session || !student) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  const menuItems = [
    { id: 'ai' as View, label: 'Asistente IA', icon: Bot },
    { id: 'tasks' as View, label: 'Tareas', icon: CheckSquare },
    { id: 'schedule' as View, label: 'Horarios', icon: Calendar },
    { id: 'grades' as View, label: 'Calificaciones', icon: Award },
    { id: 'resources' as View, label: 'Recursos', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-amber-600 rounded-full">
                <span className="text-white text-lg font-bold">USAL</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Agente IA - USAL</h1>
                <p className="text-xs text-gray-600">Universidad de Salamanca</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <User size={18} className="text-amber-600" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-600">{student.faculty}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-6">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        currentView === item.id
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-sm text-amber-900 mb-2">
                  Tu perfil académico
                </h3>
                <div className="space-y-1 text-xs text-amber-800">
                  <p>
                    <span className="font-medium">Grado:</span> {student.degree}
                  </p>
                  <p>
                    <span className="font-medium">Curso:</span> {student.year}º
                  </p>
                  <p>
                    <span className="font-medium">Facultad:</span> {student.faculty}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {currentView === 'ai' && (
              <div className="h-[calc(100vh-10rem)]">
                <AIAgent resources={resources} onRecommendResource={handleRecommendResource} />
              </div>
            )}
            {currentView === 'tasks' && <TaskManager studentId={student.id} />}
            {currentView === 'schedule' && <ScheduleManager studentId={student.id} />}
            {currentView === 'grades' && <GradeCalculator studentId={student.id} />}
            {currentView === 'resources' && (
              <ResourceFinder highlightType={highlightResourceType} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
