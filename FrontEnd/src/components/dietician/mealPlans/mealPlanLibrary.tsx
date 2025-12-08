import { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import MealPlanCard from './mealPlanCard';
import type { MealPlan } from './mealPlanCard';
import CreateMealPlanModal from './createMealModal';
import EditMealPlanModal from './editMealPlanModal'; 
import { useModal } from '../../../contexts/modalContext';

export default function MealPlanLibrary() {
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const { 
        isMealPlanModalOpen, 
        openMealPlanModal, 
        closeMealPlanModal,
        isEditModalOpen,
        editingPlan,
        closeEditModal
    } = useModal(); //  Get edit modal state
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('meal-plans');
            setMealPlans(response.data.mealPlans);
        } catch (error) {
            console.error("Error fetching plans", error);
            alert("Failed to load meal plans");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleCreatePlan = async (data: any) => {
        try {
            const response = await axiosInstance.post('meal-plans', data);
            setMealPlans([response.data.mealPlan, ...mealPlans]);
            alert("Meal plan created successfully!");
        } catch (error) {
            console.error("Error creating plan", error);
            alert("Failed to create meal plan");
        }
    };

    //  Update to handle both edit and favorite toggle
    const handleUpdatePlan = async (id: number, updates: Partial<MealPlan>) => {
        try {
            const response = await axiosInstance.put(`meal-plans/${id}`, updates);
            setMealPlans(mealPlans.map(plan => 
                plan.id === id ? { ...plan, ...response.data.mealPlan } : plan
            ));
            
            // Show success message only for full edits (not favorite toggles)
            if (updates.title || updates.category || updates.description || updates.calories) {
                alert("Meal plan updated successfully!");
            }
        } catch (error) {
            console.error("Error updating plan", error);
            alert("Failed to update meal plan");
        }
    };

    const handleDeletePlan = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this meal plan?")) return;
        
        try {
            await axiosInstance.delete(`meal-plans/${id}`);
            setMealPlans(mealPlans.filter(plan => plan.id !== id));
            alert("Meal plan deleted successfully!");
        } catch (error) {
            console.error("Error deleting plan", error);
            alert("Failed to delete meal plan");
        }
    };

    const filteredPlans = mealPlans.filter(plan =>
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* Create Modal */}
            <CreateMealPlanModal 
                isOpen={isMealPlanModalOpen}
                onClose={closeMealPlanModal}
                onSave={handleCreatePlan} 
            />

            {/*  Edit Modal */}
            <EditMealPlanModal 
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                onSave={handleUpdatePlan}
                plan={editingPlan}
            />

            <div className="card meal-plans-card" style={{ position: 'relative' }}>
                <div className="card-header">
                    <h3><i className="fas fa-book"></i> Meal Plan Library</h3>
                    <div className="library-controls">
                        <div className="search-box1">
                            <i className="fas fa-search"></i>
                            <input 
                                type="text" 
                                placeholder="Search meal plans..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            className="btn btn-primary1 btn-sm"
                            onClick={openMealPlanModal}
                        >
                            <i className="fas fa-plus"></i>
                            Create New
                        </button>
                    </div>
                </div>

                <div className="card-content meal-plan-grid">
                    {isLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
                            <p>Loading meal plans...</p>
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                            <i className="fas fa-clipboard-list" style={{ fontSize: '3rem', marginBottom: '10px' }}></i>
                            <p>{searchTerm ? 'No meal plans found matching your search' : 'No meal plans yet. Create your first one!'}</p>
                        </div>
                    ) : (
                        filteredPlans.map((plan) => (
                            <MealPlanCard 
                                key={plan.id} 
                                plan={plan} 
                                onUpdate={handleUpdatePlan}
                                onDelete={handleDeletePlan}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
}