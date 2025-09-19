import React from 'react';

const Reviews: React.FC = () => {

  return (
    <div className="card reviews-card">
                    <div className="card-header">
                        <h3><i className="fas fa-star"></i> Recent Reviews</h3>
                        <button className="btn btn-ghost">View All</button>
                    </div>
                    <div className="card-content">
                        <div className="reviews-list">
                            <div className="review-item">
                                <div className="review-header">
                                    <div className="review-author">
                                        <span className="author-name">Sarah M.</span>
                                        <div className="review-rating">
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                        </div>
                                    </div>
                                    <span className="review-date">2 days ago</span>
                                </div>
                                <p className="review-text">Amazing instructor! Very patient and knowledgeable. Highly recommend!</p>
                            </div>
                            <div className="review-item">
                                <div className="review-header">
                                    <div className="review-author">
                                        <span className="author-name">Mike C.</span>
                                        <div className="review-rating">
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                        </div>
                                    </div>
                                    <span className="review-date">1 week ago</span>
                                </div>
                                <p className="review-text">Great workout sessions. Helped me achieve my fitness goals faster than expected.</p>
                            </div>
                            <div className="review-item">
                                <div className="review-header">
                                    <div className="review-author">
                                        <span className="author-name">Emma R.</span>
                                        <div className="review-rating">
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="fas fa-star"></i>
                                            <i className="far fa-star"></i>
                                        </div>
                                    </div>
                                    <span className="review-date">2 weeks ago</span>
                                </div>
                                <p className="review-text">Professional and motivating. The HIIT sessions are challenging but effective.</p>
                            </div>
                        </div>
                    </div>
                </div>
  );
};

export default Reviews;
