/**
 * Calculator component that displays an interactive calculator with a history panel.
 * It handles basic and advanced operations (like sin, cos, tan, and square root)
 * using the mathjs library, shows partial results as the user types, and
 * automatically scrolls horizontally when expressions become too long.
 */

import Key from "./Key";
import { useState, useEffect, useRef } from "react";
import { evaluate } from "mathjs";
import { keys, neonStyles } from "../utils/constants";

const Calculator = () => {
  // Indicates whether the final result is being shown
  const [showResult, setShowResult] = useState(false);

  // Holds the current expression or final result
  const [display, setDisplay] = useState("");

  // Keeps track of all past calculations
  const [history, setHistory] = useState([]);

  // Stores the partial (live) evaluation of the current expression
  const [partialResult, setPartialResult] = useState("");

  // References to the display elements (mobile and desktop) for automatic scrolling
  const displayRefMobile = useRef(null);
  const displayRefDesktop = useRef(null);

  // Tailwind classes for the expression and the final result text sizes
  const operationClass =
    "text-[1.2rem] tracking-[2px] text-[rgba(255,255,255,0.5)] justify-end";
  const resultClass = "text-[1.7rem]";

  /**
   * Checks if the given value is one of the basic arithmetic operators.
   */
  const isOperator = (value) => ["%", "*", "/", "-", "+"].includes(value);

  /**
   * Handles each button press, updating the expression or calculating the result.
   * @param {string} value - The value or operation label from the clicked button.
   */
  const handleButton = (value) => {
    // Reset the "showResult" state to go back to editing mode
    setShowResult(false);

    // Clear all (AC)
    if (value === "AC") {
      setDisplay("");
      return;
    }

    // Remove the last character (C)
    if (value === "C") {
      setDisplay(display.slice(0, -1));
      return;
    }

    // Evaluate the final result (=)
    if (value === "=") {
      calculateResult();
      return;
    }

    // Handle advanced functions and parentheses
    if (["sin", "cos", "tan", "√", "(", ")"].includes(value)) {
      if (value === "√") {
        // Replace "√" with "sqrt("
        setDisplay(display + "sqrt(");
      } else if (["sin", "cos", "tan"].includes(value)) {
        // Append "(" after the function name
        setDisplay(display + value + "(");
      } else {
        // Directly add "(" or ")"
        setDisplay(display + value);
      }
      return;
    }

    // Avoid consecutive operators or starting with an operator
    if (isOperator(value)) {
      if (display === "" || isOperator(display.slice(-1))) return;
      setDisplay(display + value);
      return;
    }

    // Prevent multiple decimal points in a row
    if (value === ".") {
      if (display.endsWith(".")) return;
      setDisplay(display + value);
      return;
    }

    // Default: add the pressed key (numbers, etc.) to the expression
    setDisplay(display + value);
  };

  /**
   * Uses mathjs to evaluate the current expression, then updates the display
   * and history with the result.
   */
  const calculateResult = () => {
    if (display.length !== 0) {
      try {
        let result = evaluate(display);
        result = parseFloat(result.toFixed(3)); // Round to 3 decimals
        setHistory([...history, display + " = " + result]);
        setDisplay(result.toString());
        setShowResult(true);
      } catch (error) {
        setDisplay("Error");
        console.error(error);
      }
    }
  };

  /**
   * Loads a previous expression from the history into the display.
   * @param {string} item - A string containing "expression = result".
   */
  const handleHistoryClick = (item) => {
    const expression = item.split(" = ")[0];
    setDisplay(expression);
    setShowResult(false);
  };

  /**
   * useEffect that calculates a partial result every time the display changes,
   * unless we're showing the final result.
   */
  useEffect(() => {
    if (!display || showResult) {
      setPartialResult("");
      return;
    }
    try {
      let result = evaluate(display);
      result = parseFloat(result.toFixed(3));
      setPartialResult(result.toString());
    } catch {
      // If the expression is incomplete or invalid, clear the partial result
      setPartialResult("");
    }
  }, [display, showResult]);

  /**
   * useEffect that automatically scrolls the display areas (mobile/desktop)
   * to the rightmost side whenever the 'display' value changes.
   */
  useEffect(() => {
    if (displayRefMobile.current) {
      displayRefMobile.current.scrollLeft =
        displayRefMobile.current.scrollWidth;
    }
    if (displayRefDesktop.current) {
      displayRefDesktop.current.scrollLeft =
        displayRefDesktop.current.scrollWidth;
    }
  }, [display]);

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="flex flex-col items-center md:hidden">
        {/* History section */}
        <div className="w-full max-w-[320px] bg-black p-4 rounded-2xl text-white mb-4">
          <h2 className="text-lg mb-2">Historial</h2>
          <ul>
            {history.map((item, index) => (
              <li
                key={index}
                className="text-sm cursor-pointer hover:text-gray-300"
                onClick={() => handleHistoryClick(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Calculator section */}
        <div className="w-full max-w-[320px] bg-black flex flex-col gap-4 p-4 rounded-2xl text-white">
          {/* Expression display with horizontal scroll */}
          <div
            ref={displayRefMobile}
            className="overflow-x-auto w-full bg-[#141414] min-h-[100px] p-4 rounded-[10px] my-scroll"
          >
            <div className="min-w-max whitespace-nowrap text-right flex flex-col items-end">
              {/* Main expression or final result */}
              <div className={showResult ? resultClass : operationClass}>
                {display}
              </div>

              {/* Live partial result (only if not showing final result) */}
              {partialResult && !showResult && (
                <div className="text-sm text-gray-400 mt-1">
                  {partialResult}
                </div>
              )}
            </div>
          </div>

          {/* Keypad (buttons) */}
          <div className="grid grid-cols-4 gap-[0.3rem]">
            {keys.map((key, index) => (
              <Key
                key={index}
                label={key}
                isEqual={key === "="}
                onClick={handleButton}
                neonStyle={neonStyles[key] || "from-gray-500 to-gray-300"}
              />
            ))}
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:relative md:flex md:justify-center md:items-center">
        {/* History panel on the left */}
        <div className="absolute left-[-320px] top-0 w-[300px] bg-black p-4 rounded-2xl text-white max-h-full overflow-auto">
          <h2 className="text-lg mb-2">Historial</h2>
          <ul>
            {history.map((item, index) => (
              <li
                key={index}
                className="text-sm text-gray-500 cursor-pointer hover:text-white"
                onClick={() => handleHistoryClick(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Calculator section */}
        <div className="w-[320px] bg-black flex flex-col gap-4 p-4 rounded-2xl text-white">
          {/* Expression display with horizontal scroll */}
          <div
            ref={displayRefDesktop}
            className="overflow-x-auto w-full bg-[#141414] min-h-[100px] p-4 rounded-[10px] my-scroll"
          >
            <div className="min-w-max whitespace-nowrap text-right flex flex-col items-end">
              {/* Main expression or final result */}
              <div className={showResult ? resultClass : operationClass}>
                {display}
              </div>

              {/* Live partial result (only if not showing final result) */}
              {partialResult && !showResult && (
                <div className="text-sm text-gray-400 mt-1">
                  {partialResult}
                </div>
              )}
            </div>
          </div>

          {/* Keypad (buttons) */}
          <div className="grid grid-cols-4 gap-[0.3rem]">
            {keys.map((key, index) => (
              <Key
                key={index}
                label={key}
                isEqual={key === "="}
                onClick={handleButton}
                neonStyle={neonStyles[key] || "from-gray-500 to-gray-300"}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Calculator;
