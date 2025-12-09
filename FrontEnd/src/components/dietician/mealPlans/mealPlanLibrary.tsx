import { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
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
    } = useModal();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate(); 

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

    const handleUpdatePlan = async (id: number, updates: Partial<MealPlan>) => {
        try {
            const response = await axiosInstance.put(`meal-plans/${id}`, updates);
            setMealPlans(mealPlans.map(plan => 
                plan.id === id ? { ...plan, ...response.data.mealPlan } : plan
            ));
            
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

    // 👇 Limit to 4 plans for dashboard view
    const displayedPlans = filteredPlans.slice(0, 4);
    const hasMorePlans = mealPlans.length > 4;

    return (
        <>
            <CreateMealPlanModal 
                isOpen={isMealPlanModalOpen}
                onClose={closeMealPlanModal}
                onSave={handleCreatePlan} 
            />

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
                            className="btn btn-outline1 btn-sm"
                            onClick={() => navigate('/meal-plans')}
                            style={{ marginRight: '10px' }}
                        >
                            <i className="fas fa-eye"></i>
                            View All
                        </button>
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
                    ) : displayedPlans.length === 0 ? ( // Changed to displayedPlans
                        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                            <i className="fas fa-clipboard-list" style={{ fontSize: '3rem', marginBottom: '10px' }}></i>
                            <p>{searchTerm ? 'No meal plans found matching your search' : 'No meal plans yet. Create your first one!'}</p>
                        </div>
                    ) : (
                        displayedPlans.map((plan) => ( //  Changed to displayedPlans
                            <MealPlanCard 
                                key={plan.id} 
                                plan={plan} 
                                onUpdate={handleUpdatePlan}
                                onDelete={handleDeletePlan}
                            />
                        ))
                    )}
                </div>

                {/*  Show "View All" link at bottom if there are more plans */}
                {hasMorePlans && !isLoading && (
                    <div style={{ 
                        padding: '20px', 
                        textAlign: 'center', 
                        borderTop: '1px solid #eee',
                        background: '#fafafa'
                    }}>
                        <button 
                            className="btn btn-outline1 btn-sm"
                            onClick={() => navigate('/meal-plans')}
                            style={{ minWidth: '200px' }}
                        >
                            <i className="fas fa-arrow-right"></i>
                            View All {mealPlans.length} Meal Plans
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}