import Image from "next/image";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

interface SlippageSelectorDropdownProps {
  slippage: number;
  onSlippageChange: (value: number) => void;
}

export function SlippageSelectorDropdown({
  slippage,
  onSlippageChange,
}: SlippageSelectorDropdownProps) {
  const [slippageInput, setSlippageInput] = useState(slippage.toString());

  const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSlippageInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      onSlippageChange(numValue);
    }
  };

  const handleAutoClick = () => {
    setSlippageInput("1");
    onSlippageChange(1);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors">
          <Image
            src={"/settings-gear.svg"}
            alt="settings-gear"
            width={20}
            height={20}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 bg-[#141519] border border-[#292B30] p-3"
        align="end"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-white">Set slippage</div>
          <div className="flex items-center bg-[#141519] border border-[#292B30] rounded-md px-2 py-1 space-x-2 max-w-[124px]">
            <div className="relative flex items-center">
              <input
                type="number"
                value={slippageInput}
                onChange={handleSlippageChange}
                className="w-8 text-sm bg-transparent border-none outline-none text-[#8B919D] pr-2"
                min="0"
                max="50"
                step="0.1"
                placeholder="1.0"
              />
              <span className="absolute right-0 text-sm text-[#8B919D] pointer-events-none">%</span>
            </div>
            <button
              onClick={handleAutoClick}
              className="bg-[#4672ED] text-[#0A0B0D] text-xs px-1.5 py-0.5 rounded-full font-medium hover:bg-[#4672ED]/90 transition-colors"
            >
              AUTO
            </button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
