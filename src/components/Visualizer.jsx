import React, { useState, useCallback, useRef } from 'react';
import { Play, Pause, RefreshCw, Info, Circle, Square } from 'lucide-react';
import useSound from 'use-sound';
import { SOUNDS } from '../assets/sounds';

function Visualizer() {
  const [array, setArray] = useState(() => generateRandomArray());
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [visualType, setVisualType] = useState('bars');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  
  const animationRef = useRef();
  const speedRef = useRef(100);

  // Sound effects
  const [playCompare] = useSound(SOUNDS.COMPARE, { volume: 0.5 });
  const [playSwap] = useSound(SOUNDS.SWAP, { volume: 0.5 });
  const [playComplete] = useSound(SOUNDS.COMPLETE, { volume: 0.5 });

  function generateRandomArray(size = 20) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 50) + 1);
  }

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
    setError('');
  };

  const handleSubmitArray = () => {
    try {
      const numbers = userInput.split(',').map(num => {
        const parsed = parseInt(num.trim());
        if (isNaN(parsed) || parsed < 1 || parsed > 50) {
          throw new Error('Numbers must be between 1 and 50');
        }
        return parsed;
      });

      if (numbers.length < 2 || numbers.length > 30) {
        throw new Error('Please enter between 2 and 30 numbers');
      }

      setArray(numbers);
      setUserInput('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const bubbleSort = useCallback(function* (arr) {
    const numbers = [...arr];
    let swapped;
    
    do {
      swapped = false;
      for (let i = 0; i < numbers.length - 1; i++) {
        playCompare();
        yield { array: [...numbers], comparing: [i, i + 1], swapped: false };
        
        if (numbers[i] > numbers[i + 1]) {
          [numbers[i], numbers[i + 1]] = [numbers[i + 1], numbers[i]];
          swapped = true;
          playSwap();
          yield { array: [...numbers], comparing: [i, i + 1], swapped: true };
        }
      }
    } while (swapped);

    playComplete();
    return { array: numbers, comparing: null, swapped: false };
  }, [playCompare, playSwap, playComplete]);

  const sortingRef = useRef();

  const startSorting = useCallback(() => {
    if (!sortingRef.current) {
      sortingRef.current = bubbleSort(array);
    }
    
    setIsRunning(true);
    
    function step() {
      if (!sortingRef.current) return;
      
      const result = sortingRef.current.next();
      
      if (!result.done) {
        setCurrentStep(result.value);
        animationRef.current = requestAnimationFrame(() => {
          setTimeout(step, speedRef.current);
        });
      } else {
        setIsRunning(false);
        sortingRef.current = undefined;
        setCurrentStep(null);
      }
    }
    
    step();
  }, [array, bubbleSort]);

  const pauseSorting = useCallback(() => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const resetArray = useCallback(() => {
    pauseSorting();
    sortingRef.current = undefined;
    setCurrentStep(null);
    setArray(generateRandomArray());
  }, [pauseSorting]);

  const getElementColor = (index) => {
    if (!currentStep?.comparing) return 'bg-blue-500';
    if (currentStep.comparing.includes(index)) {
      return currentStep.swapped ? 'bg-red-500' : 'bg-green-500';
    }
    return 'bg-blue-500';
  };

  const renderElement = (value, index) => {
    const color = getElementColor(index);
    const size = `${(value / 50) * 100}%`;

    switch (visualType) {
      case 'circles':
        return (
          <div
            key={index}
            className={`${color} rounded-full transition-all duration-200 flex items-center justify-center text-white text-xs`}
            style={{
              width: '2.5rem',
              height: '2.5rem',
              transform: `scale(${value / 25})`,
            }}
          >
            {value}
          </div>
        );
      case 'squares':
        return (
          <div
            key={index}
            className={`${color} transition-all duration-200 flex items-center justify-center text-white text-xs`}
            style={{
              width: '2.5rem',
              height: '2.5rem',
              transform: `scale(${value / 25})`,
            }}
          >
            {value}
          </div>
        );
      default:
        return (
          <div
            key={index}
            className={`w-8 ${color} transition-all duration-200`}
            style={{ height: size }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Bubble Sort Visualizer</h1>
            <div className="flex gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setVisualType('bars')}
                  className={`p-2 rounded ${
                    visualType === 'bars' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                  title="Bar View"
                >
                  <div className="w-4 h-6 bg-current" />
                </button>
                <button
                  onClick={() => setVisualType('circles')}
                  className={`p-2 rounded ${
                    visualType === 'circles' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                  title="Circle View"
                >
                  <Circle size={24} />
                </button>
                <button
                  onClick={() => setVisualType('squares')}
                  className={`p-2 rounded ${
                    visualType === 'squares' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                  title="Square View"
                >
                  <Square size={24} />
                </button>
              </div>
              <button
                onClick={isRunning ? pauseSorting : startSorting}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isRunning
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white transition-colors`}
              >
                {isRunning ? (
                  <>
                    <Pause size={20} /> Pause
                  </>
                ) : (
                  <>
                    <Play size={20} /> Start
                  </>
                )}
              </button>
              <button
                onClick={resetArray}
                className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white flex items-center gap-2 transition-colors"
              >
                <RefreshCw size={20} /> Reset
              </button>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors"
              >
                <Info size={20} /> Info
              </button>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={userInput}
                onChange={handleUserInput}
                placeholder="Enter numbers separated by commas (e.g., 5,2,8,1)"
                className="flex-1 p-2 border rounded-lg"
                disabled={isRunning}
              />
              <button
                onClick={handleSubmitArray}
                disabled={isRunning}
                className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors disabled:opacity-50"
              >
                Set Array
              </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>

          <div className="h-64 flex items-center justify-center gap-1 mb-8">
            {(currentStep?.array || array).map((value, index) => renderElement(value, index))}
          </div>

          {showInfo && (
            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <h2 className="text-xl font-semibold mb-4">About Bubble Sort</h2>
              <p className="text-gray-700 mb-4">
                Bubble Sort is a simple sorting algorithm that repeatedly steps through the list,
                compares adjacent elements and swaps them if they are in the wrong order.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Time Complexity</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    <li>Best Case: O(n)</li>
                    <li>Average Case: O(n²)</li>
                    <li>Worst Case: O(n²)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Space Complexity</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    <li>O(1) - Only requires a single additional memory space</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Visualizer;