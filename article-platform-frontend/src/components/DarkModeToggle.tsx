import React from 'react';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons'; // Using Radix icons

interface DarkModeToggleProps {
	isDarkMode: boolean;
	toggleDarkMode: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
	isDarkMode,
	toggleDarkMode,
}) => {
	return (
		<button
			onClick={toggleDarkMode}
			className='p-2.5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 transition-all duration-200 ease-in-out'
			aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
			title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			{isDarkMode ? (
				<SunIcon className='w-5 h-5 text-yellow-400 dark:text-yellow-300' />
			) : (
				<MoonIcon className='w-5 h-5 text-sky-500 dark:text-sky-400' />
			)}
		</button>
	);
};

export default DarkModeToggle;
