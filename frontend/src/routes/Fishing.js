import React, { useState, useEffect } from 'react';
import './Fishing.css';
import skillData from '../data/Skill.json';
import expData from '../data/Exp.json';

const Fishing = () => {
  const [currentLevel, setCurrentLevel] = useState('');
  const [currentPercentage, setCurrentPercentage] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [result, setResult] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [fishingItems, setFishingItems] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [playerClass, setPlayerClass] = useState('');
  const [buff, setBuff] = useState('');
  const [tool, setTool] = useState('');
  const [t1Bonus, setT1Bonus] = useState(false);
  const [t2Bonus, setT2Bonus] = useState(false);
  const [t3Bonus, setT3Bonus] = useState(false);

  const tools = [
    { name: 'Simple Fishing Rod', reduction: 0 },
    { name: 'Improved Fishing Rod', reduction: 0.05 },
    { name: 'River Tamer', reduction: 0.10 },
    { name: 'Seasong\'s Lure', reduction: 0.15 },
    { name: 'Mooonshimmer Hook', reduction: 0.20 },
    { name: 'Hydra\'s Coil', reduction: 0.25 },
    { name: 'Ocean\'s Whister', reduction: 0.30 },
    { name: 'Rune-etched Reeler', reduction: 0.35 },
  ];

  useEffect(() => {
    setFishingItems(skillData.Fishing.items);
  }, []);

  const calculateEfficiency = () => {
    let totalEfficiency = 0;

    if (isMember) totalEfficiency += 10;
    if (playerClass === 'angler') totalEfficiency += 10;

    switch (buff) {
      case 'angler': totalEfficiency += 5; break;
      case 'deepwater': totalEfficiency += 10; break;
      case 'abyssal': totalEfficiency += 25; break;
      case 'poseidon': totalEfficiency += 35; break;
    }

    const selectedTool = tools.find(t => t.name === tool);
    if (selectedTool) totalEfficiency += selectedTool.reduction * 100;

    return totalEfficiency;
  };

  const applyEfficiency = (baseWaitLength) => {
    const efficiency = calculateEfficiency();
    return baseWaitLength * (100 / (100 + efficiency));
  };

  const calculateExpBonus = () => {
    let expBonus = 1;

    if (isMember) expBonus += 0.15;
    if (playerClass === 'angler') expBonus += 0.10;

    if (t1Bonus) expBonus += 0.15;
    if (t2Bonus) expBonus += 0.20;
    if (t3Bonus) expBonus += 0.30;

    switch (buff) {
      case 'angler': expBonus += 0.10; break;
      case 'deepwater': expBonus += 0.20; break;
      case 'abyssal': expBonus += 0.35; break;
      case 'poseidon': expBonus += 0.45; break;
    }

    return expBonus;
  };

  const calculateFishingExpBonus = () => {
    let expBonus = 1;
  
    if (isMember) expBonus += 0.15;
    if (playerClass === 'angler') expBonus += 0.10;
    if (playerClass === 'forsaken') expBonus -= 0.50;
  
    if (t1Bonus) expBonus += 0.15;
    if (t2Bonus) expBonus += 0.20;
    if (t3Bonus) expBonus += 0.30;
  
    switch (buff) {
      case 'angler': expBonus += 0.10; break;
      case 'deepwater': expBonus += 0.20; break;
      case 'abyssal': expBonus += 0.35; break;
      case 'poseidon': expBonus += 0.45; break;
    }
  
    return expBonus;
  };

  const calculateDexExpBonus = () => {
    let expBonus = 1;
  
    if (isMember) expBonus += 0.15;
    if (playerClass === 'forsaken') expBonus -= 0.50;
  
    if (t1Bonus) expBonus += 0.15;
    if (t2Bonus) expBonus += 0.20;
    if (t3Bonus) expBonus += 0.30;
  
    return expBonus;
  };

  const applyClassBonuses = (baseExp, baseWaitLength, baseDexExp) => {
    let exp = baseExp;
    let waitLength = baseWaitLength;
    let dexExp = baseDexExp;
    let classBonuses = [];

    switch (playerClass) {
      case 'warrior':
        classBonuses.push('+10% STR exp', '+5% Battle exp', '+5% Hunt exp');
        break;
      case 'shadowblade':
        classBonuses.push('+5% SPD exp', '+10% Hunt Efficiency', '+5% Battle exp');
        break;
      case 'ranger':
        dexExp = Math.round(dexExp * 1.07);
        classBonuses.push('+7% DEX exp', '+8% Hunt Efficiency', '+5% Battle exp');
        break;
      case 'forsaken':
        exp = Math.round(exp * 0.5);
        dexExp = Math.round(dexExp * 0.5);
        classBonuses.push('-50% skill XP', '-50% DEX exp');
        break;
      case 'angler':
        exp = Math.round(exp * 1.10);
        waitLength = Math.round(waitLength * 0.9 * 100) / 100;
        classBonuses.push('+10% Fishing exp', '+10% Fishing Efficiency');
        break;
      default:
        break;
    }

    return { exp, waitLength, dexExp, classBonuses };
  };

  const applyBuffBonuses = (baseExp, baseWaitLength) => {
    let exp = baseExp;
    let waitLength = baseWaitLength;
    let buffBonuses = [];

    if (t1Bonus) {
      exp = Math.round(exp * 1.15);
      buffBonuses.push('T1: +15% exp');
    }
    if (t2Bonus) {
      exp = Math.round(exp * 1.20);
      buffBonuses.push('T2: +20% exp');
    }
    if (t3Bonus) {
      exp = Math.round(exp * 1.30);
      buffBonuses.push('T3: +30% exp');
    }  

    switch (buff) {
      case 'angler':
        exp = Math.round(exp * 1.10);
        waitLength = Math.round(waitLength * 0.95 * 100) / 100;
        buffBonuses.push('+10% Fishing exp', '+5% Efficiency');
        break;
      case 'deepwater':
        exp = Math.round(exp * 1.20);
        waitLength = Math.round(waitLength * 0.90 * 100) / 100;
        buffBonuses.push('+20% Fishing exp', '+10% Efficiency');
        break;
      case 'abyssal':
        exp = Math.round(exp * 1.35);
        waitLength = Math.round(waitLength * 0.75 * 100) / 100;
        buffBonuses.push('+35% Fishing exp', '+25% Efficiency');
        break;
      case 'poseidon':
        exp = Math.round(exp * 1.45);
        waitLength = Math.round(waitLength * 0.65 * 100) / 100;
        buffBonuses.push('+45% Fishing exp', '+35% Efficiency');
        break;
    }

    return { exp, waitLength, buffBonuses };
  };

  const handleCalculate = (selectedItem) => {
    const item = fishingItems.find(i => i.name === selectedItem);
    if (item && parseInt(currentLevel) >= item.minLevel) {
      const currentLvl = parseInt(currentLevel);
      const targetLvl = parseInt(targetLevel);
      
      const currentLevelExp = parseInt(expData[currentLvl]);
      const nextLevelExp = parseInt(expData[currentLvl + 1]);
      const percentage = currentPercentage === '' ? 0 : parseFloat(currentPercentage);
      const currentExp = currentLevelExp + ((nextLevelExp - currentLevelExp) * percentage / 100);
      
      const targetExp = parseInt(expData[targetLvl]);
      const expNeeded = targetExp - currentExp;
      
      let baseItemExp = item.exp;
      let waitLength = item.wait_length;
      let baseDexExp = item.DEXexp;

      const fishingExpBonus = calculateFishingExpBonus();
      const dexExpBonus = calculateDexExpBonus();

      const itemExp = Math.round(baseItemExp * fishingExpBonus);
      const dexExp = Math.round(baseDexExp * dexExpBonus);

      const finalWaitLength = applyEfficiency(waitLength);
      const totalEfficiency = calculateEfficiency();

      const totalItems = Math.ceil(expNeeded / itemExp);
      const totalDEXexp = totalItems * dexExp;
      const totalGold = totalItems * item.Gold;
      const totalBait = totalItems;
      const baitType = Object.keys(item.Material)[0];
      const totalTimeInSeconds = Math.round(totalItems * finalWaitLength);
      
      setResult({
        totalExp: Math.round(expNeeded),
        totalItems,
        totalDEXexp: Math.round(totalDEXexp),
        totalGold,
        totalBait,
        baitType,
        totalTimeInSeconds,
        selectedItem,
        isMember,
        playerClass,
        buff,
        tool,
        itemExp,
        dexExp,
        waitLength: finalWaitLength.toFixed(1),
        dexExpBonus: (dexExpBonus - 1) * 100,
        fishingExpBonus: (fishingExpBonus - 1) * 100,
        totalEfficiency
      });
      setActiveItem(selectedItem);
    } else {
      setResult({
        error: `You need to be at least level ${item.minLevel} to fish ${selectedItem}.`
      });
    }
  };

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
    <div className="fishing-calculator">
      <h1>{skillData.Fishing.name}</h1>
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
                <option value="angler">Anglers</option>
                <option value="deepwater">Deepsea</option>
                <option value="abyssal">Merfolk</option>
                <option value="poseidon">Riverbend</option>
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
        <h2>Fishing Item</h2>
        <div className="fishing-items">
          {fishingItems.map((item, index) => (
            <button
              key={index}
              className={`fishing-item-button ${activeItem === item.name ? 'active' : ''} ${parseInt(currentLevel) < item.minLevel ? 'disabled' : ''}`}
              onClick={() => handleCalculate(item.name)}
              disabled={parseInt(currentLevel) < item.minLevel}
            >
              {item.name}
            </button>
          ))}
        </div>
        {result && !result.error && (
        <div className="result">
          <p>Total exp needed: {result.totalExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
          <p>Total {result.selectedItem}: {result.totalItems.toLocaleString()}</p>
          <p>Total DEX exp gained: {result.totalDEXexp.toLocaleString()}</p>
          <p>Total Gold spent: {result.totalGold.toLocaleString()}</p>
          <p>Total {result.baitType} needed: {result.totalBait.toLocaleString()}</p>
          <p>Total time needed: {formatTime(result.totalTimeInSeconds)}</p>
          <p className="total-efficiency">Total Efficiency applied: +{result.totalEfficiency}%</p>
          <p className="exp-bonus">Total Fishing exp bonus applied: {result.fishingExpBonus.toFixed(2)}%</p>
          <p className="exp-bonus">Total DEX exp bonus applied: {result.dexExpBonus.toFixed(2)}%</p>
          <p>XP per catch: {result.itemExp}</p>
          <p>DEX exp per catch: {result.dexExp}</p>
          <p>Wait time per catch: {result.waitLength}s</p>
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

export default Fishing;