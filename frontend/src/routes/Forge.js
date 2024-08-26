import React, { useState, useEffect, useCallback } from 'react';
import './Forge.css';
import skillData from '../data/Artisan_skill.json';
import expData from '../data/Exp.json';

const Forge = () => {
  const [currentLevel, setCurrentLevel] = useState('');
  const [currentPercentage, setCurrentPercentage] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [currentSTRLevel, setCurrentSTRLevel] = useState('');
  const [currentSTRPercentage, setCurrentSTRPercentage] = useState('');
  const [targetSTRLevel, setTargetSTRLevel] = useState('');
  const [result, setResult] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [forgeItems, setForgeItems] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [playerClass, setPlayerClass] = useState('');
  const [buff, setBuff] = useState('');
  const [tool, setTool] = useState('');
  const [t1Bonus, setT1Bonus] = useState(false);
  const [t2Bonus, setT2Bonus] = useState(false);
  const [t3Bonus, setT3Bonus] = useState(false);

  const tools = [
    { name: 'Basic Anvil', reduction: 0 },
    { name: 'Improved Anvil', reduction: 0.05 },
    { name: 'Advanced Anvil', reduction: 0.10 },
    { name: 'Superior Anvil', reduction: 0.15 },
    { name: 'Master Anvil', reduction: 0.20 },
    { name: 'Grandmaster Anvil', reduction: 0.25 },
  ];

  useEffect(() => {
    setForgeItems(skillData.Forge.items);
  }, []);

  const calculateEfficiency = () => {
    let totalEfficiency = 0;

    if (isMember) totalEfficiency += 10;
    if (playerClass === 'blacksmith') totalEfficiency += 10;

    switch (buff) {
      case 'forge': totalEfficiency += 5; break;
      case 'molten': totalEfficiency += 25; break;
      case 'tampering': totalEfficiency += 35; break;
    }

    const selectedTool = tools.find(t => t.name === tool);
    if (selectedTool) totalEfficiency += selectedTool.reduction * 100;

    return totalEfficiency;
  };

  const applyEfficiency = (baseWaitLength) => {
    const efficiency = calculateEfficiency();
    return baseWaitLength * (100 / (100 + efficiency));
  };

  const calculateForgeExpBonus = () => {
    let expBonus = 1;
  
    if (isMember) expBonus += 0.15;
    if (playerClass === 'forsaken') expBonus -= 0.50;
  
    if (t1Bonus) expBonus += 0.15;
    if (t2Bonus) expBonus += 0.20;
    if (t3Bonus) expBonus += 0.30;
  
    switch (buff) {
      case 'forge': expBonus += 0.10; break;
      case 'molten': expBonus += 0.35; break;
      case 'tampering': expBonus += 0.45; break;
    }
  
    return expBonus;
  };

  const calculateSTRExpBonus = () => {
    let expBonus = 1;
  
    if (isMember) expBonus += 0.15;
    if (playerClass === 'warrior') expBonus += 0.10;
    if (playerClass === 'forsaken') expBonus -= 0.50;
  
    if (t1Bonus) expBonus += 0.15;
    if (t2Bonus) expBonus += 0.20;
    if (t3Bonus) expBonus += 0.30;

    switch (buff) {
      case 'herculean': expBonus += 0.10; break;
      case 'titan': expBonus += 0.20; break;
      case 'ironclad': expBonus += 0.30; break;
      case 'unyielding': expBonus += 0.40; break;
      default: break; 
    }
  
    return expBonus;
  };

  const handleCalculate = useCallback((selectedItem) => {
    const item = forgeItems.find(i => i.name === selectedItem);
    if (item && (parseInt(currentLevel) >= item.minLevel || currentSTRLevel)) {
      const currentLvl = parseInt(currentLevel) || 1;
      const targetLvl = parseInt(targetLevel) || currentLvl;
      const currentSTRLvl = parseInt(currentSTRLevel) || 1;
      const targetSTRLvl = parseInt(targetSTRLevel) || currentSTRLvl;
      
      const currentLevelExp = parseInt(expData[currentLvl]);
      const nextLevelExp = parseInt(expData[currentLvl + 1]);
      const percentage = currentPercentage === '' ? 0 : parseFloat(currentPercentage);
      const currentExp = currentLevelExp + ((nextLevelExp - currentLevelExp) * percentage / 100);
      
      const currentSTRLevelExp = parseInt(expData[currentSTRLvl]);
      const nextSTRLevelExp = parseInt(expData[currentSTRLvl + 1]);
      const strPercentage = currentSTRPercentage === '' ? 0 : parseFloat(currentSTRPercentage);
      const currentSTRExp = currentSTRLevelExp + ((nextSTRLevelExp - currentSTRLevelExp) * strPercentage / 100);
      
      const targetExp = parseInt(expData[targetLvl]);
      const targetSTRExp = parseInt(expData[targetSTRLvl]);
      const expNeeded = targetExp - currentExp;
      const strExpNeeded = targetSTRExp - currentSTRExp;
      
      let baseItemExp = item.exp;
      let waitLength = item.wait_length;
      let baseSTRExp = item.STRexp;
  
      const forgeExpBonus = calculateForgeExpBonus();
      const strExpBonus = calculateSTRExpBonus();
  
      const itemExp = Math.round(baseItemExp * forgeExpBonus + 0.00000001);
      const strExp = Math.round(baseSTRExp * strExpBonus + 0.00000001);
  
      const finalWaitLength = applyEfficiency(waitLength);
      const totalEfficiency = calculateEfficiency();
  
      const totalItems = Math.ceil(expNeeded / itemExp);
      const totalSTRItems = Math.ceil(strExpNeeded / strExp);
      const totalSTRexp = totalItems * strExp;
      const totalTimeInSeconds = Math.round(totalItems * finalWaitLength);
      const totalSTRTimeInSeconds = Math.round(totalSTRItems * finalWaitLength);
      
      const materials = Object.entries(item.Material).map(([name, quantity]) => ({
        name,
        quantity: parseInt(quantity) * totalItems
      }));

      const strMaterials = Object.entries(item.Material).map(([name, quantity]) => ({
        name,
        quantity: parseInt(quantity) * totalSTRItems
      }));

      setResult({
        totalExp: Math.round(expNeeded),
        totalItems,
        totalSTRexp: Math.round(totalSTRexp),
        totalTimeInSeconds,
        totalSTRExp: Math.round(strExpNeeded),
        totalSTRItems,
        totalSTRTimeInSeconds,
        selectedItem,
        isMember,
        playerClass,
        buff,
        tool,
        itemExp,
        strExp,
        waitLength: finalWaitLength.toFixed(1),
        strExpBonus: (strExpBonus - 1) * 100,
        forgeExpBonus: (forgeExpBonus - 1) * 100,
        totalEfficiency,
        showForge: currentLevel !== '' || targetLevel !== '',
        showSTR: currentSTRLevel !== '' || targetSTRLevel !== '',
        materials,
        strMaterials,
      });
      setActiveItem(selectedItem);
    } else {
      setResult({
        error: `You need to be at least level ${item.minLevel} to forge ${selectedItem}, or input STR levels.`
      });
    }
  }, [currentLevel, currentPercentage, targetLevel, currentSTRLevel, currentSTRPercentage, targetSTRLevel, isMember, playerClass, buff, tool, t1Bonus, t2Bonus, t3Bonus, forgeItems]);

  useEffect(() => {
    if (activeItem) {
      handleCalculate(activeItem);
    }
  }, [isMember, playerClass, buff, tool, t1Bonus, t2Bonus, t3Bonus]);

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
    <div className="forge-calculator">
      <h1>{skillData.Forge.name}</h1>
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
        <h1>Strength</h1>
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="current-str-level">Current Lvl</label>
            <input
              id="current-str-level"
              type="number"
              value={currentSTRLevel}
              onChange={handleInputChange(setCurrentSTRLevel)}
              min="1"
              max="100"
            />
          </div>
          <div className="input-group percentage">
            <label htmlFor="current-str-percentage">Current %</label>
            <div className="percentage-input-wrapper">
              <input
                id="current-str-percentage"
                type="number"
                value={currentSTRPercentage}
                onChange={handleInputChange(setCurrentSTRPercentage)}
                min="0"
                max="99"
              />
              <span className="percentage-symbol">%</span>
            </div>
          </div>
          <div className="arrow">→</div>
          <div className="input-group">
            <label htmlFor="target-str-level">Target lvl</label>
            <input
              id="target-str-level"
              type="number"
              value={targetSTRLevel}
              onChange={handleInputChange(setTargetSTRLevel)}
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
                <option value="warrior">Warrior</option>
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
                <option value="herculean">Herculean</option>
                <option value="titan">Titan Power</option>
                <option value="ironclad">Ironclad</option>
                <option value="unyielding">Unyielding</option>
              </select>
            </div>
          </div>
        </div>
        <h2>Forge Item</h2>
        <div className="forge-items">
          {forgeItems.map((item, index) => (
            <button
              key={index}
              className={`forge-item-button ${activeItem === item.name ? 'active' : ''} ${parseInt(currentLevel) < item.minLevel ? 'disabled' : ''}`}
              onClick={() => handleCalculate(item.name)}
              disabled={parseInt(currentLevel) < item.minLevel}
            >
              {item.name}
            </button>
          ))}
        </div>
        {result && !result.error && (
          <div className="result">
            {result.showForge && (
              <>
                <h3>Forge Results:</h3>
                <p>Total exp needed: {result.totalExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <p>Total {result.selectedItem}: {result.totalItems.toLocaleString()}</p>
                <p>Total time needed: {formatTime(result.totalTimeInSeconds)}</p>
              </>
            )}
            {result.showSTR && (
              <>
                <h3>Strength Results:</h3>
                <p>Total STR exp needed: {result.totalSTRExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <p>Total {result.selectedItem} for STR: {result.totalSTRItems.toLocaleString()}</p>
                <p>Total time needed for STR: {formatTime(result.totalSTRTimeInSeconds)}</p>
              </>
            )}
            <p className="total-efficiency">Total Efficiency applied: +{result.totalEfficiency}%</p>
            <p className="exp-bonus">Total Forge exp bonus applied: {result.forgeExpBonus.toFixed(2)}%</p>
            <p className="exp-bonus">Total STR exp bonus applied: {result.strExpBonus.toFixed(2)}%</p>
            <p>XP per item: {result.itemExp}</p>
            <p>STR exp per item: {result.strExp}</p>
            <p>Wait time per item: {result.waitLength}s</p>
            {result.showForge && (
              <>
                <h3>Materials needed for Forge:</h3>
                {result.materials.map((material, index) => (
                  <p key={index}>{material.name}: {material.quantity.toLocaleString()}</p>
                ))}
              </>
            )}
            {result.showSTR && (
              <>
                <h3>Materials needed for Strength:</h3>
                {result.strMaterials.map((material, index) => (
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

export default Forge;