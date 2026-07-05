import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

const Hero: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  const toggleDarkMode = toggleTheme;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Bar */}
        <nav className="flex flex-wrap items-center justify-between py-4 md:py-6 gap-4">
          {/* Logo */}
          <div className="text-2xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AutoAPI
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center space-x-6 md:space-x-8 text-sm font-medium">
            <Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Home</Link>
            <Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Docs</Link>
            <Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">About</Link>
            <Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Github</Link>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none shadow-sm"
            aria-label="Toggle dark mode"
          >
            {dark ? (
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </nav>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center py-12 md:py-20">
          {/* Left Content */}
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Test APIs Faster with{' '}
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutoAPI
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
              The modern Postman alternative for API development, testing, and collaboration.
              Streamline your workflow with lightning-fast requests and intuitive design.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
              <Link to={'/request'}>
                <button className="px-6 py-3 rounded-lg font-semibold bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Get Started
                </button>
              </Link>
              <button className="px-6 py-3 rounded-lg font-semibold border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 shadow-sm">
                {`</>`}View Docs
              </button>
            </div>
          </div>

          {/* Right Mock API UI Box */}
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl">
              {/* Mock UI Header */}
              <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">API Client</span>
              </div>

              {/* Request Area */}
              <div className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-mono font-semibold rounded-md">GET</span>
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-mono rounded-md">POST</span>
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-mono rounded-md">PUT</span>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                      https://api.autoapi.com/v1/users
                    </div>
                  </div>
                </div>

                {/* Headers / Body Tabs Placeholder */}
                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-2">Headers</span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 pb-2">Body</span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 pb-2">Auth</span>
                </div>

                {/* Key-Value Placeholder */}
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <div className="w-1/3 h-8 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                    <div className="w-2/3 h-8 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-1/3 h-8 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                    <div className="w-2/3 h-8 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                  </div>
                </div>

                {/* Send Button */}
                <div className="pt-2">
                  <button className="w-full sm:w-auto px-5 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition">
                    Send Request
                  </button>
                </div>

                {/* Response Preview */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Response</span>
                    <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">200 OK</span>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-900/70 rounded-lg p-3 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                    {`{
  "status": "success",
  "data": {
    "id": 1,
    "name": "API Tester",
    "email": "test@autoapi.com"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Optional gradient glow effect */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;