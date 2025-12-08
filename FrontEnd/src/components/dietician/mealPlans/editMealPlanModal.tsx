// EditMealPlanModal.tsx
import React, { useState, useEffect } from 'react';
import type { MealPlan } from './mealPlanCard';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: number, data: any) => Promise<void>;
    plan: MealPlan | null;
}

export default function EditMealPlanModal({ isOpen, onClose, onSave, plan }: EditModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        category: 'Weight Loss',
        description: '',
        calories: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form data when plan changes
    useEffect(() => {
        if (plan) {
            setFormData({
                title: plan.title || '',
                category: plan.category || 'Weight Loss',
                description: plan.description || '',
                calories: plan.calories || '',
            });
        }
    }, [plan]);

    if (!isOpen || !plan) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(plan.id, formData);
            onClose();
        } catch (error) {
            console.error("Failed to update", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <h2>Edit Meal Plan</h2>
                
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Plan Title *</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="e.g. Summer Keto Blast"
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div>
                        <label>Category *</label>
                        <select 
                            value={formData.category} 
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="Weight Loss">Weight Loss</option>
                            <option value="Diabetes">Diabetes</option>
                            <option value="Sports Nutrition">Sports Nutrition</option>
                            <option value="Keto">Keto</option>
                            <option value="Vegan">Vegan</option>
                        </select>
                    </div>

                    <div>
                        <label>Calories *</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="e.g. 1500 cal/day"
                            value={formData.calories} 
                            onChange={(e) => setFormData({...formData, calories: e.target.value})}
                        />
                    </div>

                    <div>
                        <label>Description</label>
                        <textarea 
                            rows={3} 
                            placeholder="Brief description of the meal plan..."
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="save-btn">
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Updating...
                                </>
                            ) : (
                                "Update Plan"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}