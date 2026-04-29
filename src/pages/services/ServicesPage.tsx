import { Plus, Target, Clock, DollarSign, Edit, Trash2, Eye } from "lucide-react";

export default function ServicesPage() {
  // Mock services data
  const services = [
    {
      id: 1,
      title: "Full App Redesign",
      description: "Complete overhaul of your web app user interface",
      price: "From $4,500",
      timeline: "2-3 weeks",
      status: "active"
    },
    {
      id: 2,
      title: "Brand Identity",
      description: "Logo, color palette, and complete typography system",
      price: "From $2,000",
      timeline: "1 week",
      status: "active"
    },
    {
      id: 3,
      title: "Landing Page Design",
      description: "High-converting landing page with modern design",
      price: "From $1,500",
      timeline: "3-5 days",
      status: "draft"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Services</h1>
        <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-500 gap-2">
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      {/* Services Grid */}
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
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">{service.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-white">{service.price}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-400">{service.timeline}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-800/60">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <Eye className="h-4 w-4" /> View
              </button>
              <button className="flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <Edit className="h-4 w-4" />
              </button>
              <button className="flex items-center justify-center p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State for when no services exist */}
      {services.length === 0 && (
        <div className="bg-[#151B2B] rounded-2xl p-12 border border-slate-800/60 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No services yet</h3>
          <p className="text-slate-400 mb-6">Create your first service to start attracting clients</p>
          <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-500 gap-2">
            <Plus className="h-4 w-4" /> Create Service
          </button>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-2xl p-6 border border-indigo-500/20">
        <h3 className="text-lg font-semibold text-white mb-3">Tips for Great Services</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-1">•</span>
            <span>Be specific about deliverables and timelines</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-1">•</span>
            <span>Use clear, professional descriptions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-1">•</span>
            <span>Price competitively based on your experience</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-1">•</span>
            <span>Include examples of similar work</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
