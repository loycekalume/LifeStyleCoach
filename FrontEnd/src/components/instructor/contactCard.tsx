import React from 'react';

const ContactCard: React.FC = () => {
  return (
    <div className="card contact-card">
                    <div className="card-header">
                        <h3><i className="fas fa-user"></i> Contact & Availability</h3>
                    </div>
                    <div className="card-content">
                        <div className="contact-list">
                            <div className="contact-item">
                                <i className="fas fa-envelope"></i>
                                <span>maria.rodriguez@email.com</span>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-phone"></i>
                                <span>+1 (555) 987-6543</span>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-globe"></i>
                                <span>www.mariafit.com</span>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-clock"></i>
                                <span>Mon-Fri: 6AM-8PM</span>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>In-person & Online sessions</span>
                            </div>
                        </div>
                    </div>
                </div>
  );
};

export default ContactCard;
