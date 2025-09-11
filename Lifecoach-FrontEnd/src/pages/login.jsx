import React from 'react'
import "../assets/styles/login.css"


export default function Login(){
    
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const icon = input.nextElementSibling.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }

    return(
<body>
    <div class="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
            <div className="branding-content">
                <div className="logo">
                    <div className="logo-icon">
                        <i className="fas fa-heart"></i>
                    </div>
                    <h1>LifeStyle Coach</h1>
                </div>
                <div className="branding-text">
                    <h2>Welcome Back!</h2>
                    <p>Continue your health journey with personalized nutrition and fitness guidance.</p>
                </div>
                <div className="features-list">
                    <div className="feature-item">
                        <i className="fas fa-apple-alt"></i>
                        <span>Smart Meal Planning</span>
                    </div>
                    <div className="feature-item">
                        <i className="fas fa-dumbbell"></i>
                        <span>Expert Fitness Coaching</span>
                    </div>
                    <div className="feature-item">
                        <i className="fas fa-robot"></i>
                        <span>24/7 AI Nutrition Coach</span>
                    </div>
                    <div className="feature-item">
                        <i className="fas fa-users"></i>
                        <span>Supportive Community</span>
                    </div>
                </div>
            </div>
        </div>

       { /* Right Side - Login Form */}
        <div className="auth-form-container">
            <div className="auth-form">
                <div className="form-header">
                    <h2>Sign In</h2>
                    <p>Enter your credentials to access your account</p>
                </div>

                <form className="login-form" id="loginForm">
                    <div className="form-group">
                        <label for="email">Email Address</label>
                        <div className="input-wrapper">
                            <i className="fas fa-envelope input-icon"></i>
                            <input type="email" id="email" name="email" placeholder="Enter your email" required></input>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <div class="input-wrapper">
                            <i class="fas fa-lock input-icon"></i>
                            <input type="password" id="password" name="password" placeholder="Enter your password" required></input>
                            <button type="button" className="password-toggle" onclick="togglePassword('password')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div class="form-options">
                        <label class="checkbox-container">
                            <input type="checkbox" id="remember"></input>
                            <span class="checkmark"></span>
                            Remember me
                        </label>
                        <a href="#" class="forgot-password">Forgot Password?</a>
                    </div>

                    <button type="submit" class="btn-primary">
                        <span>Sign In</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>

                    <div class="divider">
                        <span>or continue with</span>
                    </div>

                    <div className="social-login">
                        <button type="button" className="btn-social google">
                            <i className="fab fa-google"></i>
                            <span>Google</span>
                        </button>
                        <button type="button" class="btn-social facebook">
                            <i className="fab fa-facebook-f"></i>
                            <span>Facebook</span>
                        </button>
                        <button type="button" class="btn-social apple">
                            <i className="fab fa-apple"></i>
                            <span>Apple</span>
                        </button>
                    </div>

                    <div className="form-footer">
                        <p>Don't have an account? <a href="signup.html" className="signup-link">Sign up here</a></p>
                    </div>
                </form>
            </div>
        </div>
    </div>
      

</body>
    )}    
