import React from 'react';

const PricingCard: React.FC = () => {

    return (
        <div className
            ="card pricing-card">
            <div className
                ="card-header">
                <h3><i className
                    ="fas fa-dollar-sign"></i> Session Pricing</h3>
            </div>
            <div className
                ="card-content">
                <div className
                    ="pricing-list">
                    <div className
                        ="pricing-item">
                        <span>1-on-1 Session</span>
                        <span className
                            ="price">$75/hour</span>
                    </div>
                    <div className
                        ="pricing-item">
                        <span>Group Session (2-4)</span>
                        <span className
                            ="price">$45/hour</span>
                    </div>
                    <div className
                        ="pricing-item">
                        <span>Online Session</span>
                        <span className
                            ="price">$50/hour</span>
                    </div>
                    <div className
                        ="pricing-item">
                        <span>Package (10 sessions)</span>
                        <span className
                            ="price">$650/hour</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingCard;
