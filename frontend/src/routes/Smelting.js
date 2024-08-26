import React, { useState, useEffect } from 'react';
import './Smelting.css';
import skillData from '../data/Artisan_skill.json';
import expData from '../data/Exp.json';

const Smelting = () => {
  const [currentLevel, setCurrentLevel] = useState('');
  const [currentPercentage, setCurrentPercentage] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [currentSPDLevel, setCurrentSPDLevel] = useState('');
  const [currentSPDPercentage, setCurrentSPDPercentage] = useState('');
  const [targetSPDLevel, setTargetSPDLevel] = useState('');
  const [result, setResult] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [smeltingItems, setSmeltingItems] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [playerClass, setPlayerClass] = useState('');
  const [buff, setBuff] = useState('');
  const [t1Bonus, setT1Bonus] = useState(false);
  const [t2Bonus, setT2Bonus] = useState(false);
  const [t3Bonus, setT3Bonus] = useState(false);

  useEffect(() => {
    setSmeltingItems(skillData.Smelting.items);
  }, []);

  const calculateEfficiency = () => {
    let totalEfficiency = 0;

    if (isMember) totalEfficiency += 10;
    if (playerClass === 'blacksmith') totalEfficiency += 10;

    switch (buff) {
      case 'smelting': totalEfficiency += 5; break;
      case 'hammerfell': totalEfficiency += 10; break;
      case 'molten': totalEfficiency += 25; break;
      case 'tampering': totalEfficiency += 35; break;
      case 'mjolnir': totalEfficiency += 120; break;
      case 'cosmic': totalEfficiency += 0; break;
      default: break; 
    }

    return totalEfficiency;
  };

  const applyEfficiency = (baseWaitLength) => {
    const efficiency = calculateEfficiency();
    return baseWaitLength * (100 / (100 + efficiency));
  };

  const calculateSmeltingExpBonus = () => {
    let expBonus = 1;
  
    if (isMember) expBonus += 0.15;
    if (playerClass === 'blacksmith') expBonus += 0.10;
    if (playerClass === 'forsaken') expBonus -= 0.50;
  
    if (t1Bonus) expBonus += 0.15;
    if (t2Bonus) expBonus += 0.20;
    if (t3Bonus) expBonus += 0.30;
  
    return expBonus;
  };

  const calculateSPDExpBonus = () => {
    let expBonus = 1;
  
    if (isMember) expBonus += 0.15;
    if (playerClass === 'shadowblade') expBonus += 0.05;
    if (playerClass === 'forsaken') expBonus -= 0.50;
  
    if (t1Bonus) expBonus += 0.15;
    if (t2Bonus) expBonus += 0.20;
    if (t3Bonus) expBonus += 0.30;

    switch (buff) {
      case 'galeforce': expBonus += 0.10; break;
      case 'quickstep': expBonus += 0.20; break;
      case 'windrider': expBonus += 0.30; break;
      case 'lightning': expBonus += 0.40; break;
      default: break; 
    }
  
    return expBonus;
  };

  const handleCalculate = (selectedItem) => {
    const item = smeltingItems.find(i => i.name === selectedItem);
    if (item && (parseInt(currentLevel) >= item.minLevel || currentSPDLevel)) {
      const currentLvl = parseInt(currentLevel) || 1;
      const targetLvl = parseInt(targetLevel) || currentLvl;
      const currentSPDLvl = parseInt(currentSPDLevel) || 1;
      const targetSPDLvl = parseInt(targetSPDLevel) || currentSPDLvl;
      
      const currentLevelExp = parseInt(expData[currentLvl]);
      const nextLevelExp = parseInt(expData[currentLvl + 1]);
      const percentage = currentPercentage === '' ? 0 : parseFloat(currentPercentage);
      const currentExp = currentLevelExp + ((nextLevelExp - currentLevelExp) * percentage / 100);
      
      const currentSPDLevelExp = parseInt(expData[currentSPDLvl]);
      const nextSPDLevelExp = parseInt(expData[currentSPDLvl + 1]);
      const spdPercentage = currentSPDPercentage === '' ? 0 : parseFloat(currentSPDPercentage);
      const currentSPDExp = currentSPDLevelExp + ((nextSPDLevelExp - currentSPDLevelExp) * spdPercentage / 100);
      
      const targetExp = parseInt(expData[targetLvl]);
      const targetSPDExp = parseInt(expData[targetSPDLvl]);
      const expNeeded = targetExp - currentExp;
      const spdExpNeeded = targetSPDExp - currentSPDExp;
      
      let baseItemExp = item.exp;
      let waitLength = item.wait_length;
      let baseSPDExp = item.SPDexp;

      const smeltingExpBonus = calculateSmeltingExpBonus();
      const spdExpBonus = calculateSPDExpBonus();

      const itemExp = Math.round(baseItemExp * smeltingExpBonus + 0.00000001);
      const spdExp = Math.round(baseSPDExp * spdExpBonus + 0.00000001);

      const finalWaitLength = applyEfficiency(waitLength);
      const totalEfficiency = calculateEfficiency();

      const totalItems = Math.ceil(expNeeded / itemExp);
      const totalSPDItems = Math.ceil(spdExpNeeded / spdExp);
      const totalSPDexp = totalItems * spdExp;
      const totalTimeInSeconds = Math.round(totalItems * finalWaitLength);
      const totalSPDTimeInSeconds = Math.round(totalSPDItems * finalWaitLength);
      
      const materials = Object.entries(item.Material).map(([name, quantity]) => ({
        name,
        quantity: parseInt(quantity) * totalItems
      }));

      const spdMaterials = Object.entries(item.Material).map(([name, quantity]) => ({
        name,
        quantity: parseInt(quantity) * totalSPDItems
      }));

      setResult({
        totalExp: Math.round(expNeeded),
        totalItems,
        totalSPDexp: Math.round(totalSPDexp),
        totalTimeInSeconds,
        totalSPDExp: Math.round(spdExpNeeded),
        totalSPDItems,
        totalSPDTimeInSeconds,
        selectedItem,
        isMember,
        playerClass,
        buff,
        itemExp,
        spdExp,
        waitLength: finalWaitLength.toFixed(1),
        spdExpBonus: (spdExpBonus - 1) * 100,
        smeltingExpBonus: (smeltingExpBonus - 1) * 100,
        totalEfficiency,
        showSmelting: currentLevel !== '' || targetLevel !== '',
        showSPD: currentSPDLevel !== '' || targetSPDLevel !== '',
        materials,
        spdMaterials,
      });
      setActiveItem(selectedItem);
    } else {
      setResult({
        error: `You need to be at least level ${item.minLevel} to smelt ${selectedItem}, or input SPD levels.`
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
    <div className="smelting-calculator">
      <h1>{skillData.Smelting.name}</h1>
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
        <h1>Speed</h1>
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="current-spd-level">Current Lvl</label>
            <input
              id="current-spd-level"
              type="number"
              value={currentSPDLevel}
              onChange={handleInputChange(setCurrentSPDLevel)}
              min="1"
              max="100"
            />
          </div>
          <div className="input-group percentage">
            <label htmlFor="current-spd-percentage">Current %</label>
            <div className="percentage-input-wrapper">
              <input
                id="current-spd-percentage"
                type="number"
                value={currentSPDPercentage}
                onChange={handleInputChange(setCurrentSPDPercentage)}
                min="0"
                max="99"
              />
              <span className="percentage-symbol">%</span>
            </div>
          </div>
          <div className="arrow">→</div>
          <div className="input-group">
            <label htmlFor="target-spd-level">Target lvl</label>
            <input
              id="target-spd-level"
              type="number"
              value={targetSPDLevel}
              onChange={handleInputChange(setTargetSPDLevel)}
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
                <option value="shadowblade">Shadowblade</option>
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
                <option value="smelting">Smelting</option>
                <option value="hammerfell">Hammerfell</option>
                <option value="molten">Molten</option>
                <option value="tampering">Tampering</option>
                <option value="mjolnir">Mjolni's</option>
                <option value="cosmic">Cosmic</option>
                <option value="galeforce">Galeforce</option>
                <option value="quickstep">Quickstep</option>
                <option value="windrider">Windrider</option>
                <option value="lightning">Lightning Sprint</option>
              </select>
            </div>
          </div>
        </div>
        <h2>Smelting Item</h2>
        <div className="smelting-items">
          {smeltingItems.map((item, index) => (
            <button
              key={index}
              className={`smelting-item-button ${activeItem === item.name ? 'active' : ''} ${parseInt(currentLevel) < item.minLevel ? 'disabled' : ''}`}
              onClick={() => handleCalculate(item.name)}
              disabled={parseInt(currentLevel) < item.minLevel}
            >
              {item.name}
            </button>
          ))}
        </div>
        {result && !result.error && (
          <div className="result">
            {result.showSmelting && (
              <>
                <h3>Smelting Results:</h3>
                <p>Total exp needed: {result.totalExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <p>Total {result.selectedItem}: {result.totalItems.toLocaleString()}</p>
                <p>Total time needed: {formatTime(result.totalTimeInSeconds)}</p>
              </>
            )}
            {result.showSPD && (
              <>
                <h3>Speed Results:</h3>
                <p>Total SPD exp needed: {result.totalSPDExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <p>Total {result.selectedItem} for SPD: {result.totalSPDItems.toLocaleString()}</p>
                <p>Total time needed for SPD: {formatTime(result.totalSPDTimeInSeconds)}</p>
              </>
            )}
            <p className="total-efficiency">Total Efficiency applied: +{result.totalEfficiency}%</p>
            <p className="exp-bonus">Total Smelting exp bonus applied: {result.smeltingExpBonus.toFixed(2)}%</p>
            <p className="exp-bonus">Total SPD exp bonus applied: {result.spdExpBonus.toFixed(2)}%</p>
            <p>XP per item: {result.itemExp}</p>
            <p>SPD exp per item: {result.spdExp}</p>
            <p>Wait time per item: {result.waitLength}s</p>
            {result.showSmelting && (
              <>
                <h3>Materials needed for Smelting:</h3>
                {result.materials.map((material, index) => (
                  <p key={index}>{material.name}: {material.quantity.toLocaleString()}</p>
                ))}
              </>
            )}
            
            {result.showSPD && (
              <>
                <h3>Materials needed for Speed:</h3>
                {result.spdMaterials.map((material, index) => (
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

export default Smelting;