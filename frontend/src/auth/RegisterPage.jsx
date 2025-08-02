import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Your registration logic here
        navigate('/login');
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
            <div className='flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full'>
                {/* Left side - Branding/Illustration */}
                <div className='bg-indigo-600 text-white p-8 md:p-12 flex flex-col items-center justify-center md:w-1/2'>
                    <img 
                        className='w-32 h-32 mb-6' 
                        src='/src/assets/logo.png' 
                        alt="Company Logo" 
                        
                    />
                    <h1 className='text-2xl font-bold mb-2'>Join Our Community</h1>
                    <p className='text-indigo-100 text-center'>
                        Create an account to connect with friends and share your moments.
                    </p>
                </div>
                
                {/* Right side - Registration Form */}
                <div className='p-8 md:p-12 flex flex-col justify-center md:w-1/2'>
                    <h1 className='text-3xl font-bold text-gray-800 mb-1'>Sign Up</h1>
                    <p className='text-gray-500 mb-8'>Create your account in minutes</p>
                    
                    <form className='space-y-2'>
                        <div>
                            <label className='block text-gray-700 text-sm font-medium mb-2' htmlFor='username'>
                                Username
                            </label>
                            <input 
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition'
                                id='username' 
                                type='text' 
                                placeholder='cooluser123'
                                required
                            />
                        </div>
                        
                        <div>
                            <label className='block text-gray-700 text-sm font-medium mb-2' htmlFor='email'>
                                Email Address
                            </label>
                            <input 
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition'
                                id='email' 
                                type='email' 
                                placeholder='your@email.com'
                                required
                            />
                        </div>
                        
                        <div>
                            <label className='block text-gray-700 text-sm font-medium mb-2' htmlFor='password'>
                                Password
                            </label>
                            <input 
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition'
                                id='password' 
                                type='password' 
                                placeholder='••••••••'
                                required
                                minLength="6"
                            />
                            <p className='mt-1 text-xs text-gray-500'>
                                Password must be at least 6 characters
                            </p>
                        </div>
                        
                        <div>
                            <label className='block text-gray-700 text-sm font-medium mb-2' htmlFor='confirm-password'>
                                Confirm Password
                            </label>
                            <input 
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition'
                                id='confirm-password' 
                                type='password' 
                                placeholder='••••••••'
                                required
                                minLength="6"
                            />
                        </div>
                        
                        <div className='flex items-center'>
                            <input 
                                id='terms' 
                                type='checkbox' 
                                className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                                required
                            />
                            <label htmlFor='terms' className='ml-2 block text-sm text-gray-700'>
                                I agree to the <a href="#terms" className='text-indigo-600 hover:text-indigo-500'>Terms</a> and <a href="#privacy" className='text-indigo-600 hover:text-indigo-500'>Privacy Policy</a>
                            </label>
                        </div>
                        
                        <button 
                            className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition'
                            type='submit'
                            onClick={handleSubmit}
                        >
                            Create Account
                        </button>
                    </form>
                    
                    <div className='mt-6 text-center'>
                        <p className='text-sm text-gray-600'>
                            Already have an account?{' '}
                            <Link to="/login" className='text-indigo-600 hover:text-indigo-500 font-medium'>Sign In</Link>
                        </p>
                    </div>
                    
                    <div className='mt-6'>
                        <div className='relative'>
                            
                        </div>
                        
                       
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;