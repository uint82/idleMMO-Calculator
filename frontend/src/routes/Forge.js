import React, { useState, useEffect } from 'react';
import './Forge.css';
import skillData from '../data/Artisan_skill.json';
import expData from '../data/Exp.json';

const Forge = () => {
  const [currentLevel, setCurrentLevel] = useState('');
  const [currentPercentage, setCurrentPercentage] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [result, setResult] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [forgeItems, setForgeItems] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [playerClass, setPlayerClass] = useState('');
  const [buff, setBuff] = useState('');
  const [t1Bonus, setT1Bonus] = useState(false);
  const [t2Bonus, setT2Bonus] = useState(false);
  const [t3Bonus, setT3Bonus] = useState(false);

  useEffect(() => {
    setForgeItems(skillData.Forge.items);
  }, []);

  const applyClassBonuses = (baseExp, baseWaitLength, baseSTRExp) => {
    let exp = baseExp;
    let waitLength = baseWaitLength;
    let strExp = baseSTRExp;
    let classBonuses = [];

    switch (playerClass) {
      case 'blacksmith':
        exp = Math.round(exp * 1.10);
        waitLength = Math.round(waitLength * 0.9 * 100) / 100;
        classBonuses.push('+10% Forge exp', '+10% Forge wait length');
        break;
      case 'warrior':
        strExp = Math.round(strExp * 1.10);  // +10% STR exp
        classBonuses.push('+10% STR exp', '+5% Battle exp', '+5% Hunt exp');
        break;
      case 'forsaken':
        exp = Math.round(exp * 0.5);
        strExp = Math.round(strExp * 0.5);
        classBonuses.push('-50% skill XP', '-50% STR exp');
        break;
      default:
        break;
    }

    return { exp, waitLength, strExp, classBonuses };
  };

  const applyBuffBonuses = (baseExp, baseWaitLength) => {
    let exp = baseExp;
    let waitLength = baseWaitLength;
    let buffBonuses = [];

    if (t1Bonus) {
      exp = Math.round(exp * 1.15);
      buffBonuses.push('T1: +15% Forge exp');
    }
    if (t2Bonus) {
      exp = Math.round(exp * 1.20);
      buffBonuses.push('T2: +20% Forge exp');
    }
    if (t3Bonus) {
      exp = Math.round(exp * 1.30);
      buffBonuses.push('T3: +30% Forge exp');
    }  

    switch (buff) {
      case 'blacksmith':
        exp = Math.round(exp * 1.10);
        waitLength = Math.round(waitLength * 0.95 * 100) / 100;
        buffBonuses.push('+10% Forge exp', '+5% Efficiency');
        break;
      default:
        break;
    }

    return { exp, waitLength, buffBonuses };
  };

  const handleCalculate = (selectedItem) => {
    const item = forgeItems.find(i => i.name === selectedItem);
    if (item && parseInt(currentLevel) >= item.minLevel) {
      const currentLvl = parseInt(currentLevel);
      const targetLvl = parseInt(targetLevel);
      
      const currentLevelExp = parseInt(expData[currentLvl]);
      const nextLevelExp = parseInt(expData[currentLvl + 1]);
      const percentage = currentPercentage === '' ? 0 : parseFloat(currentPercentage);
      const currentExp = currentLevelExp + ((nextLevelExp - currentLevelExp) * percentage / 100);
      
      const targetExp = parseInt(expData[targetLvl]);
      const expNeeded = targetExp - currentExp;
      
      let itemExp = item.exp;
      let waitLength = item.wait_length;
      let strExp = item.STRexp;
  
      if (isMember) {
        itemExp *= 1.15;
        strExp *= 1.15;
        waitLength *= 0.9;
      }

      const { exp: classExp, waitLength: classWaitLength, strExp: classSTRExp, classBonuses } = applyClassBonuses(itemExp, waitLength, strExp);
      const { exp: buffExp, waitLength: buffWaitLength, buffBonuses } = applyBuffBonuses(classExp, classWaitLength);

      const totalItems = Math.ceil(expNeeded / buffExp);
      
      const totalSTRexp = totalItems * classSTRExp;
      const totalTimeInSeconds = Math.round(totalItems * buffWaitLength);
      
      const materials = Object.entries(item.Material).map(([name, quantity]) => ({
        name,
        quantity: parseInt(quantity) * totalItems
      }));

      setResult({
        totalExp: Math.round(expNeeded),
        totalItems,
        totalSTRexp: Math.round(totalSTRexp),
        totalTimeInSeconds,
        selectedItem,
        isMember,
        playerClass,
        buff,
        itemExp: Math.round(buffExp),
        waitLength: buffWaitLength.toFixed(2),
        strExp: Math.round(classSTRExp),
        classBonuses,
        buffBonuses,
        materials
      });
      setActiveItem(selectedItem);
    } else {
      setResult({
        error: `You need to be at least level ${item.minLevel} to forge ${selectedItem}.`
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
          <p>Total exp needed: {result.totalExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
          <p>Total {result.selectedItem}: {result.totalItems.toLocaleString()}</p>
          <p>Total STR exp gained: {result.totalSTRexp.toLocaleString()}</p>
          <p>Total time needed: {formatTime(result.totalTimeInSeconds)}</p>
          {result.isMember && (
            <p className="membership-bonus">Membership bonus applied: +15% XP, +10% Efficiency</p>
          )}
          {result.playerClass && (
            <p className="class-bonus">Class bonuses applied: {result.classBonuses.join(', ')}</p>
          )}
          {result.buffBonuses && result.buffBonuses.length > 0 && (
            <p className="buff-bonus">Buff bonuses applied: {result.buffBonuses.join(', ')}</p>
          )}
          <p>XP per item: {result.itemExp}</p>
          <p>STR exp per item: {result.strExp}</p>
          <p>Wait time per item: {result.waitLength}s</p>
          <h3>Materials needed:</h3>
          {result.materials.map((material, index) => (
            <p key={index}>{material.name}: {material.quantity.toLocaleString()}</p>
          ))}
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