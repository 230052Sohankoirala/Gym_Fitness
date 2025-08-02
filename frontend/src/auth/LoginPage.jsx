import { Link, useNavigate } from "react-router-dom";
// Option 1: Import it first (recommended)
import logo from '../assets/logo.png';

// Then use it like:

const LoginPage = () => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        //
        // Your login logic here
        navigate('/home');
    }
    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
            <div className='flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full'>
                {/* Left side - Branding/Illustration */}
                <div className='bg-indigo-600 text-white p-8 md:p-12 flex flex-col items-center justify-center md:w-1/2'>
                    <img
                        className='w-32 h-32 mb-6'
                        src={logo}
                        alt="Company Logo"
                        
                    />
                    <h1 className='text-2xl font-bold mb-2'>Welcome Back</h1>
                    <p className='text-indigo-100 text-center'>
                        Sign in to access your account and manage your dashboard.
                    </p>
                </div>

                {/* Right side - Login Form */}
                <div className='p-8 md:p-12 flex flex-col justify-center md:w-1/2'>
                    <h1 className='text-3xl font-bold text-gray-800 mb-1'>Login</h1>
                    <p className='text-gray-500 mb-8'>Please enter your credentials</p>

                    <form className='space-y-4'>
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
                            <div className='flex justify-between items-center mb-2'>
                                <label className='block text-gray-700 text-sm font-medium' htmlFor='password'>
                                    Password
                                </label>
                                <a href="#forgot" className='text-sm text-indigo-600 hover:text-indigo-500'>
                                    Forgot password?
                                </a>
                            </div>
                            <input
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition'
                                id='password'
                                type='password'
                                placeholder='••••••••'
                                required
                                minLength="6"
                            />
                        </div>

                        <div className='flex items-center'>
                            <input
                                id='remember-me'
                                type='checkbox'
                                className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                            />
                            <label htmlFor='remember-me' className='ml-2 block text-sm text-gray-700'>
                                Remember me
                            </label>
                        </div>

                        <button
                            className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition'
                            type='submit'
                            onClick={handleSubmit}
                        >
                            Login
                        </button>
                    </form>

                    <div className='mt-6 text-center'>
                        <p className='text-sm text-gray-600'>
                            Don't have an account?{' '}
                            <Link to="/register" className='text-indigo-600 hover:text-indigo-500'>Sign Up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;