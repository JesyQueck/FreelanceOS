import { useNotifications } from '../contexts/NotificationContext';
import ToastNotification from './ToastNotification';
import { useNavigate } from 'react-router-dom';

export default function ToastContainer() {
  const { toastNotifications, removeToastNotification } = useNotifications();
  const navigate = useNavigate();

  const handleNavigate = (conversationId: string) => {
    navigate(`/dashboard/messages?conversation=${conversationId}`);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastNotifications.map((toast) => (
        <ToastNotification
          key={toast.id}
          id={toast.id}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={removeToastNotification}
          onNavigate={
            toast.type === 'message' && toast.conversationId
              ? () => handleNavigate(toast.conversationId!)
              : undefined
          }
        />
      ))}
    </div>
  );
}
