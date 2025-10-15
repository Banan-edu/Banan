
'use client';

import { useEffect, useState } from 'react';

interface VirtualKeyboardGuideProps {
  currentChar: string;
  nextChar: string;
  handType: string;
  lockHands?: boolean;
  isRTL?:boolean;
}

const keyboardLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  [' ']
];

const fingerColors = {
  leftPinky: '#EF4444',
  leftRing: '#F59E0B',
  leftMiddle: '#10B981',
  leftIndex: '#3B82F6',
  leftThumb: '#8B5CF6',
  rightThumb: '#8B5CF6',
  rightIndex: '#3B82F6',
  rightMiddle: '#10B981',
  rightRing: '#F59E0B',
  rightPinky: '#EF4444',
};

const keyToFinger: { [key: string]: keyof typeof fingerColors } = {
  '`': 'leftPinky', '1': 'leftPinky', 'q': 'leftPinky', 'a': 'leftPinky', 'z': 'leftPinky',
  '2': 'leftRing', 'w': 'leftRing', 's': 'leftRing', 'x': 'leftRing',
  '3': 'leftMiddle', 'e': 'leftMiddle', 'd': 'leftMiddle', 'c': 'leftMiddle',
  '4': 'leftIndex', '5': 'leftIndex', 'r': 'leftIndex', 't': 'leftIndex', 'f': 'leftIndex', 'g': 'leftIndex', 'v': 'leftIndex', 'b': 'leftIndex',
  '6': 'rightIndex', '7': 'rightIndex', 'y': 'rightIndex', 'u': 'rightIndex', 'h': 'rightIndex', 'j': 'rightIndex', 'n': 'rightIndex', 'm': 'rightIndex',
  '8': 'rightMiddle', 'i': 'rightMiddle', 'k': 'rightMiddle', ',': 'rightMiddle',
  '9': 'rightRing', 'o': 'rightRing', 'l': 'rightRing', '.': 'rightRing',
  '0': 'rightPinky', '-': 'rightPinky', '=': 'rightPinky', 'p': 'rightPinky', '[': 'rightPinky', ']': 'rightPinky', '\\': 'rightPinky', ';': 'rightPinky', "'": 'rightPinky', '/': 'rightPinky',
  ' ': 'leftThumb',
};

export function VirtualKeyboardGuide({ currentChar, nextChar, lockHands = true, isRTL, handType }: VirtualKeyboardGuideProps) {
  const [highlightedKey, setHighlightedKey] = useState<string>('');
  const [nextHighlightedKey, setNextHighlightedKey] = useState<string>('');
  const [activeFinger, setActiveFinger] = useState<keyof typeof fingerColors | null>(null);
  const [nextFinger, setNextFinger] = useState<keyof typeof fingerColors | null>(null);

  useEffect(() => {
    const char = currentChar.toLowerCase();
    const next = nextChar.toLowerCase();
    
    setHighlightedKey(char);
    setNextHighlightedKey(next);
    setActiveFinger(keyToFinger[char] || null);
    setNextFinger(keyToFinger[next] || null);
  }, [currentChar, nextChar]);

  const getKeyClass = (key: string) => {
    const baseClass = 'relative rounded-md font-semibold transition-all duration-200 flex items-center justify-center';
    const isSpace = key === ' ';
    const sizeClass = isSpace ? 'h-12 w-64' : 'h-12 w-12';
    
    if (key === highlightedKey) {
      const color = activeFinger ? fingerColors[activeFinger] : '#3B82F6';
      return `${baseClass} ${sizeClass} text-white shadow-lg scale-110 z-10`;
    }
    
    if (key === nextHighlightedKey) {
      const color = nextFinger ? fingerColors[nextFinger] : '#93C5FD';
      return `${baseClass} ${sizeClass} bg-blue-200 text-gray-700 border-2 border-blue-400`;
    }
    
    const finger = keyToFinger[key];
    if (finger && lockHands) {
      return `${baseClass} ${sizeClass} bg-white border-2 text-gray-700 shadow-sm`;
    }
    
    return `${baseClass} ${sizeClass} bg-white border border-gray-300 text-gray-700`;
  };

  const getKeyStyle = (key: string) => {
    if (key === highlightedKey && activeFinger) {
      return { backgroundColor: fingerColors[activeFinger] };
    }
    
    if (lockHands) {
      const finger = keyToFinger[key];
      if (finger) {
        return { borderColor: fingerColors[finger] };
      }
    }
    
    return {};
  };

  const HandIndicator = ({ side }: { side: 'left' | 'right' }) => {
    const fingers = side === 'left' 
      ? ['leftPinky', 'leftRing', 'leftMiddle', 'leftIndex', 'leftThumb'] as const
      : ['rightThumb', 'rightIndex', 'rightMiddle', 'rightRing', 'rightPinky'] as const;

    return (
      <div className="flex gap-1 items-end">
        {fingers.map((finger) => {
          const isActive = activeFinger === finger;
          const isNext = nextFinger === finger;
          
          return (
            <div
              key={finger}
              className={`transition-all duration-200 rounded-t-full ${
                finger.includes('Thumb') ? 'w-8 h-12' : 'w-6 h-16'
              } ${isActive ? 'scale-110 shadow-lg' : ''} ${isNext ? 'opacity-60' : ''}`}
              style={{ 
                backgroundColor: fingerColors[finger],
                opacity: isActive ? 1 : isNext ? 0.6 : 0.3
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div dir={`${isRTL?'ltr':'ltr'}`} className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-6 shadow-lg">
      {lockHands && (
        <div className="flex justify-between mb-6 px-8">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700 mb-2">Left Hand</div>
            <HandIndicator side="left" />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700 mb-2">Right Hand</div>
            <HandIndicator side="right" />
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1" style={{ paddingLeft: `${rowIndex * 8}px` }}>
            {row.map((key) => (
              <div
                key={key}
                className={getKeyClass(key)}
                style={getKeyStyle(key)}
              >
                {key === ' ' ? 'Space' : key.toUpperCase()}
                {key === highlightedKey && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Press this!
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {lockHands && (
        <div className="mt-6 flex gap-4 justify-center flex-wrap"> 
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: fingerColors.leftPinky }}></div>
            <span className="text-xs text-gray-600">Pinky</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: fingerColors.leftRing }}></div>
            <span className="text-xs text-gray-600">Ring</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: fingerColors.leftMiddle }}></div>
            <span className="text-xs text-gray-600">Middle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: fingerColors.leftIndex }}></div>
            <span className="text-xs text-gray-600">Index</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: fingerColors.leftThumb }}></div>
            <span className="text-xs text-gray-600">Thumb</span>
          </div>
        </div>
      )}
    </div>
  );
}
