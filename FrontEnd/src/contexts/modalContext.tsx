import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { MealPlan } from '../components/dietician/mealPlans/mealPlanCard';

interface ModalContextType {
  isMealPlanModalOpen: boolean;
  openMealPlanModal: () => void;
  closeMealPlanModal: () => void;
  isEditModalOpen: boolean;
  editingPlan: MealPlan | null;
  openEditModal: (plan: MealPlan) => void;
  closeEditModal: () => void;
  isConsultationModalOpen: boolean;
  openConsultationModal: () => void;
  closeConsultationModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isMealPlanModalOpen, setIsMealPlanModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  const openMealPlanModal = () => setIsMealPlanModalOpen(true);
  const closeMealPlanModal = () => setIsMealPlanModalOpen(false);

  const openEditModal = (plan: MealPlan) => {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPlan(null);
  };

  const openConsultationModal = () => setIsConsultationModalOpen(true);
  const closeConsultationModal = () => setIsConsultationModalOpen(false);

  return (
    <ModalContext.Provider value={{ 
      isMealPlanModalOpen, 
      openMealPlanModal, 
      closeMealPlanModal,
      isEditModalOpen,
      editingPlan,
      openEditModal,
      closeEditModal,
      isConsultationModalOpen,
      openConsultationModal,
      closeConsultationModal
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}