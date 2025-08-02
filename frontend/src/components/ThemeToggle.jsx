import { useTheme } from '../context/ThemeContext';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

export const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="p-2 rounded-full">
      {darkMode ? <HiOutlineSun /> : <HiOutlineMoon />}
    </button>
  );
};