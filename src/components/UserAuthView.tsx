import React, { useState } from 'react';
import { Phone, User, Mail, MapPin, AlertCircle, CheckCircle2, ChevronRight, Sparkles, Heart, ShoppingBag, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

interface UserAuthViewProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function UserAuthView({ onLoginSuccess }: UserAuthViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Login States
  const [loginPhone, setLoginPhone] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sign Up States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpAddress, setSignUpAddress] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const cleanPhone = loginPhone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      setLoginError('Please enter a valid mobile number.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });

      if (res.ok) {
        const data = await res.json();
        onLoginSuccess(data.user, data.token);
      } else {
        const err = await res.json();
        setLoginError(err.error || 'No account registered with this number. Switch to the Register tab above to create a free account.');
      }
    } catch (err) {
      setLoginError('Could not reach secure login servers. Please check your network and try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Sign Up submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPhone.trim()) {
      setSignUpError('Please fill in all required fields marked with *');
      return;
    }

    setIsSigningUp(true);
    try {
      const res = await fetch('/api/auth/user-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpName.trim(),
          email: signUpEmail.trim(),
          phone: signUpPhone.trim().replace(/\s+/g, ''),
          address: signUpAddress.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSignUpSuccess(true);
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
        }, 1500);
      } else {
        const err = await res.json();
        setSignUpError(err.error || 'Failed to complete registration.');
      }
    } catch (err) {
      setSignUpError('Connection error during registration. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  // Quick Demo logins for testing Ease
  const demoUsers = [
    { name: 'Gaurav Beniwal (Default)', phone: '9999999999', location: 'Jaipur, Rajasthan' }
  ];

  return (
    <div className="min-h-[calc(100vh-130px)] bg-gray-50 flex items-center justify-center p-4" id="user-auth-root">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/80 shadow-md overflow-hidden" id="user-auth-card">
        
        {/* Banner header */}
        <div className="bg-gradient-to-r from-lucky-magenta to-indigo-600 px-6 py-8 text-white relative overflow-hidden" id="user-auth-header-banner">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10">
            <Sparkles className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md mb-3">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-wider uppercase">QueKart Customer App</h1>
            <p className="text-xs text-white/85 font-medium mt-1">Unlock your personalized shopping and rewards experience</p>
          </div>
        </div>

        {/* Tab switch navigation */}
        <div className="flex border-b border-gray-100" id="user-auth-tab-bar">
          <button
            onClick={() => { setIsSignUp(false); setLoginError(''); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all ${!isSignUp ? 'border-lucky-magenta text-lucky-magenta bg-white' : 'border-transparent text-gray-400 bg-gray-50/50 hover:bg-gray-50'}`}
            id="tab-user-login"
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsSignUp(true); setSignUpError(''); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all ${isSignUp ? 'border-lucky-magenta text-lucky-magenta bg-white' : 'border-transparent text-gray-400 bg-gray-50/50 hover:bg-gray-50'}`}
            id="tab-user-register"
          >
            Register
          </button>
        </div>

        <div className="p-6" id="user-auth-forms-container">
          {!isSignUp ? (
            /* SIGN IN FORM */
            <div className="space-y-4" id="user-login-form-panel">
              <div className="text-center">
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide flex items-center justify-center gap-1.5">
                  <LogIn className="w-4 h-4 text-lucky-magenta" />
                  <span>Customer Mobile Login</span>
                </h2>
                <p className="text-[10.5px] text-gray-400 font-semibold mt-1">Enter your registered mobile number to access your account securely.</p>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-[10.5px] font-bold p-3 rounded-lg flex items-center gap-2 animate-fadeIn" id="login-error-alert">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block mb-1">Registered Mobile Number *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-extrabold">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9999999999"
                      value={loginPhone}
                      onChange={e => {
                        setLoginPhone(e.target.value);
                        setLoginError('');
                      }}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg py-2.5 pl-11 pr-4 bg-slate-50/50 focus:outline-hidden focus:bg-white focus:border-lucky-magenta transition-all"
                      id="login-phone-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-[#143C6B] hover:bg-[#0f2d52] disabled:opacity-50 text-white font-extrabold text-xs py-2.5 rounded-lg transition-all uppercase tracking-wider cursor-pointer shadow-3xs flex items-center justify-center gap-1.5"
                  id="login-submit-button"
                >
                  <span>{isLoggingIn ? 'Verifying Account...' : 'Secure Sign-In'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Demo accounts */}
              <div className="mt-6 pt-5 border-t border-gray-100" id="user-demo-accounts-panel">
                <h3 className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 text-center">Registered Demo Customer</h3>
                <div className="space-y-2">
                  {demoUsers.map((user, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50/50 rounded-xl border border-gray-200/60 flex justify-between items-center hover:border-lucky-magenta/50 transition-all cursor-pointer"
                      onClick={() => {
                        setLoginPhone(user.phone);
                        setLoginError('');
                      }}
                      id={`demo-user-${i}`}
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-gray-800 truncate">{user.name}</h4>
                        <p className="text-[9.5px] text-gray-400 font-bold mt-0.5">Mob: {user.phone} • {user.location}</p>
                      </div>
                      <span className="text-[9px] bg-lucky-magenta/10 text-lucky-magenta font-black px-2 py-1 rounded-full uppercase tracking-wider flex-shrink-0">Use</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* SIGN UP FORM */
            <div className="space-y-4" id="user-signup-form-panel">
              <div className="text-center">
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-lucky-magenta" />
                  <span>Register Free Account</span>
                </h2>
                <p className="text-[10.5px] text-gray-400 font-semibold mt-1">Unlock immediate scratch cards, cashbacks, and order history.</p>
              </div>

              {signUpError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-[10.5px] font-bold p-3 rounded-lg flex items-center gap-2 animate-fadeIn" id="signup-error-alert">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{signUpError}</span>
                </div>
              )}

              {signUpSuccess && (
                <div className="bg-green-50 border border-green-100 text-green-600 text-[10.5px] font-bold p-3 rounded-lg flex items-center gap-2 animate-fadeIn" id="signup-success-alert">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Account Registered Successfully! Logging you in...</span>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <label className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gaurav Beniwal"
                      value={signUpName}
                      onChange={e => setSignUpName(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg py-2 pl-9 pr-4 bg-slate-50/50 focus:outline-hidden focus:bg-white focus:border-lucky-magenta transition-all"
                      id="signup-name-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. gaurav@gmail.com"
                      value={signUpEmail}
                      onChange={e => setSignUpEmail(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg py-2 pl-9 pr-4 bg-slate-50/50 focus:outline-hidden focus:bg-white focus:border-lucky-magenta transition-all"
                      id="signup-email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9999999999"
                      value={signUpPhone}
                      onChange={e => setSignUpPhone(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg py-2 pl-9 pr-4 bg-slate-50/50 focus:outline-hidden focus:bg-white focus:border-lucky-magenta transition-all"
                      id="signup-phone-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block mb-1">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Mansarovar, Jaipur, Rajasthan"
                      value={signUpAddress}
                      onChange={e => setSignUpAddress(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-200 rounded-lg py-2 pl-9 pr-4 bg-slate-50/50 focus:outline-hidden focus:bg-white focus:border-lucky-magenta transition-all"
                      id="signup-address-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningUp || signUpSuccess}
                  className="w-full bg-lucky-magenta hover:bg-[#c1006a] disabled:opacity-50 text-white font-extrabold text-xs py-2.5 rounded-lg transition-all uppercase tracking-wider cursor-pointer shadow-3xs flex items-center justify-center gap-1.5"
                  id="signup-submit-button"
                >
                  <span>{isSigningUp ? 'Registering...' : 'Sign Up & Start'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
