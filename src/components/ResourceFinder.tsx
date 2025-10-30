import { useState, useEffect } from 'react';
import { supabase, Resource } from '../lib/supabase';
import { Search, MapPin, Clock, Users, Wifi, Filter } from 'lucide-react';

type ResourceFinderProps = {
  highlightType?: string;
};

export default function ResourceFinder({ highlightType }: ResourceFinderProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>(highlightType || 'all');

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    if (highlightType) {
      setSelectedType(highlightType);
    }
  }, [highlightType]);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedType]);

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (selectedType !== 'all') {
      filtered = filtered.filter((r) => r.type === selectedType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.location.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) ||
          r.faculty.toLowerCase().includes(term)
      );
    }

    setFilteredResources(filtered);
  };

  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'library':
        return '📚';
      case 'study_room':
        return '📖';
      case 'cafeteria':
        return '☕';
      case 'computer_lab':
        return '💻';
      default:
        return '📍';
    }
  };

  const getTypeLabel = (type: Resource['type']) => {
    switch (type) {
      case 'library':
        return 'Biblioteca';
      case 'study_room':
        return 'Sala de Estudio';
      case 'cafeteria':
        return 'Cafetería';
      case 'computer_lab':
        return 'Laboratorio';
      default:
        return 'Otro';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, string> = {
      wifi: '📶',
      ordenadores: '💻',
      sala_silencio: '🤫',
      escaner: '🖨️',
      sala_grupo: '👥',
      cafe: '☕',
      enchufes: '🔌',
      climatizado: '❄️',
      software_cientifico: '🧪',
      impresora: '🖨️',
      pizarra: '📋',
      proyector: '📽️',
      software_idiomas: '🗣️',
      auriculares: '🎧',
      terraza: '🌞',
      menu_dia: '🍽️',
    };
    return icons[amenity] || '✓';
  };

  if (loading) {
    return <div className="text-center py-8">Cargando recursos...</div>;
  }

  const types = [
    { value: 'all', label: 'Todos', icon: '🏛️' },
    { value: 'library', label: 'Bibliotecas', icon: '📚' },
    { value: 'study_room', label: 'Salas de Estudio', icon: '📖' },
    { value: 'computer_lab', label: 'Laboratorios', icon: '💻' },
    { value: 'cafeteria', label: 'Cafeterías', icon: '☕' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Recursos del Campus</h2>
        <p className="text-gray-600">Encuentra bibliotecas, salas de estudio y más</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, ubicación o facultad..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              {types.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Mostrando {filteredResources.length} de {resources.length} recursos
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
              highlightType === resource.type ? 'ring-2 ring-amber-500' : ''
            }`}
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{getTypeIcon(resource.type)}</span>
                <div>
                  <h3 className="font-bold text-lg">{resource.name}</h3>
                  <p className="text-amber-50 text-sm">{getTypeLabel(resource.type)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start gap-2 text-gray-700">
                <MapPin size={18} className="mt-1 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="font-medium">{resource.location}</p>
                  {resource.faculty && (
                    <p className="text-sm text-gray-600">Facultad de {resource.faculty}</p>
                  )}
                </div>
              </div>

              {resource.opening_hours && (
                <div className="flex items-start gap-2 text-gray-700">
                  <Clock size={18} className="mt-1 flex-shrink-0 text-amber-600" />
                  <p className="text-sm">{resource.opening_hours}</p>
                </div>
              )}

              {resource.capacity > 0 && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Users size={18} className="flex-shrink-0 text-amber-600" />
                  <p className="text-sm">Capacidad: {resource.capacity} personas</p>
                </div>
              )}

              {resource.description && (
                <p className="text-sm text-gray-600 border-t pt-3">{resource.description}</p>
              )}

              {resource.amenities && resource.amenities.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Servicios:</p>
                  <div className="flex flex-wrap gap-2">
                    {resource.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs"
                      >
                        <span>{getAmenityIcon(amenity)}</span>
                        <span className="capitalize">{amenity.replace(/_/g, ' ')}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500">
            No se encontraron recursos que coincidan con tu búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}
