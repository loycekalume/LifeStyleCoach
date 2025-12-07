import React, { useState } from 'react';

interface CreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export default function CreateMealPlanModal({ isOpen, onClose, onSave }: CreateModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        category: 'Weight Loss',
        description: '',
        calories: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData);
            setFormData({ title: '', category: 'Weight Loss', description: '', calories: '' });
            onClose();
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Inline styles for modal to ensure it works with your existing CSS setup
    const modalOverlayStyle: React.CSSProperties = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px'
    };

    const modalContentStyle: React.CSSProperties = {
        backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '450px',
        overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginTop: '5px', fontSize: '0.95rem'
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle} className="animate-fade-in-up">
                <div className="card-header" style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Create New Plan</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#888' }}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Plan Title</label>
                        <input 
                            type="text" required style={inputStyle} placeholder="e.g. Summer Keto Blast"
                            value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Category</label>
                            <select 
                                style={{ ...inputStyle, backgroundColor: '#fff' }}
                                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="Weight Loss">Weight Loss</option>
                                <option value="Diabetes">Diabetes</option>
                                <option value="Sports Nutrition">Sports Nutrition</option>
                                <option value="Keto">Keto</option>
                                <option value="Vegan">Vegan</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Calories</label>
                            <input 
                                type="text" required style={inputStyle} placeholder="e.g. 1500 cal/day"
                                value={formData.calories} onChange={(e) => setFormData({...formData, calories: e.target.value})}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Description</label>
                        <textarea 
                            rows={3} style={{ ...inputStyle, resize: 'none' }} placeholder="Brief description..."
                            value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={onClose} className="btn1 btn-outline1 btn-sm" style={{ flex: 1, padding: '10px', justifyContent: 'center' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary1 btn-sm" style={{ flex: 1, padding: '10px', justifyContent: 'center' }}>
                            {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : "Create Plan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}