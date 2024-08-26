import React, { useState, useEffect, useCallback } from 'react';
import './Woodcutting.css';
import skillData from '../data/Skill.json';
import expData from '../data/Exp.json';

const Woodcutting = () => {
  const [currentLevel, setCurrentLevel] = useState('');
  const [currentPercentage, setCurrentPercentage] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [currentStrLevel, setCurrentStrLevel] = useState('');
  const [currentStrPercentage, setCurrentStrPercentage] = useState('');
  const [targetStrLevel, setTargetStrLevel] = useState('');
  const [result, setResult] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [woodcuttingItems, setWoodcuttingItems] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [playerClass, setPlayerClass] = useState('');
  const [buff, setBuff] = useState('');
  const [tool, setTool] = useState('');
  const [t1Bonus, setT1Bonus] = useState(false);
  const [t2Bonus, setT2Bonus] = useState(false);
  const [t3Bonus, setT3Bonus] = useState(false);

  const tools = [
    { name: 'Simple Felling Axe', reduction: 0 },
    { name: 'Improved Felling Axe', reduction: 0.05 },
    { name: 'Timberfall Talon', reduction: 0.10 },
    { name: 'Wildwood Chopper', reduction: 0.15 },
    { name: 'Leafblade', reduction: 0.20 },
    { name: 'Grove Cleaver', reduction: 0.25 },
    { name: 'Branchbane Hatchet', reduction: 0.30 },
    { name: 'Silvan Splitter', reduction: 0.35 },
    { name: 'Arboreal Ender', reduction: 0.40 },
    { name: 'Forest Reaver', reduction: 0.50 },
  ];

  useEffect(() => {
    setWoodcuttingItems(skillData.woodcutting.items);
  }, []);

  const calculateEfficiency = () => {
    let totalEfficiency = 0;

    if (isMember) totalEfficiency += 10;
    if (playerClass === 'lumberjack') totalEfficiency += 10;

    switch (buff) {
      case 'lumberjack': totalEfficiency += 5; break;
      case 'timberfall': totalEfficiency += 10; break;
      case 'felling': totalEfficiency += 25; break;
      case 'yggdrasil': totalEfficiency += 35; break;
      case 'titanwood': totalEfficiency += 120; break;
      case 'primeordial': totalEfficiency += 0; break;
      default: break; 
    }

    const selectedTool = tools.find(t => t.name === tool);
    if (selectedTool) totalEfficiency += selectedTool.reduction * 100;

    return totalEfficiency;
  };

  const applyEfficiency = (baseWaitLength) => {
    const efficiency = calculateEfficiency();
    return baseWaitLength * (100 / (100 + efficiency));
  };

  const calculateWoodcuttingExpBonus = () => {
    let expBonus = 1;
  
    if (isMember) expBonus += 0.15;
    if (playerClass === 'lumberjack') expBonus += 0.10;
    if (playerClass === 'forsaken') expBonus -= 0.50;
  
    if (t1Bonus) expBonus += 0.15;
    if (t2Bonus) expBonus += 0.20;
    if (t3Bonus) expBonus += 0.30;
  
    switch (buff) {
      case 'lumberjack': expBonus += 0.10; break;
      case 'timberfall': expBonus += 0.20; break;
      case 'felling': expBonus += 0.35; break;
      case 'yggdrasil': expBonus += 0.45; break;
      case 'titanwood': expBonus += 0; break;
      case 'primeordial': expBonus += 1; break;
      default: break; 
    }
  
    return expBonus;
  };

  const calculateStrExpBonus = () => {
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
    const item = woodcuttingItems.find(i => i.name === selectedItem);
    if (item && (parseInt(currentLevel) >= item.minLevel || currentStrLevel)) {
      const currentLvl = parseInt(currentLevel) || 1;
      const targetLvl = parseInt(targetLevel) || currentLvl;
      const currentStrLvl = parseInt(currentStrLevel) || 1;
      const targetStrLvl = parseInt(targetStrLevel) || currentStrLvl;
      
      const currentLevelExp = parseInt(expData[currentLvl]);
      const nextLevelExp = parseInt(expData[currentLvl + 1]);
      const percentage = currentPercentage === '' ? 0 : parseFloat(currentPercentage);
      const currentExp = currentLevelExp + ((nextLevelExp - currentLevelExp) * percentage / 100);
      
      const currentStrLevelExp = parseInt(expData[currentStrLvl]);
      const nextStrLevelExp = parseInt(expData[currentStrLvl + 1]);
      const strPercentage = currentStrPercentage === '' ? 0 : parseFloat(currentStrPercentage);
      const currentStrExp = currentStrLevelExp + ((nextStrLevelExp - currentStrLevelExp) * strPercentage / 100);
      
      const targetExp = parseInt(expData[targetLvl]);
      const targetStrExp = parseInt(expData[targetStrLvl]);
      const expNeeded = targetExp - currentExp;
      const strExpNeeded = targetStrExp - currentStrExp;
      
      let baseItemExp = item.exp;
      let waitLength = item.wait_length;
      let baseStrExp = item.STRexp;
  
      const woodcuttingExpBonus = calculateWoodcuttingExpBonus();
      const strExpBonus = calculateStrExpBonus();
  
      const itemExp = Math.round(baseItemExp * woodcuttingExpBonus + 0.00000001);
      const strExp = Math.round(baseStrExp * strExpBonus + 0.00000001);
  
      const finalWaitLength = applyEfficiency(waitLength);
      const totalEfficiency = calculateEfficiency();
  
      const totalItems = Math.ceil(expNeeded / itemExp);
      const totalStrItems = Math.ceil(strExpNeeded / strExp);
      const totalSTRexp = totalItems * strExp;
      const totalTimeInSeconds = Math.round(totalItems * finalWaitLength);
      const totalStrTimeInSeconds = Math.round(totalStrItems * finalWaitLength);
      
      setResult({
        totalExp: Math.round(expNeeded),
        totalItems,
        totalSTRexp: Math.round(totalSTRexp),
        totalTimeInSeconds,
        totalStrExp: Math.round(strExpNeeded),
        totalStrItems,
        totalStrTimeInSeconds,
        selectedItem,
        isMember,
        playerClass,
        buff,
        tool,
        itemExp,
        strExp,
        waitLength: finalWaitLength.toFixed(1),
        strExpBonus: (strExpBonus - 1) * 100,
        woodcuttingExpBonus: (woodcuttingExpBonus - 1) * 100,
        totalEfficiency,
        showWoodcutting: currentLevel !== '' || targetLevel !== '',
        showStr: currentStrLevel !== '' || targetStrLevel !== ''
      });
      setActiveItem(selectedItem);
    } else {
      setResult({
        error: `You need to be at least level ${item.minLevel} to cut ${selectedItem}, or input STR levels.`
      });
    }
  }, [currentLevel, currentPercentage, targetLevel, currentStrLevel, currentStrPercentage, targetStrLevel, isMember, playerClass, buff, tool, t1Bonus, t2Bonus, t3Bonus, woodcuttingItems]);  


  useEffect(() => {
    if (activeItem) {
      handleCalculate(activeItem);
    }
  }, [isMember, playerClass, buff, tool, t1Bonus, t2Bonus, t3Bonus, activeItem, handleCalculate]);


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
    <div className="woodcutting-calculator">
      <h1>{skillData.woodcutting.name}</h1>
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
              value={currentStrLevel}
              onChange={handleInputChange(setCurrentStrLevel)}
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
                value={currentStrPercentage}
                onChange={handleInputChange(setCurrentStrPercentage)}
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
              value={targetStrLevel}
              onChange={handleInputChange(setTargetStrLevel)}
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
                <option value="shadowblade">Shadowblade</option>
                <option value="ranger">Ranger</option>
                <option value="forsaken">Forsaken</option>
                <option value="lumberjack">Lumberjack</option>
                <option value="miner">Miner</option>
                <option value="angler">Angler</option>
                <option value="chef">Chef</option>
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
                <option value="lumberjack">Lumberjack</option>
                <option value="timberfall">Timberfall</option>
                <option value="felling">Felling</option>
                <option value="yggdrasil">Yggdrasil</option>
                <option value="titanwood">Titanwood</option>
                <option value="primeordial">Primeordial</option>
                <option value="herculean">Herculean</option>
                <option value="titan">Titan Power</option>
                <option value="ironclad">Ironclad</option>
                <option value="unyielding">Unyielding</option>
              </select>
            </div>
            <div className="tool-select">
              <label htmlFor="tool">Tool:</label>
              <select
                id="tool"
                value={tool}
                onChange={(e) => setTool(e.target.value)}
              >
                {tools.map((t, index) => (
                  <option key={index} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <h2>Woodcutting Item</h2>
        <div className="woodcutting-items">
          {woodcuttingItems.map((item, index) => (
            <button
              key={index}
              className={`woodcutting-item-button ${activeItem === item.name ? 'active' : ''} ${parseInt(currentLevel) < item.minLevel ? 'disabled' : ''}`}
              onClick={() => handleCalculate(item.name)}
              disabled={parseInt(currentLevel) < item.minLevel}
            >
              {item.name}
            </button>
          ))}
        </div>
        {result && !result.error && (
          <div className="result">
            {result.showWoodcutting && (
              <>
                <h3>Woodcutting Results:</h3>
                <p>Total exp needed: {result.totalExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <p>Total {result.selectedItem}: {result.totalItems.toLocaleString()}</p>
                <p>Total time needed: {formatTime(result.totalTimeInSeconds)}</p>
              </>
            )}
            {result.showStr && (
              <>
                <h3>Strength Results:</h3>
                <p>Total STR exp needed: {result.totalStrExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <p>Total {result.selectedItem} for STR: {result.totalStrItems.toLocaleString()}</p>
                <p>Total time needed for STR: {formatTime(result.totalStrTimeInSeconds)}</p>
              </>
            )}
            <p className="total-efficiency">Total Efficiency applied: +{result.totalEfficiency}%</p>
            <p className="exp-bonus">Total Woodcutting exp bonus applied: {result.woodcuttingExpBonus.toFixed(2)}%</p>
            <p className="exp-bonus">Total STR exp bonus applied: {result.strExpBonus.toFixed(2)}%</p>
            <p>XP per log: {result.itemExp}</p>
            <p>STR exp per log: {result.strExp}</p>
            <p>Wait time per log: {result.waitLength}s</p>
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

export default Woodcutting;