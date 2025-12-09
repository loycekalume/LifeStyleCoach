import { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import '../../../styles/schedulesModal.css';

interface Consultation {
  consultation_id: number;
  client_name: string;
  client_email: string;
  scheduled_date: string;
  scheduled_time: string;
  category: string;
  status: string;
  notes: string;
}

const ScheduleConsultation: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async (): Promise<void> => {
    try {
      setIsLoadingData(true);
      const response = await axiosInstance.get('dietician/consultations');
      setConsultations(response.data.consultations);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      alert('Failed to load consultations');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleUpdateStatus = async (consultationId: number, newStatus: string): Promise<void> => {
    try {
      await axiosInstance.patch(`dietician/consultations/${consultationId}/status`, {
        status: newStatus
      });
      setConsultations(consultations.map(c => 
        c.consultation_id === consultationId ? { ...c, status: newStatus } : c
      ));
      alert('Consultation status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update consultation status');
    }
  };

  const handleDeleteConsultation = async (consultationId: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this consultation?')) return;
    
    try {
      await axiosInstance.delete(`dietician/consultations/${consultationId}`);
      setConsultations(consultations.filter(c => c.consultation_id !== consultationId));
      alert('Consultation deleted successfully!');
    } catch (error) {
      console.error('Error deleting consultation:', error);
      alert('Failed to delete consultation');
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string): string => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'scheduled':
        return 'status-scheduled';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="consultation-container">
      <div className="consultation-header">
        <h3><i className="fas fa-calendar-check"></i> Consultations Schedule</h3>
      </div>

      <div className="table-container">
        <table className="consultations-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Date</th>
              <th>Time</th>
              <th>Category</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingData ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
                  <p>Loading consultations...</p>
                </td>
              </tr>
            ) : consultations.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  <i className="fas fa-calendar-times" style={{ fontSize: '3rem', marginBottom: '10px' }}></i>
                  <p>No consultations scheduled yet. Schedule your first one!</p>
                </td>
              </tr>
            ) : (
              consultations.map((consultation) => (
                <tr key={consultation.consultation_id}>
                  <td>
                    <div className="client-info">
                      <div className="client-name">{consultation.client_name}</div>
                      <div className="client-email">{consultation.client_email}</div>
                    </div>
                  </td>
                  <td>{formatDate(consultation.scheduled_date)}</td>
                  <td>{formatTime(consultation.scheduled_time)}</td>
                  <td>{consultation.category}</td>
                  <td>
                    <select
                      value={consultation.status}
                      onChange={(e) => handleUpdateStatus(consultation.consultation_id, e.target.value)}
                      className={`status-select ${getStatusClass(consultation.status)}`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="notes-cell">{consultation.notes || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteConsultation(consultation.consultation_id)}
                      className="btn-delete"
                      title="Delete consultation"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleConsultation;