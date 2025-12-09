// src/pages/MealPlansPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import MealPlanCard from './mealPlanCard';
import type { MealPlan } from './mealPlanCard';
import CreateMealPlanModal from './createMealModal';
import EditMealPlanModal from './editMealPlanModal';
import { useModal } from '../../../contexts/modalContext';
import '../../../styles/mealPlan.css';

export default function MealPlansPage() {
    const navigate = useNavigate();
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');

    const { 
        isMealPlanModalOpen, 
        openMealPlanModal, 
        closeMealPlanModal,
        isEditModalOpen,
        editingPlan,
        closeEditModal
    } = useModal();

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

    // Filter and sort meal plans
    const filteredAndSortedPlans = mealPlans
        .filter(plan => {
            const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                plan.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || plan.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return b.id - a.id;
                case 'oldest':
                    return a.id - b.id;
                case 'name':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

    const categories = ['All', 'Weight Loss', 'Diabetes', 'Sports Nutrition', 'Keto', 'Vegan'];
    const totalPlans = mealPlans.length;
    const favoritePlans = mealPlans.filter(plan => plan.favorite).length;

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

            <div className="meal-plans-page">
                {/* Header Section */}
                <div className="page-header">
                    <div className="header-left">
                        <button 
                            className="back-btn"
                            onClick={() => navigate('/dieticians')}
                        >
                            <i className="fas fa-arrow-left"></i>
                            Back to Dashboard
                        </button>
                        <div className="page-title-section">
                            <h1>
                                <i className="fas fa-book"></i> Meal Plan Library
                            </h1>
                            <p className="page-subtitle">Manage and organize all your meal plans</p>
                        </div>
                    </div>
                    <button 
                        className="btn btn-primary1"
                        onClick={openMealPlanModal}
                    >
                        <i className="fas fa-plus"></i>
                        Create New Plan
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-section">
                    <div className="stat-card-mini">
                        <i className="fas fa-clipboard-list"></i>
                        <div>
                            <div className="stat-number">{totalPlans}</div>
                            <div className="stat-label">Total Plans</div>
                        </div>
                    </div>
                    <div className="stat-card-mini">
                        <i className="fas fa-heart"></i>
                        <div>
                            <div className="stat-number">{favoritePlans}</div>
                            <div className="stat-label">Favorites</div>
                        </div>
                    </div>
                    <div className="stat-card-mini">
                        <i className="fas fa-users"></i>
                        <div>
                            <div className="stat-number">{mealPlans.reduce((sum, plan) => sum + (plan.clientsCount || 0), 0)}</div>
                            <div className="stat-label">Total Clients</div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="filters-section">
                    <div className="search-box-large">
                        <i className="fas fa-search"></i>
                        <input 
                            type="text" 
                            placeholder="Search meal plans by title or category..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>
                            <i className="fas fa-filter"></i> Category:
                        </label>
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>
                            <i className="fas fa-sort"></i> Sort by:
                        </label>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                    </div>
                </div>

                {/* Meal Plans Grid */}
                <div className="plans-grid">
                    {isLoading ? (
                        <div className="loading-state">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading meal plans...</p>
                        </div>
                    ) : filteredAndSortedPlans.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-clipboard-list"></i>
                            <h3>No meal plans found</h3>
                            <p>
                                {searchTerm || selectedCategory !== 'All' 
                                    ? 'Try adjusting your filters or search terms' 
                                    : 'Create your first meal plan to get started'}
                            </p>
                            {!searchTerm && selectedCategory === 'All' && (
                                <button 
                                    className="btn btn-primary1"
                                    onClick={openMealPlanModal}
                                >
                                    <i className="fas fa-plus"></i>
                                    Create Your First Plan
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredAndSortedPlans.map((plan) => (
                            <MealPlanCard 
                                key={plan.id} 
                                plan={plan} 
                                onUpdate={handleUpdatePlan}
                                onDelete={handleDeletePlan}
                            />
                        ))
                    )}
                </div>

                {/* Results Count */}
                {!isLoading && filteredAndSortedPlans.length > 0 && (
                    <div className="results-count">
                        Showing {filteredAndSortedPlans.length} of {totalPlans} meal plans
                    </div>
                )}
            </div>
        </>
    );
}