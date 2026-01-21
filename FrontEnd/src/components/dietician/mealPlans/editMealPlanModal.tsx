import React, { useState, useEffect } from 'react';
import axiosInstance from "../../../utils/axiosInstance";


// Shared Interfaces
interface MealItem {
    item_id?: number; 
    meal_type: string;
    food_name: string;
    portion: string;
}

// ✅ FIX: Added 'id' as optional to support legacy checks
interface MealPlan {
    meal_plan_id: number; 
    id?: number; // Optional fallback
    title: string;
    category: string;
    description: string;
    total_calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
}

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: number, data: any) => Promise<void>;
    // ✅ FIX: Use the Interface instead of 'any'
    plan: MealPlan | null; 
}

export default function EditMealPlanModal({ isOpen, onClose, onSave, plan }: EditModalProps) {
    // Form State
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Weight Loss');
    const [description, setDescription] = useState('');
    
    // Macros State
    const [totalCalories, setTotalCalories] = useState<number | string>('');
    const [protein, setProtein] = useState<number | string>('');
    const [carbs, setCarbs] = useState<number | string>('');
    const [fats, setFats] = useState<number | string>('');

    // Items State
    const [items, setItems] = useState<MealItem[]>([]);
    
    // UI State
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 1. LOAD DATA ON OPEN ---
    useEffect(() => {
        if (isOpen && plan) {
            // ✅ Now 'plan' is typed, so TS knows meal_plan_id exists
            fetchPlanDetails(plan.meal_plan_id || plan.id || 0);
        }
    }, [isOpen, plan]);

    const fetchPlanDetails = async (id: number) => {
        if (!id) return;
        setIsLoadingDetails(true);
        try {
            const res = await axiosInstance.get(`/meal-plans/${id}`);
            
            const p = res.data.plan;
            const i = res.data.items;

            // Populate Form
            setTitle(p.title);
            setCategory(p.category);
            setDescription(p.description || '');
            setTotalCalories(p.total_calories || '');
            setProtein(p.protein_g || '');
            setCarbs(p.carbs_g || '');
            setFats(p.fats_g || '');
            
            // Populate Items (or default if empty)
            if (i && i.length > 0) {
                setItems(i);
            } else {
                setItems([{ meal_type: 'Breakfast', food_name: '', portion: '' }]);
            }

        } catch (error) {
            console.error("Failed to load plan details", error);
            alert("Could not load plan details.");
            onClose();
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // --- 2. FORM HANDLERS ---
    const handleItemChange = (index: number, field: keyof MealItem, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        const lastType = items[items.length - 1]?.meal_type || 'Breakfast';
        let nextType = 'Breakfast';
        if (lastType === 'Breakfast') nextType = 'Lunch';
        else if (lastType === 'Lunch') nextType = 'Dinner';
        else if (lastType === 'Dinner') nextType = 'Snack';

        setItems([...items, { meal_type: nextType, food_name: '', portion: '' }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    // --- 3. SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title || !totalCalories) {
            alert("Please fill in Title and Total Calories.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                title,
                category,
                description,
                total_calories: Number(totalCalories),
                protein_g: Number(protein) || 0,
                carbs_g: Number(carbs) || 0,
                fats_g: Number(fats) || 0,
                items: items.filter(i => i.food_name.trim() !== "") 
            };

            // ✅ Use the correct ID from the typed prop
            if (plan) {
                await onSave(plan.meal_plan_id || plan.id || 0, payload);
            }
            onClose();
        } catch (error) {
            console.error("Failed to update", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !plan) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto', maxWidth: '700px' }}>
                <h2>Edit Nutrition Plan</h2>
                
                {isLoadingDetails ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div className="spinner"></div>
                        <p>Loading plan details...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="workout-form">
                        
                        {/* DETAILS */}
                        <div className="form-group">
                            <label>Plan Title *</label>
                            <input 
                                type="text" required 
                                value={title} onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="Weight Loss">Weight Loss</option>
                                <option value="Muscle Gain">Muscle Gain</option>
                                <option value="Keto">Keto</option>
                                <option value="Vegan">Vegan</option>
                                <option value="Diabetes Friendly">Diabetes Friendly</option>
                                <option value="Maintenance">Maintenance</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea 
                                rows={2} 
                                value={description} onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <hr />

                        {/* MACROS */}
                        <h3>Daily Targets</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                            <div>
                                <label>Calories *</label>
                                <input 
                                    type="number" required 
                                    value={totalCalories} onChange={(e) => setTotalCalories(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Protein (g)</label>
                                <input 
                                    type="number" 
                                    value={protein} onChange={(e) => setProtein(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Carbs (g)</label>
                                <input 
                                    type="number" 
                                    value={carbs} onChange={(e) => setCarbs(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Fats (g)</label>
                                <input 
                                    type="number" 
                                    value={fats} onChange={(e) => setFats(e.target.value)}
                                />
                            </div>
                        </div>

                        <hr />

                        {/* ITEMS LIST */}
                        <h3>Daily Menu</h3>
                        <div className="exercise-list">
                            {items.map((item, index) => (
                                <div key={index} className="exercise-item" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <select 
                                        style={{ flex: 1 }}
                                        value={item.meal_type}
                                        onChange={(e) => handleItemChange(index, 'meal_type', e.target.value)}
                                    >
                                        <option value="Breakfast">Breakfast</option>
                                        <option value="Lunch">Lunch</option>
                                        <option value="Dinner">Dinner</option>
                                        <option value="Snack">Snack</option>
                                    </select>

                                    <input 
                                        style={{ flex: 2 }}
                                        type="text" 
                                        placeholder="Food Name"
                                        value={item.food_name}
                                        onChange={(e) => handleItemChange(index, 'food_name', e.target.value)}
                                    />

                                    <input 
                                        style={{ flex: 2 }}
                                        type="text" 
                                        placeholder="Portion"
                                        value={item.portion}
                                        onChange={(e) => handleItemChange(index, 'portion', e.target.value)}
                                    />

                                    <button 
                                        type="button" 
                                        className="btn-remove"
                                        onClick={() => removeItem(index)}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="btn btn-secondary" onClick={addItem}>
                            + Add Another Food
                        </button>

                        <hr />

                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={onClose} className="btn btn-outline">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                                {isSubmitting ? "Updating..." : "Update Plan"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}