import React from "react"

export default function Signup(){

        // function togglePassword(inputId) {
        //     const input = document.getElementById(inputId);
        //     const icon = input.nextElementSibling.querySelector('i');
            
        //     if (input.type === 'password') {
        //         input.type = 'text';
        //         icon.classList.remove('fa-eye');
        //         icon.classList.add('fa-eye-slash');
        //     } else {
        //         input.type = 'password';
        //         icon.classList.remove('fa-eye-slash');
        //         icon.classList.add('fa-eye');
        //     }
        // }

        // function checkPasswordStrength(password) {
        //     let strength = 0;
        //     let text = '';
        //     let color = '';

        //     if (password.length >= 8) strength++;
        //     if (/[a-z]/.test(password)) strength++;
        //     if (/[A-Z]/.test(password)) strength++;
        //     if (/[0-9]/.test(password)) strength++;
        //     if (/[^A-Za-z0-9]/.test(password)) strength++;

        //     switch (strength) {
        //         case 0:
        //         case 1:
        //             text = 'Very Weak';
        //             color = '#ff4757';
        //             break;
        //         case 2:
        //             text = 'Weak';
        //             color = '#ff6b7a';
        //             break;
        //         case 3:
        //             text = 'Fair';
        //             color = '#FFD54F';
        //             break;
        //         case 4:
        //             text = 'Good';
        //             color = '#0288D1';
        //             break;
        //         case 5:
        //             text = 'Strong';
        //             color = '#00C853';
        //             break;
        //     }

        //     const strengthFill = document.getElementById('strengthFill');
        //     const strengthText = document.getElementById('strengthText');
            
        //     strengthFill.style.width = (strength * 20) + '%';
        //     strengthFill.style.backgroundColor = color;
        //     strengthText.textContent = text;
        //     strengthText.style.color = color;
        // }

        // document.getElementById('signupPassword').addEventListener('input', function(e) {
        //     checkPasswordStrength(e.target.value);
        // });

        // document.getElementById('signupForm').addEventListener('submit', function(e) {
        //     e.preventDefault();
            
        //     const password = document.getElementById('signupPassword').value;
        //     const confirmPassword = document.getElementById('confirmPassword').value;
            
        //     if (password !== confirmPassword) {
        //         alert('Passwords do not match!');
        //         return;
        //     }
            
        //     // Add your signup logic here
        //     console.log('Signup form submitted');
        // });
    
    return(
<body>
    <div className="auth-container">
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
                    <h2>Start Your Journey!</h2>
                    <p>Join thousands of users transforming their lives with personalized health and wellness guidance.</p>
                </div>
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-number">12.5K+</div>
                        <div className="stat-label">Active Users</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">8.2K+</div>
                        <div className="stat-label">Goals Achieved</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">234+</div>
                        <div className="stat-label">Expert Instructors</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">98%</div>
                        <div className="stat-label">Success Rate</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="auth-form-container">
            <div className="auth-form">
                <div className="form-header">
                    <h2>Create Account</h2>
                    <p>Fill in your information to get started</p>
                </div>

                <form className="signup-form" id="signupForm">
                    <div className="form-row">
                        <div className="form-group">
                            <label for="firstName">First Name</label>
                            <div className="input-wrapper">
                                <i className="fas fa-user input-icon"></i>
                                <input type="text" id="firstName" name="firstName" placeholder="First name" required></input>
                            </div>
                        </div>
                        <div className="form-group">
                            <label for="lastName">Last Name</label>
                            <div className="input-wrapper">
                                <i className="fas fa-user input-icon"></i>
                                <input type="text" id="lastName" name="lastName" placeholder="Last name" required></input>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label for="signupEmail">Email Address</label>
                        <div className="input-wrapper">
                            <i className="fas fa-envelope input-icon"></i>
                            <input type="email" id="signupEmail" name="email" placeholder="Enter your email" required></input>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <div class="input-wrapper">
                            <i class="fas fa-phone input-icon"></i>
                            <input type="tel" id="phone" name="phone" placeholder="Enter your phone number"></input>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="signupPassword">Password</label>
                        <div className="input-wrapper">
                            <i className="fas fa-lock input-icon"></i>
                            <input type="password" id="signupPassword" name="password" placeholder="Create a password" required></input>
                            <button type="button" className="password-toggle" onclick="togglePassword('signupPassword')">
                                <i className="fas fa-eye"></i>
                            </button>
                        </div>
                        <div className="password-strength">
                            <div className="strength-bar">
                                <div className="strength-fill" id="strengthFill"></div>
                            </div>
                            <span className="strength-text" id="strengthText">Password strength</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <div className="input-wrapper">
                            <i className="fas fa-lock input-icon"></i>
                            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required></input>
                            <button type="button" className="password-toggle" onclick="togglePassword('confirmPassword')">
                                <i className="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label for="userType">I am a:</label>
                        <div className="radio-group">
                            <label className="radio-container">
                                <input type="radio" name="userType" value="client" checked></input>
                                <span className="radio-checkmark"></span>
                                <div className="radio-content">
                                    <i className="fas fa-user-circle"></i>
                                    <span>Client looking for guidance</span>
                                </div>
                            </label>
                            <label className="radio-container">
                                <input type="radio" name="userType" value="instructor"></input>
                                <span className="radio-checkmark"></span>
                                <div className="radio-content">
                                    <i className="fas fa-dumbbell"></i>
                                    <span>Fitness instructor/coach</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="checkbox-container">
                            <input type="checkbox" id="terms" required></input>
                            <span className="checkmark"></span>
                            I agree to the <a href="#" class="link">Terms of Service</a> and <a href="#" className="link">Privacy Policy</a>
                        </label>
                        <label class="checkbox-container">
                            <input type="checkbox" id="newsletter"></input>
                            <span className="checkmark"></span>
                            Send me health tips and updates
                        </label>
                    </div>

                    <button type="submit" className="btn-primary">
                        <span>Create Account</span>
                        <i className="fas fa-arrow-right"></i>
                    </button>

                    <div className="divider">
                        <span>or sign up with</span>
                    </div>

                    <div className="social-login">
                        <button type="button" className="btn-social google">
                            <i className="fab fa-google"></i>
                            <span>Google</span>
                        </button>
                        <button type="button" className="btn-social facebook">
                            <i className="fab fa-facebook-f"></i>
                            <span>Facebook</span>
                        </button>
                        <button type="button" className="btn-social apple">
                            <i className="fab fa-apple"></i>
                            <span>Apple</span>
                        </button>
                    </div>

                    <div className="form-footer">
                        <p>Already have an account? <a href="login.html" className="login-link">Sign in here</a></p>
                    </div>
                </form>
            </div>
        </div>
    </div>

  
</body>
)
}