import React from "react"
import "../index.css"
export default function BookSession() {
    const [showForm, setShowForm] = React.useState(false)
    const [appType, setappType] = React.useState<string | null>(null)


    return (
        <>
            <button
                className="action-btn secondary"
                onClick={() => setShowForm(true)}
            >
                <i className="fas fa-calendar-plus"></i> Book Session
            </button>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="registration-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
                        {!appType ? (
                            <div className="app-selection">
                                <h3>Book A session Today</h3>
                                <div className="app-options">
                                    <button className="app-option" onClick={() => setappType("Passenger")}>
                                        <div className="option-icon">👩‍⚕️</div>
                                        <h4>Dietician</h4>
                                        <p>Know more about how should eat</p>
                                    </button>
                                    <button className="app-option" onClick={() => setappType("Driver")}>
                                        <div className="option-icon">🏋️‍♂️🏋️‍♂️</div>
                                        <h4>Instuctor</h4>
                                        <p>Get your workout started</p>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p>You selected: {appType}</p>
                        )}

                    </div>

                </div>
            )}
        </>
    )
}