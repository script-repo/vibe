
import { useState } from "react";
import Dice from "@/components/Dice";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [diceValue, setDiceValue] = useState(6);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setTimeout(() => {
      const newValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(newValue);
      setIsRolling(false);
    }, 1000); // Corresponds to animation duration
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-black transition-colors duration-300">
      <div className="text-center space-y-10">
        <div className="flex justify-center">
            <Dice value={diceValue} isRolling={isRolling} />
        </div>

        <Button 
          onClick={rollDice} 
          disabled={isRolling} 
          size="lg" 
          className="px-10 py-6 text-xl font-semibold rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          {isRolling ? "Rolling..." : "Roll the Dice"}
        </Button>
      </div>
    </div>
  );
};

export default Index;
