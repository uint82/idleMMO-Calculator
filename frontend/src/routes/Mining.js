import React, { useState, useEffect, useCallback } from 'react';
import './Mining.css';
import skillData from '../data/Skill.json';
import expData from '../data/Exp.json';

const Mining = () => {
  const [currentLevel, setCurrentLevel] = useState('');
  const [currentPercentage, setCurrentPercentage] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [currentStrLevel, setCurrentStrLevel] = useState('');
  const [currentStrPercentage, setCurrentStrPercentage] = useState('');
  const [targetStrLevel, setTargetStrLevel] = useState('');
  const [currentDefLevel, setCurrentDefLevel] = useState('');
  const [currentDefPercentage, setCurrentDefPercentage] = useState('');
  const [targetDefLevel, setTargetDefLevel] = useState('');
  const [result, setResult] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [miningItems, setMiningItems] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [playerClass, setPlayerClass] = useState('');
  const [buff, setBuff] = useState('');
  const [tool, setTool] = useState('');
  const [t1Bonus, setT1Bonus] = useState(false);
  const [t2Bonus, setT2Bonus] = useState(false);
  const [t3Bonus, setT3Bonus] = useState(false);

  const tools = [
    { name: 'Simple Pickaxe', reduction: 0 },
    { name: 'Improved Pickaxe', reduction: 0.05 },
    { name: 'Veinseeker', reduction: 0.10 },
    { name: 'Ironbite', reduction: 0.15 },
    { name: 'Boulder Breaker', reduction: 0.20 },
    { name: 'Earthshaker', reduction: 0.25 },
    { name: 'Stone Splinter', reduction: 0.30 },
    { name: 'Corestrike', reduction: 0.35 },
    { name: 'Boulder\'s Bane', reduction: 0.40 },
    { name: 'Earth Desttroyer', reduction: 0.50 },
  ];

  useEffect(() => {
    setMiningItems(skillData.Mining.items);
  }, []);

  const calculateEfficiency = () => {
    let totalEfficiency = 0;

    if (isMember) totalEfficiency += 10;
    if (playerClass === 'miner') totalEfficiency += 10;

    switch (buff) {
      case 'Miner': totalEfficiency += 5; break;
      case 'Rocksplitter': totalEfficiency += 10; break;
      case 'Oreseeker': totalEfficiency += 25; break;
      case 'Earthcore': totalEfficiency += 35; break;
      case 'Magma': totalEfficiency += 120; break;
      case 'Titans': totalEfficiency += 0; break;
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

  const calculateMiningExpBonus = () => {
    let expBonus = 1;
  
    if (isMember) expBonus += 0.15;
    if (playerClass === 'miner') expBonus += 0.10;
    if (playerClass === 'forsaken') expBonus -= 0.50;
  
    if (t1Bonus) expBonus += 0.15;
    if (t2Bonus) expBonus += 0.20;
    if (t3Bonus) expBonus += 0.30;
  
    switch (buff) {
      case 'Miner': expBonus += 0.10; break;
      case 'Rocksplitter': expBonus += 0.20; break;
      case 'Oreseeker': expBonus += 0.35; break;
      case 'Earthcore': expBonus += 0.45; break;
      case 'Magma': expBonus += 0; break;
      case 'Titans': expBonus += 1; break;
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

  const calculateDefExpBonus = () => {
    let expBonus = 1;
  
    if (isMember) expBonus += 0.15;
    if (playerClass === 'forsaken') expBonus -= 0.50;
  
    if (t1Bonus) expBonus += 0.15;
    if (t2Bonus) expBonus += 0.20;
    if (t3Bonus) expBonus += 0.30;

    switch (buff) {
      case 'bastion': expBonus += 0.10; break;
      case 'fortified': expBonus += 0.20; break;
      case 'impenetrable': expBonus += 0.30; break;
      case 'stone': expBonus += 0.40; break;
      default: break; 
    }
  
    return expBonus;
  };

  const handleCalculate = useCallback((selectedItem) => {
    const item = miningItems.find(i => i.name === selectedItem);
    if (item && (parseInt(currentLevel) >= item.minLevel || currentStrLevel || currentDefLevel)) {
      const currentLvl = parseInt(currentLevel) || 1;
      const targetLvl = parseInt(targetLevel) || currentLvl;
      const currentStrLvl = parseInt(currentStrLevel) || 1;
      const targetStrLvl = parseInt(targetStrLevel) || currentStrLvl;
      const currentDefLvl = parseInt(currentDefLevel) || 1;
      const targetDefLvl = parseInt(targetDefLevel) || currentDefLvl;
      
      const currentLevelExp = parseInt(expData[currentLvl]);
      const nextLevelExp = parseInt(expData[currentLvl + 1]);
      const percentage = currentPercentage === '' ? 0 : parseFloat(currentPercentage);
      const currentExp = currentLevelExp + ((nextLevelExp - currentLevelExp) * percentage / 100);
      
      const currentStrLevelExp = parseInt(expData[currentStrLvl]);
      const nextStrLevelExp = parseInt(expData[currentStrLvl + 1]);
      const strPercentage = currentStrPercentage === '' ? 0 : parseFloat(currentStrPercentage);
      const currentStrExp = currentStrLevelExp + ((nextStrLevelExp - currentStrLevelExp) * strPercentage / 100);
      
      const currentDefLevelExp = parseInt(expData[currentDefLvl]);
      const nextDefLevelExp = parseInt(expData[currentDefLvl + 1]);
      const defPercentage = currentDefPercentage === '' ? 0 : parseFloat(currentDefPercentage);
      const currentDefExp = currentDefLevelExp + ((nextDefLevelExp - currentDefLevelExp) * defPercentage / 100);
      
      const targetExp = parseInt(expData[targetLvl]);
      const targetStrExp = parseInt(expData[targetStrLvl]);
      const targetDefExp = parseInt(expData[targetDefLvl]);
      const expNeeded = targetExp - currentExp;
      const strExpNeeded = targetStrExp - currentStrExp;
      const defExpNeeded = targetDefExp - currentDefExp;
      
      let baseItemExp = item.exp;
      let waitLength = item.wait_length;
      let baseStrExp = item.STRexp;
      let baseDefExp = item.DEFexp;
  
      const miningExpBonus = calculateMiningExpBonus();
      const strExpBonus = calculateStrExpBonus();
      const defExpBonus = calculateDefExpBonus();
  
      const itemExp = Math.round(baseItemExp * miningExpBonus + 0.00000001);
      const strExp = Math.round(baseStrExp * strExpBonus + 0.00000001);
      const defExp = Math.round(baseDefExp * defExpBonus + 0.00000001);
  
      const finalWaitLength = applyEfficiency(waitLength);
      const totalEfficiency = calculateEfficiency();
  
      const totalItems = Math.ceil(expNeeded / itemExp);
      const totalStrItems = Math.ceil(strExpNeeded / strExp);
      const totalDefItems = Math.ceil(defExpNeeded / defExp);
      const totalSTRexp = totalItems * strExp;
      const totalDEFexp = totalItems * defExp;
      const totalTimeInSeconds = Math.round(totalItems * finalWaitLength);
      const totalStrTimeInSeconds = Math.round(totalStrItems * finalWaitLength);
      const totalDefTimeInSeconds = Math.round(totalDefItems * finalWaitLength);
      
      setResult({
        totalExp: Math.round(expNeeded),
        totalItems,
        totalSTRexp: Math.round(totalSTRexp),
        totalDEFexp: Math.round(totalDEFexp),
        totalTimeInSeconds,
        totalStrExp: Math.round(strExpNeeded),
        totalStrItems,
        totalStrTimeInSeconds,
        totalDefExp: Math.round(defExpNeeded),
        totalDefItems,
        totalDefTimeInSeconds,
        selectedItem,
        isMember,
        playerClass,
        buff,
        tool,
        itemExp,
        strExp,
        defExp,
        waitLength: finalWaitLength.toFixed(1),
        strExpBonus: (strExpBonus - 1) * 100,
        defExpBonus: (defExpBonus - 1) * 100,
        miningExpBonus: (miningExpBonus - 1) * 100,
        totalEfficiency,
        showMining: currentLevel !== '' || targetLevel !== '',
        showStr: currentStrLevel !== '' || targetStrLevel !== '',
        showDef: currentDefLevel !== '' || targetDefLevel !== ''
      });
      setActiveItem(selectedItem);
    } else {
      setResult({
        error: `You need to be at least level ${item.minLevel} to mine ${selectedItem}, or input STR/DEF levels.`
      });
    }
  }, [currentLevel, currentPercentage, targetLevel, currentStrLevel, currentStrPercentage, targetStrLevel, currentDefLevel, currentDefPercentage, targetDefLevel, isMember, playerClass, buff, tool, t1Bonus, t2Bonus, t3Bonus, miningItems]);

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
    <div className="mining-calculator">
      <h1>{skillData.Mining.name}</h1>
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
        <h1>Defense</h1>
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="current-def-level">Current Lvl</label>
            <input
              id="current-def-level"
              type="number"
              value={currentDefLevel}
              onChange={handleInputChange(setCurrentDefLevel)}
              min="1"
              max="100"
            />
          </div>
          <div className="input-group percentage">
            <label htmlFor="current-def-percentage">Current %</label>
            <div className="percentage-input-wrapper">
              <input
                id="current-def-percentage"
                type="number"
                value={currentDefPercentage}
                onChange={handleInputChange(setCurrentDefPercentage)}
                min="0"
                max="99"
              />
              <span className="percentage-symbol">%</span>
            </div>
          </div>
          <div className="arrow">→</div>
          <div className="input-group">
            <label htmlFor="target-def-level">Target lvl</label>
            <input
              id="target-def-level"
              type="number"
              value={targetDefLevel}
              onChange={handleInputChange(setTargetDefLevel)}
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
                <option value="Miner">Miner</option>
                <option value="Rocksplitter">Rocksplitter</option>
                <option value="Oreseeker">Oreseeker</option>
                <option value="Earthcore">Earthcore</option>
                <option value="Magma">Magma</option>
                <option value="Titans">Titan's</option>
                <option value="herculean">Herculean</option>
                <option value="titan">Titan Power</option>
                <option value="ironclad">Ironclad</option>
                <option value="unyielding">Unyielding</option>
                <option value="bastion">Bastion</option>
                <option value="fortified">Fortified</option>
                <option value="impenetrable">Impenetrable</option>
                <option value="stone">Stone Heart</option>
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
        <h2>Mining Item</h2>
        <div className="mining-items">
          {miningItems.map((item, index) => (
            <button
              key={index}
              className={`mining-item-button ${activeItem === item.name ? 'active' : ''} ${parseInt(currentLevel) < item.minLevel ? 'disabled' : ''}`}
              onClick={() => handleCalculate(item.name)}
              disabled={parseInt(currentLevel) < item.minLevel}
            >
              {item.name}
            </button>
          ))}
        </div>
        {result && !result.error && (
          <div className="result">
            {result.showMining && (
              <>
                <h3>Mining Results:</h3>
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
            {result.showDef && (
              <>
                <h3>Defense Results:</h3>
                <p>Total DEF exp needed: {result.totalDefExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <p>Total {result.selectedItem} for DEF: {result.totalDefItems.toLocaleString()}</p>
                <p>Total time needed for DEF: {formatTime(result.totalDefTimeInSeconds)}</p>
              </>
            )}
            <p className="total-efficiency">Total Efficiency applied: +{result.totalEfficiency}%</p>
            <p className="exp-bonus">Total Mining exp bonus applied: {result.miningExpBonus.toFixed(2)}%</p>
            <p className="exp-bonus">Total STR exp bonus applied: {result.strExpBonus.toFixed(2)}%</p>
            <p className="exp-bonus">Total DEF exp bonus applied: {result.defExpBonus.toFixed(2)}%</p>
            <p>XP per ore: {result.itemExp}</p>
            <p>STR exp per ore: {result.strExp}</p>
            <p>DEF exp per ore: {result.defExp}</p>
            <p>Wait time per ore: {result.waitLength}s</p>
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

export default Mining;