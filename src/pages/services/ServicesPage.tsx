import { useState, useEffect } from "react";
import { Plus, Target, Clock, DollarSign, Edit, Trash2, X, Save } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getServices, createService, updateService, deleteService, Service } from "../../utils/supabase";

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({
    title: '',
    description: '',
    price: '',
    timeline: '',
    status: 'draft'
  });

  useEffect(() => {
    const fetchServices = async () => {
      if (user) {
        try {
          const servicesData = await getServices(user.id);
          setServices(servicesData);
        } catch (error) {
          console.error('Error fetching services:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchServices();
  }, [user]);

  const handleAddService = async () => {
    if (!user || !newService.title?.trim()) return;
    
    setIsSaving(true);
    try {
      const result = await createService(newService as Omit<Service, 'id' | 'user_id' | 'created_at' | 'updated_at'>, user.id);
      
      if (result.error) {
        console.error('Error creating service:', result.error);
      } else if (result.data) {
        setServices(prev => [result.data!, ...prev]);
        setNewService({
          title: '',
          description: '',
          price: '',
          timeline: '',
          status: 'draft'
        });
        setShowAddService(false);
      }
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateService = async () => {
    if (!editingService || !editingService.id) return;
    
    setIsSaving(true);
    try {
      const result = await updateService(editingService.id, editingService);
      
      if (result.error) {
        console.error('Error updating service:', result.error);
      } else if (result.data) {
        setServices(prev => prev.map(service => 
          service.id === editingService.id ? result.data! : service
        ));
        setEditingService(null);
      }
    } catch (error) {
      console.error('Error updating service:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const result = await deleteService(id);
      
      if (result.error) {
        console.error('Error deleting service:', result.error);
      } else {
        setServices(prev => prev.filter(service => service.id !== id));
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (service: Service) => {
    setEditingService({ ...service });
  };

  const cancelEditing = () => {
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Services</h1>
        <button 
          onClick={() => setShowAddService(true)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-500 gap-2"
        >
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      {/* Add Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#151B2B] rounded-2xl p-6 border border-slate-800/60 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Add New Service</h4>
                  <p className="text-slate-400 text-sm">Create a new service offering</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddService(false);
                  setNewService({
                    title: '',
                    description: '',
                    price: '',
                    timeline: '',
                    status: 'draft'
                  });
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Service Title *</label>
                <input
                  type="text"
                  value={newService.title}
                  onChange={(e) => setNewService(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter service title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32 resize-none transition-all"
                  placeholder="Describe your service and what you deliver"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Price</label>
                  <input
                    type="text"
                    value={newService.price}
                    onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="From $500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Timeline</label>
                  <input
                    type="text"
                    value={newService.timeline}
                    onChange={(e) => setNewService(prev => ({ ...prev, timeline: e.target.value }))}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="2-3 weeks"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={newService.status}
                  onChange={(e) => setNewService(prev => ({ ...prev, status: e.target.value as 'active' | 'draft' }))}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddService(false);
                  setNewService({
                    title: '',
                    description: '',
                    price: '',
                    timeline: '',
                    status: 'draft'
                  });
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddService}
                disabled={isSaving || !newService.title?.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 border border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Service
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#151B2B] rounded-2xl p-6 border border-slate-800/60 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <Edit className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Edit Service</h4>
                  <p className="text-slate-400 text-sm">Update your service details</p>
                </div>
              </div>
              <button
                onClick={cancelEditing}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Service Title *</label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) => setEditingService(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter service title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={editingService.description}
                  onChange={(e) => setEditingService(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32 resize-none transition-all"
                  placeholder="Describe your service and what you deliver"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Price</label>
                  <input
                    type="text"
                    value={editingService.price}
                    onChange={(e) => setEditingService(prev => prev ? { ...prev, price: e.target.value } : null)}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="From $500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Timeline</label>
                  <input
                    type="text"
                    value={editingService.timeline}
                    onChange={(e) => setEditingService(prev => prev ? { ...prev, timeline: e.target.value } : null)}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="2-3 weeks"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={editingService.status}
                  onChange={(e) => setEditingService(prev => prev ? { ...prev, status: e.target.value as 'active' | 'draft' } : null)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelEditing}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateService}
                disabled={isSaving || !editingService.title?.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 border border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Service
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="h-8 w-8 border border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading services...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-[#151B2B] rounded-2xl p-6 border border-slate-800/60 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-indigo-600/10 rounded-lg">
                  <Target className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    service.status === 'active' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-slate-600/10 text-slate-400 border border-slate-600/20'
                  }`}>
                    {service.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">{service.description || 'No description provided'}</p>

              <div className="space-y-3 mb-4">
                {service.price && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-white">{service.price}</span>
                  </div>
                )}
                {service.timeline && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-400">{service.timeline}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-800/60">
                <button 
                  onClick={() => startEditing(service)}
                  className="flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Edit service"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDeleteService(service.id!)}
                  disabled={isSaving}
                  className="flex items-center justify-center p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete service"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && services.length === 0 && (
        <div className="bg-[#151B2B] rounded-2xl p-12 border border-slate-800/60 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No services yet</h3>
          <p className="text-slate-400 mb-6">Create your first service to start attracting clients</p>
          <button 
            onClick={() => setShowAddService(true)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-500 gap-2"
          >
            <Plus className="h-4 w-4" /> Create Service
          </button>
        </div>
      )}
    </div>
  );
}
