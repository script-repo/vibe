
import React from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Dices } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiceProps {
  value: number;
  isRolling: boolean;
}

const Dice: React.FC<DiceProps> = ({ value, isRolling }) => {
  const diceIcons: { [key: number]: React.ReactNode } = {
    1: <Dice1 className="w-full h-full text-gray-800 dark:text-gray-200" />,
    2: <Dice2 className="w-full h-full text-gray-800 dark:text-gray-200" />,
    3: <Dice3 className="w-full h-full text-gray-800 dark:text-gray-200" />,
    4: <Dice4 className="w-full h-full text-gray-800 dark:text-gray-200" />,
    5: <Dice5 className="w-full h-full text-gray-800 dark:text-gray-200" />,
    6: <Dice6 className="w-full h-full text-gray-800 dark:text-gray-200" />,
  };

  const icon = diceIcons[value] || <Dices className="w-full h-full text-gray-800 dark:text-gray-200" />;

  return (
    <div className={cn(
      'flex items-center justify-center p-4 rounded-lg transition-transform duration-300',
      'w-[20vw] h-[20vw] min-w-[120px] min-h-[120px] max-w-[300px] max-h-[300px]',
      'bg-white dark:bg-gray-800 shadow-lg rounded-2xl',
      isRolling && 'animate-shake'
    )}>
      {icon}
    </div>
  );
};

export default Dice;
