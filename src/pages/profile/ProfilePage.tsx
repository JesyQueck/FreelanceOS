import { UserCircle, Mail, MapPin, Briefcase, Edit, Camera, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/dashboard/profile/edit');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <button 
          onClick={handleEditProfile}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-500 gap-2"
        >
          <Edit className="h-4 w-4" /> Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-[#151B2B] rounded-2xl p-8 border border-slate-800/60 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                AR
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-white">Alex Rivera</h2>
              <p className="text-slate-400">Digital Designer</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">Verified</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">About</h3>
              <p className="text-slate-300 leading-relaxed">
                Digital designer specializing in SaaS UI/UX. I help early-stage startups look like enterprise giants with clean, modern designs that convert users into customers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm text-white">alex@freelance.os</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="text-sm text-white">San Francisco, CA</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Experience</p>
                  <p className="text-sm text-white">5+ years</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <UserCircle className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Member Since</p>
                  <p className="text-sm text-white">January 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-[#151B2B] rounded-2xl p-6 border border-slate-800/60 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {['UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Prototyping', 'Design Systems', 'Web Design', 'Mobile Design'].map((skill) => (
            <span key={skill} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Portfolio Preview */}
      <div className="bg-[#151B2B] rounded-2xl p-6 border border-slate-800/60 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Portfolio Items</h3>
          <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition-colors">
              <div className="h-32 bg-slate-700 rounded-lg mb-3"></div>
              <h4 className="text-sm font-medium text-white">Project {item}</h4>
              <p className="text-xs text-slate-400 mt-1">UI/UX Design</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
