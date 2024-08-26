import React, { useState, useEffect } from 'react';
import './Cooking.css';
import skillData from '../data/Artisan_skill.json';
import expData from '../data/Exp.json';

const Cooking = () => {
  const [currentLevel, setCurrentLevel] = useState('');
  const [currentPercentage, setCurrentPercentage] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [currentDEXLevel, setCurrentDEXLevel] = useState('');
  const [currentDEXPercentage, setCurrentDEXPercentage] = useState('');
  const [targetDEXLevel, setTargetDEXLevel] = useState('');
  const [result, setResult] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [cookingItems, setCookingItems] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [playerClass, setPlayerClass] = useState('');
  const [buff, setBuff] = useState('');
  const [t1Bonus, setT1Bonus] = useState(false);
  const [t2Bonus, setT2Bonus] = useState(false);
  const [t3Bonus, setT3Bonus] = useState(false);

  useEffect(() => {
    setCookingItems(skillData.Cooking.items);
  }, []);

  const calculateCookingExpBonus = () => {
    let expBonus = 1;
  
    if (isMember) expBonus += 0.15;
    if (playerClass === 'chef') expBonus += 0.10;
    if (playerClass === 'forsaken') expBonus -= 0.50;
  
    if (t1Bonus) expBonus += 0.15;
    if (t2Bonus) expBonus += 0.20;
    if (t3Bonus) expBonus += 0.30;
  
    switch (buff) {
      case 'chefs': expBonus += 0.10; break;
      case 'flavorburst': expBonus += 0.20; break;
      case 'spicefinder': expBonus += 0.35; break;
      case 'gourmet': expBonus += 0.45; break;
      case 'eternal': expBonus += 0; break;
      case 'divine': expBonus += 1; break;
      default: break; 
    }
  
    return expBonus;
  };

  const calculateDEXExpBonus = () => {
    let expBonus = 1;
  
    if (isMember) expBonus += 0.15;
    if (playerClass === 'ranger') expBonus += 0.07;
    if (playerClass === 'forsaken') expBonus -= 0.50;
  
    if (t1Bonus) expBonus += 0.15;
    if (t2Bonus) expBonus += 0.20;
    if (t3Bonus) expBonus += 0.30;

    switch (buff) {
      case 'falcon': expBonus += 0.10; break;
      case 'precision': expBonus += 0.20; break;
      case 'acrobatics': expBonus += 0.30; break;
      case 'twinstrike': expBonus += 0.40; break;
      default: break; 
    }
  
    return expBonus;
  };

  const calculateEfficiency = () => {
    let totalEfficiency = 0;

    if (isMember) totalEfficiency += 10;
    if (playerClass === 'chef') totalEfficiency += 10;

    switch (buff) {
      case 'chefs': totalEfficiency += 5; break;
      case 'flavorburst': totalEfficiency +=10; break;
      case 'spicefinder': totalEfficiency += 25; break;
      case 'gourmet': totalEfficiency += 35; break;
      case 'eternal': totalEfficiency += 120; break;
      case 'divine': totalEfficiency += 0; break;
      default: break; 
    }

    return totalEfficiency;
  };

  const applyEfficiency = (baseWaitLength) => {
    const efficiency = calculateEfficiency();
    return baseWaitLength * (100 / (100 + efficiency));
  };

  const handleCalculate = (selectedItem) => {
    const item = cookingItems.find(i => i.name === selectedItem);
    if (item && (parseInt(currentLevel) >= item.minLevel || currentDEXLevel)) {
      const currentLvl = parseInt(currentLevel) || 1;
      const targetLvl = parseInt(targetLevel) || currentLvl;
      const currentDEXLvl = parseInt(currentDEXLevel) || 1;
      const targetDEXLvl = parseInt(targetDEXLevel) || currentDEXLvl;
      
      const currentLevelExp = parseInt(expData[currentLvl]);
      const nextLevelExp = parseInt(expData[currentLvl + 1]);
      const percentage = currentPercentage === '' ? 0 : parseFloat(currentPercentage);
      const currentExp = currentLevelExp + ((nextLevelExp - currentLevelExp) * percentage / 100);
      
      const currentDEXLevelExp = parseInt(expData[currentDEXLvl]);
      const nextDEXLevelExp = parseInt(expData[currentDEXLvl + 1]);
      const dexPercentage = currentDEXPercentage === '' ? 0 : parseFloat(currentDEXPercentage);
      const currentDEXExp = currentDEXLevelExp + ((nextDEXLevelExp - currentDEXLevelExp) * dexPercentage / 100);
      
      const targetExp = parseInt(expData[targetLvl]);
      const targetDEXExp = parseInt(expData[targetDEXLvl]);
      const expNeeded = targetExp - currentExp;
      const dexExpNeeded = targetDEXExp - currentDEXExp;
      
      let baseItemExp = item.exp;
      let waitLength = item.wait_length;
      let baseDEXExp = item.DEXexp;
  
      const cookingExpBonus = calculateCookingExpBonus();
      const dexExpBonus = calculateDEXExpBonus();
  
      const itemExp = Math.round(baseItemExp * cookingExpBonus + 0.00000001);
      const dexExp = Math.round(baseDEXExp * dexExpBonus + 0.00000001);
  
      const finalWaitLength = applyEfficiency(waitLength);
      const totalEfficiency = calculateEfficiency();
  
      const totalItems = Math.ceil(expNeeded / itemExp);
      const totalDEXItems = Math.ceil(dexExpNeeded / dexExp);
      const totalDEXexp = totalItems * dexExp;
      const totalTimeInSeconds = Math.round(totalItems * finalWaitLength);
      const totalDEXTimeInSeconds = Math.round(totalDEXItems * finalWaitLength);
      
      const materials = Object.entries(item.Material).map(([name, quantity]) => ({
        name,
        quantity: parseInt(quantity) * totalItems
      }));

      const dexMaterials = Object.entries(item.Material).map(([name, quantity]) => ({
        name,
        quantity: parseInt(quantity) * totalDEXItems
      }));

      setResult({
        totalExp: Math.round(expNeeded),
        totalItems,
        totalDEXexp: Math.round(totalDEXexp),
        totalTimeInSeconds,
        totalDEXExp: Math.round(dexExpNeeded),
        totalDEXItems,
        totalDEXTimeInSeconds,
        selectedItem,
        isMember,
        playerClass,
        buff,
        itemExp,
        dexExp,
        waitLength: finalWaitLength.toFixed(1),
        dexExpBonus: (dexExpBonus - 1) * 100,
        cookingExpBonus: (cookingExpBonus - 1) * 100,
        totalEfficiency,
        showCooking: currentLevel !== '' || targetLevel !== '',
        showDEX: currentDEXLevel !== '' || targetDEXLevel !== '',
        materials,
        dexMaterials,
      });
      setActiveItem(selectedItem);
    } else {
      setResult({
        error: `You need to be at least level ${item.minLevel} to cook ${selectedItem}, or input DEX levels.`
      });
    }
  };

  useEffect(() => {
    if (activeItem) {
      handleCalculate(activeItem);
    }
  }, [isMember, playerClass, buff, t1Bonus, t2Bonus, t3Bonus]);

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
      setter(value);
    } else if (parseInt(value) > 100) {
      setter('100');
    }
  };

  const formatTime = (seconds) => {
    const years = Math.floor(seconds / (365 * 24 * 3600));
    const days = Math.floor((seconds % (365 * 24 * 3600)) / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let result = '';
    if (years > 0) result += `${years}y `;
    if (days > 0 || years > 0) result += `${days}d `;
    result += `${hours}h ${minutes}m ${remainingSeconds}s`;

    return result.trim();
  };

  return (
    <div className="cooking-calculator">
      <h1>{skillData.Cooking.name}</h1>
      <div className="calculator-content">
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="current-level">Current Lvl</label>
            <input
              id="current-level"
              type="number"
              value={currentLevel}
              onChange={handleInputChange(setCurrentLevel)}
              min="1"
              max="100"
            />
          </div>
          <div className="input-group percentage">
            <label htmlFor="current-percentage">Current %</label>
            <div className="percentage-input-wrapper">
              <input
                id="current-percentage"
                type="number"
                value={currentPercentage}
                onChange={handleInputChange(setCurrentPercentage)}
                min="0"
                max="99"
              />
              <span className="percentage-symbol">%</span>
            </div>
          </div>
          <div className="arrow">→</div>
          <div className="input-group">
            <label htmlFor="target-level">Target lvl</label>
            <input
              id="target-level"
              type="number"
              value={targetLevel}
              onChange={handleInputChange(setTargetLevel)}
              min="2"
              max="100"
            />
          </div>
        </div>
        <h1>Dexterity</h1>
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="current-dex-level">Current Lvl</label>
            <input
              id="current-dex-level"
              type="number"
              value={currentDEXLevel}
              onChange={handleInputChange(setCurrentDEXLevel)}
              min="1"
              max="100"
            />
          </div>
          <div className="input-group percentage">
            <label htmlFor="current-dex-percentage">Current %</label>
            <div className="percentage-input-wrapper">
              <input
                id="current-dex-percentage"
                type="number"
                value={currentDEXPercentage}
                onChange={handleInputChange(setCurrentDEXPercentage)}
                min="0"
                max="99"
              />
              <span className="percentage-symbol">%</span>
            </div>
          </div>
          <div className="arrow">→</div>
          <div className="input-group">
            <label htmlFor="target-dex-level">Target lvl</label>
            <input
              id="target-dex-level"
              type="number"
              value={targetDEXLevel}
              onChange={handleInputChange(setTargetDEXLevel)}
              min="2"
              max="100"
            />
          </div>
        </div>
        <div className="options-group">
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="membership"
                checked={isMember}
                onChange={(e) => setIsMember(e.target.checked)}
              />
              <label htmlFor="membership">Membership</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="t1-bonus"
                checked={t1Bonus}
                onChange={(e) => setT1Bonus(e.target.checked)}
              />
              <label htmlFor="t1-bonus">T1 (+15% exp)</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="t2-bonus"
                checked={t2Bonus}
                onChange={(e) => setT2Bonus(e.target.checked)}
              />
              <label htmlFor="t2-bonus">T2 (+20% exp)</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="t3-bonus"
                checked={t3Bonus}
                onChange={(e) => setT3Bonus(e.target.checked)}
              />
              <label htmlFor="t3-bonus">T3 (+30% exp)</label>
            </div>
          </div>
          <div className="selects-row">
            <div className="class-select">
              <label htmlFor="player-class">Class:</label>
              <select
                id="player-class"
                value={playerClass}
                onChange={(e) => setPlayerClass(e.target.value)}
              >
                <option value="">Select Class</option>
                <option value="ranger">Ranger</option>
                <option value="chef">Chef</option>
                <option value="forsaken">Forsaken</option>
              </select>
            </div>
            <div className="buff-select">
              <label htmlFor="buff">Essence Crystal:</label>
              <select
                id="buff"
                value={buff}
                onChange={(e) => setBuff(e.target.value)}
              >
                <option value="">No Buff</option>
                <option value="chefs">Chefs</option>
                <option value="flavorburst">Flavorburst</option>
                <option value="spicefinder">Spicefinder</option>
                <option value="gourmet">Gourmet</option>
                <option value="eternal">Eternal Feast</option>
                <option value="divine">Divine</option>
                <option value="falcon">Falcon's Grace</option>
                <option value="precision">Precision</option>
                <option value="acrobatics">Acrobatic's</option>
                <option value="twinstrike">Twinstrike</option>
              </select>
            </div>
          </div>
        </div>
        <h2>Cooking Item</h2>
        <div className="cooking-items">
          {cookingItems.map((item, index) => (
            <button
              key={index}
              className={`cooking-item-button ${activeItem === item.name ? 'active' : ''} ${parseInt(currentLevel) < item.minLevel ? 'disabled' : ''}`}
              onClick={() => handleCalculate(item.name)}
              disabled={parseInt(currentLevel) < item.minLevel}
            >
              {item.name}
            </button>
          ))}
        </div>
        {result && !result.error && (
          <div className="result">
            {result.showCooking && (
              <>
                <h3>Cooking Results:</h3>
                <p>Total exp needed: {result.totalExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <p>Total {result.selectedItem}: {result.totalItems.toLocaleString()}</p>
                <p>Total time needed: {formatTime(result.totalTimeInSeconds)}</p>
              </>
            )}
            {result.showDEX && (
              <>
                <h3>Dexterity Results:</h3>
                <p>Total DEX exp needed: {result.totalDEXExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <p>Total {result.selectedItem} for DEX: {result.totalDEXItems.toLocaleString()}</p>
                <p>Total time needed for DEX: {formatTime(result.totalDEXTimeInSeconds)}</p>
              </>
            )}
            <p className="total-efficiency">Total Efficiency applied: +{result.totalEfficiency}%</p>
            <p className="exp-bonus">Total Cooking exp bonus applied: {result.cookingExpBonus.toFixed(2)}%</p>
            <p className="exp-bonus">Total DEX exp bonus applied: {result.dexExpBonus.toFixed(2)}%</p>
            <p>XP per item: {result.itemExp}</p>
            <p>DEX exp per item: {result.dexExp}</p>
            <p>Wait time per item: {result.waitLength}s</p>
            {result.showCooking && (
              <>
                <h3>Materials needed for Cooking:</h3>
                {result.materials.map((material, index) => (
                  <p key={index}>{material.name}: {material.quantity.toLocaleString()}</p>
                ))}
              </>
            )}
            {result.showDEX && (
              <>
                <h3>Materials needed for Dexterity:</h3>
                {result.dexMaterials.map((material, index) => (
                  <p key={index}>{material.name}: {material.quantity.toLocaleString()}</p>
                ))}
              </>
            )}
          </div>
        )} 
        {result && result.error && (
          <div className="result error">
            <p>{result.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cooking;