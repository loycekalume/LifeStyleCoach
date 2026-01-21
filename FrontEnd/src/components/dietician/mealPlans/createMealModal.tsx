import React, { useState } from 'react';


// 1. Interfaces matching the new Backend
interface MealItem {
    meal_type: string;
    food_name: string;
    portion: string;
    // Optional per-item macros (kept simple for now)
}

interface CreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export default function CreateMealPlanModal({ isOpen, onClose, onSave }: CreateModalProps) {
    // 2. State for Main Plan Details
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Weight Loss');
    const [description, setDescription] = useState('');
    
    // 3. State for Macros
    const [totalCalories, setTotalCalories] = useState<number | string>('');
    const [protein, setProtein] = useState<number | string>('');
    const [carbs, setCarbs] = useState<number | string>('');
    const [fats, setFats] = useState<number | string>('');

    // 4. State for Food Items
    const [items, setItems] = useState<MealItem[]>([
        { meal_type: 'Breakfast', food_name: '', portion: '' }
    ]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    // --- Handlers for Dynamic List ---
    const handleItemChange = (index: number, field: keyof MealItem, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        // Auto-predict next meal type based on previous row
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

    // --- Submission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!title || !totalCalories) {
            alert("Please fill in Title and Total Calories.");
            return;
        }

        const validItems = items.filter(i => i.food_name.trim() !== "");
        if (validItems.length === 0) {
            alert("Please add at least one food item.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Construct the payload matching the Controller
            const payload = {
                title,
                category,
                description,
                total_calories: Number(totalCalories),
                protein_g: Number(protein) || 0,
                carbs_g: Number(carbs) || 0,
                fats_g: Number(fats) || 0,
                items: validItems
            };

            await onSave(payload);
            
            // Reset Form
            setTitle('');
            setDescription('');
            setTotalCalories('');
            setProtein(''); 
            setCarbs(''); 
            setFats('');
            setItems([{ meal_type: 'Breakfast', food_name: '', portion: '' }]);
            
            onClose();
        } catch (error) {
            console.error("Failed to save", error);
            alert("Error creating plan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto', maxWidth: '700px' }}>
                <h2>Create New Nutrition Plan</h2>
                
                <form onSubmit={handleSubmit} className="workout-form">
                    
                    {/* --- SECTION 1: DETAILS --- */}
                    <div className="form-group">
                        <label>Plan Title *</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="e.g. High Protein Week 1"
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="Weight Loss">Weight Loss</option>
                            <option value="Muscle Gain">Muscle Gain</option>
                             <option value="Maintenance">Hypertension</option>
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
                            placeholder="Brief goals (e.g. Focus on low carbs)"
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <hr />

                    {/* --- SECTION 2: MACROS --- */}
                    <h3>Daily Targets</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                        <div>
                            <label>Calories *</label>
                            <input 
                                type="number" required placeholder="2000"
                                value={totalCalories} onChange={(e) => setTotalCalories(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Protein (g)</label>
                            <input 
                                type="number" placeholder="150"
                                value={protein} onChange={(e) => setProtein(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Carbs (g)</label>
                            <input 
                                type="number" placeholder="200"
                                value={carbs} onChange={(e) => setCarbs(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Fats (g)</label>
                            <input 
                                type="number" placeholder="60"
                                value={fats} onChange={(e) => setFats(e.target.value)}
                            />
                        </div>
                    </div>

                    <hr />

                    {/* --- SECTION 3: MEAL ITEMS --- */}
                    <h3>Daily Menu</h3>
                    <div className="exercise-list">
                        {items.map((item, index) => (
                            <div key={index} className="exercise-item" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                
                                {/* Meal Type Dropdown */}
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

                                {/* Food Name */}
                                <input 
                                    style={{ flex: 2 }}
                                    type="text" 
                                    placeholder="Food (e.g. Grilled Chicken)"
                                    value={item.food_name}
                                    onChange={(e) => handleItemChange(index, 'food_name', e.target.value)}
                                />

                                {/* Portion */}
                                <input 
                                    style={{ flex: 2 }}
                                    type="text" 
                                    placeholder="Portion (e.g. 200g / 1 cup)"
                                    value={item.portion}
                                    onChange={(e) => handleItemChange(index, 'portion', e.target.value)}
                                />

                                {/* Remove Button */}
                                {items.length > 1 && (
                                    <button 
                                        type="button" 
                                        className="btn-remove"
                                        onClick={() => removeItem(index)}
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button type="button" className="btn btn-secondary" onClick={addItem}>
                        + Add Another Food
                    </button>

                    <hr />

                    {/* --- ACTIONS --- */}
                    <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            {isSubmitting ? "Creating..." : "Save Plan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}