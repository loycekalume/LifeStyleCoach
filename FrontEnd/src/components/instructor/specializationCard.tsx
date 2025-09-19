import React from 'react';

const Specializations: React.FC = () => {
  return (
     <div className="card specializations-card">
                    <div className="card-header">
                        <h3><i className="fas fa-award"></i> Specializations</h3>
                    </div>
                    <div className="card-content">
                        <div className="badges-container">
                            <span className="badge badge-primary">HIIT Training</span>
                            <span className="badge badge-secondary">Strength Training</span>
                            <span className="badge badge-accent">Cardio</span>
                            <span className="badge badge-primary">Weight Loss</span>
                            <span className="badge badge-secondary">Nutrition</span>
                            <span className="badge badge-accent">Rehabilitation</span>
                        </div>
                        <div className="certifications">
                            <h4>Certifications</h4>
                            <ul>
                                <li>• ACSM Certified Personal Trainer</li>
                                <li>• NASM Corrective Exercise Specialist</li>
                                <li>• Precision Nutrition Level 1</li>
                                <li>• CPR/AED Certified</li>
                            </ul>
                        </div>
                    </div>
                </div>
  );
};

export default Specializations;
