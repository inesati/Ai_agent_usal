import { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { Resource } from '../lib/supabase';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type AIAgentProps = {
  resources: Resource[];
  onRecommendResource: (type: string) => void;
};

export default function AIAgent({ resources, onRecommendResource }: AIAgentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente virtual de la Universidad de Salamanca. Puedo ayudarte con información sobre la USAL, organizar tus tareas, calcular tus notas, gestionar tu horario y recomendar recursos del campus. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const generateResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    if (msg.includes('biblioteca') || msg.includes('estudiar') || msg.includes('lugar')) {
      const libraries = resources.filter(r => r.type === 'library' || r.type === 'study_room');
      if (libraries.length > 0) {
        onRecommendResource('library');
        return `He encontrado ${libraries.length} opciones para estudiar en la USAL:\n\n${libraries.map(r => `📚 ${r.name} - ${r.location}\n${r.opening_hours}`).join('\n\n')}\n\nPuedes ver más detalles en la sección de Recursos.`;
      }
    }

    if (msg.includes('cafetería') || msg.includes('comer') || msg.includes('comida')) {
      const cafeterias = resources.filter(r => r.type === 'cafeteria');
      if (cafeterias.length > 0) {
        onRecommendResource('cafeteria');
        return `Estas son las cafeterías disponibles:\n\n${cafeterias.map(r => `☕ ${r.name} - ${r.location}\n${r.opening_hours}`).join('\n\n')}`;
      }
    }

    if (msg.includes('ordenador') || msg.includes('informática') || msg.includes('laboratorio')) {
      const labs = resources.filter(r => r.type === 'computer_lab');
      if (labs.length > 0) {
        onRecommendResource('computer_lab');
        return `Estos son los laboratorios de informática disponibles:\n\n${labs.map(r => `💻 ${r.name} - ${r.location}\nCapacidad: ${r.capacity} personas\n${r.opening_hours}`).join('\n\n')}`;
      }
    }

    if (msg.includes('horario') || msg.includes('clase')) {
      return '¡Claro! Puedes gestionar tu horario en la sección "Horarios". Allí podrás:\n\n📅 Ver tu horario semanal\n➕ Añadir clases y eventos\n⏰ Organizar tu tiempo de estudio\n📍 Guardar ubicaciones de tus clases';
    }

    if (msg.includes('tarea') || msg.includes('examen') || msg.includes('trabajo')) {
      return 'Puedo ayudarte a organizar tus tareas académicas. En la sección "Tareas" puedes:\n\n✅ Crear nuevas tareas y asignaciones\n📝 Organizar por materia y prioridad\n📆 Ver fechas de entrega\n🎯 Marcar tareas completadas\n\n¿Necesitas añadir alguna tarea específica?';
    }

    if (msg.includes('nota') || msg.includes('calificación') || msg.includes('calcular')) {
      return 'En la sección "Calificaciones" puedes:\n\n📊 Registrar tus notas\n🧮 Calcular tu promedio actual\n📈 Predecir tu nota final\n🎓 Ver tu rendimiento por asignatura\n\n¿Te gustaría calcular tu nota media?';
    }

    if (msg.includes('usal') || msg.includes('salamanca') || msg.includes('universidad')) {
      return 'La Universidad de Salamanca es una de las universidades más antiguas de Europa, fundada en 1218. \n\n🏛️ Campus principales:\n• Campus Histórico (centro de Salamanca)\n• Campus Miguel de Unamuno\n• Campus de Ávila\n• Campus de Zamora\n• Campus de Béjar\n• Campus Villamayor\n\n¿Sobre qué aspecto de la USAL te gustaría saber más?';
    }

    if (msg.includes('facultad')) {
      return 'La USAL cuenta con múltiples facultades:\n\n📚 Derecho\n🔬 Ciencias\n📖 Filología\n⚕️ Medicina\n💼 Economía y Empresa\n🎓 Educación\n🧠 Psicología\n⚙️ Ingeniería\n\n¿En cuál de ellas estudias?';
    }

    if (msg.includes('ayuda') || msg.includes('qué puedes hacer') || msg.includes('funciones')) {
      return 'Puedo ayudarte con:\n\n🎓 Información sobre la USAL (facultades, campus, servicios)\n✅ Organización de tareas y trabajos\n📅 Gestión de tu horario académico\n📊 Cálculo de notas y promedios\n📚 Recomendación de recursos (bibliotecas, salas de estudio, etc.)\n\n¿Qué necesitas?';
    }

    if (msg.includes('hola') || msg.includes('buenos días') || msg.includes('buenas tardes')) {
      return '¡Hola! ¿En qué puedo ayudarte hoy? Puedo orientarte sobre la universidad, ayudarte a organizar tus estudios o recomendarte recursos del campus.';
    }

    if (msg.includes('gracias')) {
      return '¡De nada! Estoy aquí para ayudarte. Si necesitas algo más, no dudes en preguntar.';
    }

    return 'Interesante pregunta. Te puedo ayudar con:\n\n• Información sobre la USAL\n• Organización de tareas y horarios\n• Cálculo de notas\n• Recomendación de recursos (bibliotecas, salas, cafeterías)\n\n¿Podrías ser más específico sobre lo que necesitas?';
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);

    setInput('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg h-full flex flex-col">
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-full">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Asistente IA</h2>
            <p className="text-amber-50 text-sm">Universidad de Salamanca</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-amber-600" />
                  <span className="text-xs font-medium text-amber-600">USAL AI</span>
                </div>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregúntame sobre la USAL, tareas, notas..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
