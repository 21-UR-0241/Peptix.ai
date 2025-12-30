// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import BottomNavigation from '../components/BottomNavigation';
// import { authService } from '../services/auth.js'; // Add this import
// import { AlignCenter } from 'lucide-react';

// function Profile() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [editing, setEditing] = useState(false);
//   const [changingPassword, setChangingPassword] = useState(false);
//   const [formData, setFormData] = useState({ name: '', email: '' });
//   const [passwordData, setPasswordData] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

//   useEffect(() => {
//     fetchUser();
//   }, []);

//     const handleLogout = async () => {
//   try {
//     await fetch('/api/auth/logout', {  // or your full URL
//       method: 'POST',
//       credentials: 'include',
//     });
//     setUser(null);
//     // remove setShowDropdown(false); // it isn't defined in this component
//     navigate('/login'); // or '/' if you prefer
//   } catch (error) {
//     console.error('Logout failed:', error);
//   }
// };

//   const fetchUser = async () => {
//     try {
//       // Updated to use authService
//       const data = await authService.getCurrentUser();
      
//       if (data.user) {
//         setUser(data.user);
//         setFormData({ name: data.user.name, email: data.user.email });
//       } else {
//         navigate('/login');
//       }
//     } catch (error) {
//       console.error('Failed to fetch user:', error);
//       navigate('/login');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage({ type: '', text: '' });

//     try {
//       // Updated to use authService
//       const data = await authService.updateProfile(formData.name);
//       setUser(data.user);
//       setEditing(false);
//       setMessage({ type: 'success', text: 'Profile updated successfully!' });
//     } catch (error) {
//       setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
//     }
//   };

//   const handlePasswordChange = async (e) => {
//     e.preventDefault();
//     setPasswordMessage({ type: '', text: '' });

//     // Validation
//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
//       return;
//     }

//     if (passwordData.newPassword.length < 6) {
//       setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
//       return;
//     }

//     try {
//       // Updated to use authService
//       await authService.changePassword(
//         passwordData.currentPassword,
//         passwordData.newPassword
//       );
      
//       setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
//       setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
//       setChangingPassword(false);
//     } catch (error) {
//       if (error.message.includes('GOOGLE_ACCOUNT')) {
//         setPasswordMessage({ 
//           type: 'error', 
//           text: 'Google accounts cannot change password here. Use Google to manage your account.' 
//         });
//       } else if (error.message.includes('INVALID_CURRENT_PASSWORD')) {
//         setPasswordMessage({ type: 'error', text: 'Current password is incorrect' });
//       } else {
//         setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password' });
//       }
//     }
//   };

  
//   if (loading) {
//     return (
//       <div
//         style={{
//           minHeight: '100vh',
//           background: '#0a0a0a',
//           color: '#ffffff',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '2rem',
//         }}
//       >
//         <div
//           style={{
//             width: '60px',
//             height: '60px',
//             border: '4px solid #2a2a2a',
//             borderTop: '4px solid #9333ea ',
//             borderRadius: '50%',
//             animation: 'spin 1s linear infinite',
//           }}
//         />
//         <style>{`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}</style>
//         <div style={{ fontSize: '1.2rem' }}>Loading profile...</div>
//       </div>
//     );
//   }

//   if (!user) return null;

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'linear-gradient(to bottom, #1a1a1a, #000000)',
//       display: 'flex',
//       flexDirection: 'column',
//       color: 'white'
//     }}>
//       <main style={{
//         flex: 1,
//         paddingBottom: '5rem', // Space for bottom navigation
//         overflowY: 'auto'
//       }}>
//         <div style={{
//           maxWidth: '800px',
//           margin: '0 auto',
//           padding: '2rem 1.5rem'
//         }}>
//           {/* Header */}
//           <div style={{
//             marginBottom: '2rem'
//           }}>
//             <h1 style={{
//               fontSize: '2.5rem',
//               fontWeight: '700',
//               background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
//               WebkitBackgroundClip: 'text',
//               WebkitTextFillColor: 'transparent',
//               backgroundClip: 'text',
//               marginBottom: '0.5rem',
//               margin: 0
//             }}>
//               Profile
//             </h1>
//             <p style={{
//               color: '#9ca3af',
//               fontSize: '1rem',
//               margin: '0.5rem 0 0 0'
//             }}>
//               Manage your account settings
//             </p>
//           </div>

//           {/* Message */}
//           {message.text && (
//             <div style={{
//               padding: '1rem',
//               borderRadius: '8px',
//               marginBottom: '1.5rem',
//               background: message.type === 'success' 
//                 ? 'rgba(34, 197, 94, 0.1)' 
//                 : 'rgba(239, 68, 68, 0.1)',
//               border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
//               color: message.type === 'success' ? '#22c55e' : '#ef4444'
//             }}>
//               {message.text}
//             </div>
//           )}

//           {/* Profile Card */}
//           <div style={{
//             background: '#1a1a1a',
//             border: '1px solid #2a2a2a',
//             borderRadius: '12px',
//             overflow: 'hidden'
//           }}>
//             {/* Avatar Section */}
//             <div style={{
//               padding: '2rem',
//               borderBottom: '1px solid #2a2a2a',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '1.5rem'
//             }}>
//               <div style={{
//                 width: '80px',
//                 height: '80px',
//                 borderRadius: '50%',
//                 background: '#9333ea',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '2rem',
//                 fontWeight: '700',
//                 color: '#ffffff',
//                 boxShadow: '0 4px 12px rgba(167, 139, 250, 0.4)'
//               }}>
//                 {user.name?.charAt(0).toUpperCase() || 'U'}
//               </div>
//               <div>
//                 <h2 style={{
//                   fontSize: '1.5rem',
//                   fontWeight: '600',
//                   color: '#ffffff',
//                   marginBottom: '0.25rem',
//                   margin: 0
//                 }}>
//                   {user.name}
//                 </h2>
//                 <p style={{
//                   color: '#9ca3af',
//                   fontSize: '0.95rem',
//                   margin: '0.25rem 0 0 0'
//                 }}>
//                   {user.email}
//                 </p>
//               </div>
//             </div>

//             {/* Form Section */}
//             <div style={{ padding: '2rem' }}>
//               {editing ? (
//                 <form onSubmit={handleSubmit}>
//                   <div style={{ marginBottom: '1.5rem' }}>
//                     <label style={{
//                       display: 'block',
//                       color: '#ffffff',
//                       fontSize: '0.9rem',
//                       fontWeight: '600',
//                       marginBottom: '0.5rem'
//                     }}>
//                       Name
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       style={{
//                         width: '100%',
//                         padding: '0.75rem 1rem',
//                         background: '#0a0a0a',
//                         border: '1px solid #2a2a2a',
//                         borderRadius: '8px',
//                         color: '#ffffff',
//                         fontSize: '1rem',
//                         outline: 'none',
//                         transition: 'border-color 0.2s ease',
//                         boxSizing: 'border-box'
//                       }}
//                       onFocus={(e) => e.target.style.borderColor = '#9333ea'}
//                       onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
//                     />
//                   </div>

//                   <div style={{ marginBottom: '1.5rem' }}>
//                     <label style={{
//                       display: 'block',
//                       color: '#ffffff',
//                       fontSize: '0.9rem',
//                       fontWeight: '600',
//                       marginBottom: '0.5rem'
//                     }}>
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       value={formData.email}
//                       disabled
//                       style={{
//                         width: '100%',
//                         padding: '0.75rem 1rem',
//                         background: '#0a0a0a',
//                         border: '1px solid #2a2a2a',
//                         borderRadius: '8px',
//                         color: '#6b7280',
//                         fontSize: '1rem',
//                         cursor: 'not-allowed',
//                         boxSizing: 'border-box'
//                       }}
//                     />
//                     <p style={{
//                       color: '#6b7280',
//                       fontSize: '0.8rem',
//                       marginTop: '0.5rem',
//                       margin: '0.5rem 0 0 0'
//                     }}>
//                       Email cannot be changed
//                     </p>
//                   </div>

//                   <div style={{
//                     display: 'flex',
//                     gap: '1rem',
//                     justifyContent: 'flex-end'
//                   }}>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setEditing(false);
//                         setFormData({ name: user.name, email: user.email });
//                         setMessage({ type: '', text: '' });
//                       }}
//                       style={{
//                         padding: '0.75rem 1.5rem',
//                         background: 'transparent',
//                         border: '1px solid #2a2a2a',
//                         borderRadius: '8px',
//                         color: '#9ca3af',
//                         fontSize: '0.9rem',
//                         fontWeight: '600',
//                         cursor: 'pointer',
//                         transition: 'all 0.2s ease'
//                       }}
//                       onMouseEnter={(e) => {
//                         e.target.style.background = 'rgba(167, 139, 250, 0.1)';
//                         e.target.style.color = '#ffffff';
//                       }}
//                       onMouseLeave={(e) => {
//                         e.target.style.background = 'transparent';
//                         e.target.style.color = '#9ca3af';
//                       }}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       style={{
//                         padding: '0.75rem 1.5rem',
//                         background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
//                         border: 'none',
//                         borderRadius: '8px',
//                         color: '#ffffff',
//                         fontSize: '0.9rem',
//                         fontWeight: '600',
//                         cursor: 'pointer',
//                         transition: 'transform 0.2s ease, box-shadow 0.2s ease'
//                       }}
//                       onMouseEnter={(e) => {
//                         e.target.style.transform = 'translateY(-2px)';
//                         e.target.style.boxShadow = '0 4px 12px rgba(167, 139, 250, 0.4)';
//                       }}
//                       onMouseLeave={(e) => {
//                         e.target.style.transform = 'translateY(0)';
//                         e.target.style.boxShadow = 'none';
//                       }}
//                     >
//                       Save Changes
//                     </button>
//                   </div>
//                 </form>
//               ) : (
//                 <div>
//                   <div style={{
//                     display: 'grid',
//                     gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
//                     gap: '1.5rem',
//                     marginBottom: '2rem'
//                   }}>
//                     <div>
//                       <label style={{
//                         display: 'block',
//                         color: '#9ca3af',
//                         fontSize: '0.85rem',
//                         fontWeight: '600',
//                         marginBottom: '0.5rem'
//                       }}>
//                         NAME
//                       </label>
//                       <p style={{
//                         color: '#ffffff',
//                         fontSize: '1rem',
//                         margin: 0
//                       }}>
//                         {user.name}
//                       </p>
//                     </div>
//                     <div>
//                       <label style={{
//                         display: 'block',
//                         color: '#9ca3af',
//                         fontSize: '0.85rem',
//                         fontWeight: '600',
//                         marginBottom: '0.5rem'
//                       }}>
//                         EMAIL
//                       </label>
//                       <p style={{
//                         color: '#ffffff',
//                         fontSize: '1rem',
//                         margin: 0
//                       }}>
//                         {user.email}
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => setEditing(true)}
//                     style={{
//                       padding: '0.75rem 1.5rem',
//                       background: 'rgba(167, 139, 250, 0.1)',
//                       border: '1px solid #9333ea',
//                       borderRadius: '8px',
//                       color: '#9333ea',
//                       fontSize: '0.9rem',
//                       fontWeight: '600',
//                       cursor: 'pointer',
//                       transition: 'all 0.2s ease'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.target.style.background = 'rgba(167, 139, 250, 0.2)';
//                       e.target.style.color = '#ffffff';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.background = 'rgba(167, 139, 250, 0.1)';
//                       e.target.style.color = '#9333ea';
//                     }}
//                   >
//                     Edit Profile
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Change Password Card */}
//           <div style={{
//             marginTop: '1.5rem',
//             background: '#1a1a1a',
//             border: '1px solid #2a2a2a',
//             borderRadius: '12px',
//             overflow: 'hidden'
//           }}>
//             <div style={{
//               padding: '2rem',
//               borderBottom: changingPassword ? '1px solid #2a2a2a' : 'none'
//             }}>
//               <h3 style={{
//                 color: '#ffffff',
//                 fontSize: '1.1rem',
//                 fontWeight: '600',
//                 marginBottom: '0.5rem',
//                 margin: 0
//               }}>
//                 Password
//               </h3>
//               <p style={{
//                 color: '#9ca3af',
//                 fontSize: '0.9rem',
//                 marginBottom: changingPassword ? '0' : '1.5rem',
//                 margin: changingPassword ? '0.5rem 0 0 0' : '0.5rem 0 1.5rem 0'
//               }}>
//                 {changingPassword 
//                   ? 'Enter your current password and choose a new one'
//                   : 'Keep your account secure with a strong password'
//                 }
//               </p>

//               {!changingPassword && (
//                 <button
//                   onClick={() => {
//                     setChangingPassword(true);
//                     setPasswordMessage({ type: '', text: '' });
//                   }}
//                   style={{
//                     padding: '0.75rem 1.5rem',
//                     background: 'rgba(167, 139, 250, 0.1)',
//                     border: '1px solid #9333ea',
//                     borderRadius: '8px',
//                     color: '#9333ea',
//                     fontSize: '0.9rem',
//                     fontWeight: '600',
//                     cursor: 'pointer',
//                     transition: 'all 0.2s ease'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.target.style.background = 'rgba(167, 139, 250, 0.2)';
//                     e.target.style.color = '#ffffff';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.background = 'rgba(167, 139, 250, 0.1)';
//                     e.target.style.color = '#9333ea';
//                   }}
//                 >
//                   Change Password
//                 </button>
//               )}
//             </div>

//             {changingPassword && (
//               <div style={{ padding: '2rem', paddingTop: '1.5rem' }}>
//                 {passwordMessage.text && (
//                   <div style={{
//                     padding: '1rem',
//                     borderRadius: '8px',
//                     marginBottom: '1.5rem',
//                     background: passwordMessage.type === 'success' 
//                       ? 'rgba(34, 197, 94, 0.1)' 
//                       : 'rgba(239, 68, 68, 0.1)',
//                     border: `1px solid ${passwordMessage.type === 'success' ? '#22c55e' : '#ef4444'}`,
//                     color: passwordMessage.type === 'success' ? '#22c55e' : '#ef4444'
//                   }}>
//                     {passwordMessage.text}
//                   </div>
//                 )}

//                 <form onSubmit={handlePasswordChange}>
//                   <div style={{ marginBottom: '1.5rem' }}>
//                     <label style={{
//                       display: 'block',
//                       color: '#ffffff',
//                       fontSize: '0.9rem',
//                       fontWeight: '600',
//                       marginBottom: '0.5rem'
//                     }}>
//                       Current Password
//                     </label>
//                     <input
//                       type="password"
//                       value={passwordData.currentPassword}
//                       onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
//                       style={{
//                         width: '100%',
//                         padding: '0.75rem 1rem',
//                         background: '#0a0a0a',
//                         border: '1px solid #2a2a2a',
//                         borderRadius: '8px',
//                         color: '#ffffff',
//                         fontSize: '1rem',
//                         outline: 'none',
//                         transition: 'border-color 0.2s ease',
//                         boxSizing: 'border-box'
//                       }}
//                       onFocus={(e) => e.target.style.borderColor = '#9333ea'}
//                       onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
//                       required
//                     />
//                   </div>

//                   <div style={{ marginBottom: '1.5rem' }}>
//                     <label style={{
//                       display: 'block',
//                       color: '#ffffff',
//                       fontSize: '0.9rem',
//                       fontWeight: '600',
//                       marginBottom: '0.5rem'
//                     }}>
//                       New Password
//                     </label>
//                     <input
//                       type="password"
//                       value={passwordData.newPassword}
//                       onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
//                       style={{
//                         width: '100%',
//                         padding: '0.75rem 1rem',
//                         background: '#0a0a0a',
//                         border: '1px solid #2a2a2a',
//                         borderRadius: '8px',
//                         color: '#ffffff',
//                         fontSize: '1rem',
//                         outline: 'none',
//                         transition: 'border-color 0.2s ease',
//                         boxSizing: 'border-box'
//                       }}
//                       onFocus={(e) => e.target.style.borderColor = '#9333ea'}
//                       onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
//                       required
//                       minLength={6}
//                     />
//                   </div>

//                   <div style={{ marginBottom: '1.5rem' }}>
//                     <label style={{
//                       display: 'block',
//                       color: '#ffffff',
//                       fontSize: '0.9rem',
//                       fontWeight: '600',
//                       marginBottom: '0.5rem'
//                     }}>
//                       Confirm New Password
//                     </label>
//                     <input
//                       type="password"
//                       value={passwordData.confirmPassword}
//                       onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
//                       style={{
//                         width: '100%',
//                         padding: '0.75rem 1rem',
//                         background: '#0a0a0a',
//                         border: '1px solid #2a2a2a',
//                         borderRadius: '8px',
//                         color: '#ffffff',
//                         fontSize: '1rem',
//                         outline: 'none',
//                         transition: 'border-color 0.2s ease',
//                         boxSizing: 'border-box'
//                       }}
//                       onFocus={(e) => e.target.style.borderColor = '#9333ea'}
//                       onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
//                       required
//                     />
//                   </div>

//                   <div style={{
//                     display: 'flex',
//                     gap: '1rem',
//                     justifyContent: 'flex-end'
//                   }}>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setChangingPassword(false);
//                         setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
//                         setPasswordMessage({ type: '', text: '' });
//                       }}
//                       style={{
//                         padding: '0.75rem 1.5rem',
//                         background: 'transparent',
//                         border: '1px solid #2a2a2a',
//                         borderRadius: '8px',
//                         color: '#9ca3af',
//                         fontSize: '0.9rem',
//                         fontWeight: '600',
//                         cursor: 'pointer',
//                         transition: 'all 0.2s ease'
//                       }}
//                       onMouseEnter={(e) => {
//                         e.target.style.background = 'rgba(167, 139, 250, 0.1)';
//                         e.target.style.color = '#ffffff';
//                       }}
//                       onMouseLeave={(e) => {
//                         e.target.style.background = 'transparent';
//                         e.target.style.color = '#9ca3af';
//                       }}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       style={{
//                         padding: '0.75rem 1.5rem',
//                         background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
//                         border: 'none',
//                         borderRadius: '8px',
//                         color: '#ffffff',
//                         fontSize: '0.9rem',
//                         fontWeight: '600',
//                         cursor: 'pointer',
//                         transition: 'transform 0.2s ease, box-shadow 0.2s ease'
//                       }}
//                       onMouseEnter={(e) => {
//                         e.target.style.transform = 'translateY(-2px)';
//                         e.target.style.boxShadow = '0 4px 12px rgba(167, 139, 250, 0.4)';
//                       }}
//                       onMouseLeave={(e) => {
//                         e.target.style.transform = 'translateY(0)';
//                         e.target.style.boxShadow = 'none';
//                       }}
//                     >
//                       Update Password
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             )}
//           </div>

//           {/* Account Info */}
//           <div style={{
//             marginTop: '1.5rem',
//             padding: '1.5rem',
//             background: '#1a1a1a',
//             border: '1px solid #2a2a2a',
//             borderRadius: '12px'
//           }}>
//             <h3 style={{
//               color: '#ffffff',
//               fontSize: '1.1rem',
//               fontWeight: '600',
//               marginBottom: '1rem',
//               margin: '0 0 1rem 0'
//             }}>
//               Account Information
//             </h3>
//             <div style={{
//               display: 'grid',
//               gap: '0.75rem',
//               color: '#9ca3af',
//               fontSize: '0.9rem'
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                 <span>Account ID:</span>
//                 <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>{user.id}</span>
//               </div>
//               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                 <span>Member since:</span>
//                 <span style={{ color: '#ffffff' }}>
//                   {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
//                 </span>
//               </div>
//             </div>     
//           </div>

//           <div style={{ display: 'flex', justifyContent: 'center' }}>
//               <div style={{ display: 'flex', justifyContent: 'center' }}>
//                   <button
//                     onClick={handleLogout}
//                     style={{
//                       width: '200px',          // adjust width
//                       padding: '1rem 1.5rem',    // adjust height/width via padding
//                       fontSize: '1rem',        // adjust text size
//                       background: 'rgba(167, 139, 250, 0.1)',
//                       border: '1px solid #9333ea',
//                       borderRadius: '8px',
//                       color: '#9333ea',
//                       fontWeight: '600',
//                       cursor: 'pointer',
//                       transition: 'all 0.2s ease',
//                       marginTop: '25px',
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = 'rgba(167, 139, 250, 0.2)';
//                       e.currentTarget.style.color = '#ffffff';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)';
//                       e.currentTarget.style.color = '#9333ea';
//                     }}
//                   >
//                 Logout
//               </button>
//           </div>
//         </div>
//         </div>
//       </main>

//       {/* Bottom Navigation Component */}
//       <BottomNavigation />
//     </div>
//   );
// }

// export default Profile;



import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import { authService } from '../services/auth.js';
import { Camera, X } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const data = await authService.getCurrentUser();
      
      if (data.user) {
        setUser(data.user);
        setFormData({ name: data.user.name, email: data.user.email });
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setUploadingImage(true);
    setMessage({ type: '', text: '' });
    setUploadProgress(0);

    try {
      // Simulate progress
      setUploadProgress(10);

      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setUploadProgress(30);

      // Upload to Cloudinary via backend
      const uploadResponse = await fetch('/api/upload-profile-picture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ image: base64 })
      });

      setUploadProgress(80);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      
      setUploadProgress(100);

      // Update local user state
      setUser(uploadData.user);
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });

    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload image' });
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!user.profilePicture?.publicId) return;

    const confirmed = window.confirm('Are you sure you want to remove your profile picture?');
    if (!confirmed) return;

    setUploadingImage(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/remove-profile-picture', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove profile picture');
      }

      const data = await response.json();
      setUser(data.user);
      setMessage({ type: 'success', text: 'Profile picture removed successfully!' });

    } catch (error) {
      console.error('Error removing image:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to remove profile picture' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const data = await authService.updateProfile(formData.name);
      setUser(data.user);
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setChangingPassword(false);
    } catch (error) {
      if (error.message.includes('GOOGLE_ACCOUNT')) {
        setPasswordMessage({ 
          type: 'error', 
          text: 'Google accounts cannot change password here. Use Google to manage your account.' 
        });
      } else if (error.message.includes('INVALID_CURRENT_PASSWORD')) {
        setPasswordMessage({ type: 'error', text: 'Current password is incorrect' });
      } else {
        setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password' });
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #2a2a2a',
          borderTop: '4px solid #9333ea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ fontSize: '1.2rem', marginTop: '1rem' }}>Loading profile...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #1a1a1a, #000000)',
      display: 'flex',
      flexDirection: 'column',
      color: 'white'
    }}>
      <main style={{
        flex: 1,
        paddingBottom: '5rem',
        overflowY: 'auto'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '2rem 1.5rem'
        }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.5rem',
              margin: 0
            }}>
              Profile
            </h1>
            <p style={{
              color: '#9ca3af',
              fontSize: '1rem',
              margin: '0.5rem 0 0 0'
            }}>
              Manage your account settings
            </p>
          </div>

          {/* Message */}
          {message.text && (
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              background: message.type === 'success' 
                ? 'rgba(34, 197, 94, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
              color: message.type === 'success' ? '#22c55e' : '#ef4444'
            }}>
              {message.text}
            </div>
          )}

          {/* Profile Card */}
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {/* Avatar Section */}
            <div style={{
              padding: '2rem',
              borderBottom: '1px solid #2a2a2a',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              {/* Profile Picture Container */}
              <div style={{ position: 'relative' }}>
                {/* Avatar */}
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: user.profilePicture?.url 
                    ? `url(${user.profilePicture.url}) center/cover`
                    : 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(167, 139, 250, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {!user.profilePicture?.url && (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                  
                  {/* Upload Overlay */}
                  {uploadingImage && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0, 0, 0, 0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '3px solid #ffffff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      {uploadProgress > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#ffffff' }}>
                          {Math.round(uploadProgress)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Camera Button */}
                <button
                  onClick={handleImageClick}
                  disabled={uploadingImage}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                    border: '3px solid #1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: uploadingImage ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.2s ease',
                    opacity: uploadingImage ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => !uploadingImage && (e.target.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <Camera size={18} color="#ffffff" />
                </button>

                {/* Remove Picture Button */}
                {user.profilePicture?.url && !uploadingImage && (
                  <button
                    onClick={handleRemoveProfilePicture}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      border: '2px solid #1a1a1a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    <X size={16} color="#ffffff" />
                  </button>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {/* User Info */}
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '0.25rem',
                  margin: 0
                }}>
                  {user.name}
                </h2>
                <p style={{
                  color: '#9ca3af',
                  fontSize: '0.95rem',
                  margin: '0.25rem 0 0.75rem 0'
                }}>
                  {user.email}
                </p>
                <button
                  onClick={handleImageClick}
                  disabled={uploadingImage}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(167, 139, 250, 0.1)',
                    border: '1px solid #9333ea',
                    borderRadius: '6px',
                    color: '#9333ea',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: uploadingImage ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: uploadingImage ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!uploadingImage) {
                      e.target.style.background = 'rgba(167, 139, 250, 0.2)';
                      e.target.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(167, 139, 250, 0.1)';
                    e.target.style.color = '#9333ea';
                  }}
                >
                  {uploadingImage ? 'Uploading...' : (user.profilePicture?.url ? 'Change Photo' : 'Upload Photo')}
                </button>
              </div>
            </div>

            {/* Form Section */}
            <div style={{ padding: '2rem' }}>
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: '#0a0a0a',
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#9333ea'}
                      onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: '#0a0a0a',
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px',
                        color: '#6b7280',
                        fontSize: '1rem',
                        cursor: 'not-allowed',
                        boxSizing: 'border-box'
                      }}
                    />
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.8rem',
                      marginTop: '0.5rem',
                      margin: '0.5rem 0 0 0'
                    }}>
                      Email cannot be changed
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setFormData({ name: user.name, email: user.email });
                        setMessage({ type: '', text: '' });
                      }}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'transparent',
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px',
                        color: '#9ca3af',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(167, 139, 250, 0.1)';
                        e.target.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#9ca3af';
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(167, 139, 250, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#9ca3af',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem'
                      }}>
                        NAME
                      </label>
                      <p style={{
                        color: '#ffffff',
                        fontSize: '1rem',
                        margin: 0
                      }}>
                        {user.name}
                      </p>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#9ca3af',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem'
                      }}>
                        EMAIL
                      </label>
                      <p style={{
                        color: '#ffffff',
                        fontSize: '1rem',
                        margin: 0
                      }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'rgba(167, 139, 250, 0.1)',
                      border: '1px solid #9333ea',
                      borderRadius: '8px',
                      color: '#9333ea',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(167, 139, 250, 0.2)';
                      e.target.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(167, 139, 250, 0.1)';
                      e.target.style.color = '#9333ea';
                    }}
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card - Keep as is */}
          {/* ... rest of your password change card code ... */}

          {/* Account Info - Keep as is */}
          {/* ... rest of your account info code ... */}

          {/* Logout Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '200px',
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                background: 'rgba(167, 139, 250, 0.1)',
                border: '1px solid #9333ea',
                borderRadius: '8px',
                color: '#9333ea',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(167, 139, 250, 0.2)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)';
                e.currentTarget.style.color = '#9333ea';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}

export default Profile;