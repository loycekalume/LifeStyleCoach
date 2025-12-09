import { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { useModal } from '../../../contexts/modalContext';
import '../../../styles/schedulesModal.css';

interface Client {
  client_id: number;
  name: string;
  email: string;
}

interface FormData {
  client_id: string;
  scheduled_date: string;
  scheduled_time: string;
  category: string;
  notes: string;
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
    notes: ''
  });

  const categories: string[] = [
    'Initial Consultation',
    'Follow-up',
    'Meal Plan Review',
    'Nutrition Counseling',
    'Weight Management',
    'Special Dietary Needs'
  ];

  useEffect(() => {
    if (isConsultationModalOpen) {
      fetchClients();
    }
  }, [isConsultationModalOpen]);

  const fetchClients = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get('client');
      setClients(response.data.clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      alert('Failed to load clients');
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!formData.client_id || !formData.scheduled_date || !formData.scheduled_time || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post('consultations', formData);
      alert('Consultation scheduled successfully!');
      handleCloseModal();
      
      // Notify parent component to refresh
      if (onConsultationAdded) {
        onConsultationAdded();
      }
    } catch (error) {
      console.error('Error scheduling consultation:', error);
      alert('Failed to schedule consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCloseModal = (): void => {
    closeConsultationModal();
    setFormData({
      client_id: '',
      scheduled_date: '',
      scheduled_time: '',
      category: '',
      notes: ''
    });
  };

  if (!isConsultationModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Schedule Consultation</h2>
        
        <div className="form-container">
          <div className="form-group">
            <label>Client *</label>
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.client_id} value={client.client_id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Time *</label>
            <input
              type="time"
              name="scheduled_time"
              value={formData.scheduled_time}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="form-control"
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="form-actions">
            <button
              onClick={handleCloseModal}
              className="btn btn-outline1"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary1"
            >
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationModal;