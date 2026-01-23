import { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { useModal } from '../../../contexts/modalContext';
import { FaVideo, FaMapMarkerAlt } from 'react-icons/fa';
import '../../../styles/schedulesModal.css';

interface Client {
  user_id: number;
  name: string;
  email: string;
  is_hired?: boolean;
}

interface FormData {
  client_id: string;
  scheduled_date: string;
  scheduled_time: string;
  category: string;
  notes: string;
  meeting_type: 'online' | 'in-person';
  meeting_link: string;
}

interface ConsultationModalProps {
  onConsultationAdded?: () => void;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ onConsultationAdded }) => {
  const { isConsultationModalOpen, closeConsultationModal } = useModal();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<FormData>({
    client_id: '',
    scheduled_date: '',
    scheduled_time: '',
    category: '',
    notes: '',
    meeting_type: 'online', 
    meeting_link: ''
  });

  const categories = [
    'Initial Consultation',
    'Follow-up',
    'Meal Plan Review',
    'Nutrition Counseling',
    'Weight Management'
  ];

  useEffect(() => {
    if (isConsultationModalOpen) {
      fetchClients();
    }
  }, [isConsultationModalOpen]);

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get('/dieticianClients/leads');
      const data = response.data.data || response.data.clients || response.data;
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.client_id || !formData.scheduled_date || !formData.scheduled_time || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.meeting_type === 'online' && !formData.meeting_link) {
        alert('Please provide a meeting link for online sessions.');
        return;
    }

    setLoading(true);

    try {
      await axiosInstance.post('/consultations', {
        ...formData,
        client_id: Number(formData.client_id)
      });
      
      alert('Consultation scheduled successfully!');
      handleCloseModal();
      if (onConsultationAdded) onConsultationAdded();
    } catch (error) {
      console.error('Error scheduling consultation:', error);
      alert('Failed to schedule consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCloseModal = () => {
    closeConsultationModal();
    setFormData({
      client_id: '',
      scheduled_date: '',
      scheduled_time: '',
      category: '',
      notes: '',
      meeting_type: 'online',
      meeting_link: ''
    });
  };

  if (!isConsultationModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Schedule Consultation</h2>
        
        <div className="form-container">
          {/* Client Select */}
          <div className="form-group">
            <label>Client *</label>
            <select name="client_id" value={formData.client_id} onChange={handleChange} className="form-control">
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.user_id} value={client.user_id}>
                  {client.name} {client.is_hired ? '(Hired)' : '(Lead)'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Date *</label>
                <input type="date" name="scheduled_date" value={formData.scheduled_date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="form-control" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Time *</label>
                <input type="time" name="scheduled_time" value={formData.scheduled_time} onChange={handleChange} className="form-control" />
              </div>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} className="form-control">
              <option value="">Select a category</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* ✅ NEW: Meeting Type Selection */}
          <div className="form-group">
            <label>Meeting Type *</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input 
                        type="radio" 
                        name="meeting_type" 
                        value="online" 
                        checked={formData.meeting_type === 'online'} 
                        onChange={handleChange} 
                    /> 
                    <FaVideo color="#3498db"/> Online (Zoom/Meet)
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input 
                        type="radio" 
                        name="meeting_type" 
                        value="in-person" 
                        checked={formData.meeting_type === 'in-person'} 
                        onChange={handleChange} 
                    /> 
                    <FaMapMarkerAlt color="#e74c3c"/> In-Person
                </label>
            </div>
          </div>

          {/* ✅ NEW: Dynamic Link/Location Input */}
          <div className="form-group">
            <label>
                {formData.meeting_type === 'online' ? 'Meeting Link (Zoom / Google Meet) *' : 'Location / Address *'}
            </label>
            <input
              type="text"
              name="meeting_link"
              value={formData.meeting_link}
              onChange={handleChange}
              className="form-control"
              placeholder={formData.meeting_type === 'online' ? "https://meet.google.com/..." : "e.g., Clinic Room 304"}
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="form-control" placeholder="Additional notes..." />
          </div>

          <div className="form-actions">
            <button onClick={handleCloseModal} className="btn btn-outline1">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="btn btn-primary1">
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationModal;