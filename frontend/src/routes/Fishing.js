import React, { useState, useEffect } from 'react';
import './Fishing.css';
import skillData from '../data/Skill.json';
import expData from '../data/Exp.json';

const Fishing = () => {
  const [currentLevel, setCurrentLevel] = useState('');
  const [currentPercentage, setCurrentPercentage] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [currentDexLevel, setCurrentDexLevel] = useState('');
  const [currentDexPercentage, setCurrentDexPercentage] = useState('');
  const [targetDexLevel, setTargetDexLevel] = useState('');
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
    { name: 'Kraken\'s Grasp', reduction: 0.40 },
    { name: 'Aqua Reaper', reduction: 0.50 },
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
      case 'kracken': totalEfficiency += 120; break;
      case 'neptunes': totalEfficiency += 0; break;
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
      case 'kracken': expBonus += 0; break;
      case 'neptunes': expBonus += 1; break;
      default: break; 
    }
  
    return expBonus;
  };

  const calculateDexExpBonus = () => {
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


  const handleCalculate = (selectedItem) => {
    const item = fishingItems.find(i => i.name === selectedItem);
    if (item && (parseInt(currentLevel) >= item.minLevel || currentDexLevel)) {
      const currentLvl = parseInt(currentLevel) || 1;
      const targetLvl = parseInt(targetLevel) || currentLvl;
      const currentDexLvl = parseInt(currentDexLevel) || 1;
      const targetDexLvl = parseInt(targetDexLevel) || currentDexLvl;
      
      const currentLevelExp = parseInt(expData[currentLvl]);
      const nextLevelExp = parseInt(expData[currentLvl + 1]);
      const percentage = currentPercentage === '' ? 0 : parseFloat(currentPercentage);
      const currentExp = currentLevelExp + ((nextLevelExp - currentLevelExp) * percentage / 100);
      
      const currentDexLevelExp = parseInt(expData[currentDexLvl]);
      const nextDexLevelExp = parseInt(expData[currentDexLvl + 1]);
      const dexPercentage = currentDexPercentage === '' ? 0 : parseFloat(currentDexPercentage);
      const currentDexExp = currentDexLevelExp + ((nextDexLevelExp - currentDexLevelExp) * dexPercentage / 100);
      
      const targetExp = parseInt(expData[targetLvl]);
      const targetDexExp = parseInt(expData[targetDexLvl]);
      const expNeeded = targetExp - currentExp;
      const dexExpNeeded = targetDexExp - currentDexExp;
      
      let baseItemExp = item.exp;
      let waitLength = item.wait_length;
      let baseDexExp = item.DEXexp;

      const fishingExpBonus = calculateFishingExpBonus();
      const dexExpBonus = calculateDexExpBonus();

      const itemExp = Math.round(baseItemExp * fishingExpBonus + 0.00000001);
      const dexExp = Math.round(baseDexExp * dexExpBonus + 0.00000001);

      const finalWaitLength = applyEfficiency(waitLength);
      const totalEfficiency = calculateEfficiency();

      const totalItems = Math.ceil(expNeeded / itemExp);
      const totalDexItems = Math.ceil(dexExpNeeded / dexExp);
      const totalDEXexp = totalItems * dexExp;
      const totalGold = totalItems * item.Gold;
      const totalBait = totalItems;
      const baitType = Object.keys(item.Material)[0];
      const totalTimeInSeconds = Math.round(totalItems * finalWaitLength);
      const totalDexTimeInSeconds = Math.round(totalDexItems * finalWaitLength);
      
      setResult({
        totalExp: Math.round(expNeeded),
        totalItems,
        totalDEXexp: Math.round(totalDEXexp),
        totalGold,
        totalBait,
        baitType,
        totalTimeInSeconds,
        totalDexExp: Math.round(dexExpNeeded),
        totalDexItems,
        totalDexTimeInSeconds,
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
        totalEfficiency,
        showFishing: currentLevel !== '' || targetLevel !== '',
        showDex: currentDexLevel !== '' || targetDexLevel !== ''
      });
      setActiveItem(selectedItem);
    } else {
      setResult({
        error: `You need to be at least level ${item.minLevel} to fish ${selectedItem}, or input DEX levels.`
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
        <h1>Dexterity</h1>
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="current-dex-level">Current Lvl</label>
            <input
              id="current-dex-level"
              type="number"
              value={currentDexLevel}
              onChange={handleInputChange(setCurrentDexLevel)}
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
                value={currentDexPercentage}
                onChange={handleInputChange(setCurrentDexPercentage)}
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
              value={targetDexLevel}
              onChange={handleInputChange(setTargetDexLevel)}
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
                <option value="kracken">Kracken</option>
                <option value="neptunes">Neptunes</option>
                <option value="falcon">Falcon's Grace</option>
                <option value="precision">Precision</option>
                <option value="acrobatics">Acrobatic's</option>
                <option value="twinstrike">Twinstrike</option>
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
            {result.showFishing && (
              <>
                <h3>Fishing Results:</h3>
                <p>Total exp needed: {result.totalExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <p>Total {result.selectedItem}: {result.totalItems.toLocaleString()}</p>
                <p>Total Gold spent: {result.totalGold.toLocaleString()}</p>
                <p>Total {result.baitType} needed: {result.totalBait.toLocaleString()}</p>
                <p>Total time needed: {formatTime(result.totalTimeInSeconds)}</p>
              </>
            )}
            {result.showDex && (
              <>
                <h3>Dexterity Results:</h3>
                <p>Total DEX exp needed: {result.totalDexExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <p>Total {result.selectedItem} for DEX: {result.totalDexItems.toLocaleString()}</p>
                <p>Total time needed for DEX: {formatTime(result.totalDexTimeInSeconds)}</p>
              </>
            )}
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