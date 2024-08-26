import React, { useState, useEffect } from 'react';
import './Combat.css';
import monsterData from '../data/Monster_data.json';
import dungeonData from '../data/Dungeon_data.json';
import bossData from '../data/Boss_data.json';
import expData from '../data/Exp.json';

const Combat = () => {
  const [currentLevel, setCurrentLevel] = useState('');
  const [currentPercentage, setCurrentPercentage] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [result, setResult] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [combatItems, setCombatItems] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [playerClass, setPlayerClass] = useState('');
  const [buff, setBuff] = useState('');
  const [t1Bonus, setT1Bonus] = useState(false);
  const [t2Bonus, setT2Bonus] = useState(false);
  const [t3Bonus, setT3Bonus] = useState(false);
  const [combatType, setCombatType] = useState('monsters');
  const [monsters, setMonsters] = useState([]);
  const [dungeons, setDungeons] = useState([]);
  const [combatBuff, setCombatBuff] = useState('');
  const [dungeonBuff, setDungeonBuff] = useState('');
  const [bosses, setBosses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    setCombatItems([
        ...monsterData.monsters, 
        ...dungeonData.dungeons, 
        ...bossData.bosses
    ]);

    const allLocations = [
      ...new Set([
        ...monsterData.monsters.map(m => m.location),
        ...dungeonData.dungeons.map(d => d.location),
        ...bossData.bosses.map(b => b.location)
      ])
    ].map(locationName => {
      const locationData = monsterData.locations.find(l => l.name === locationName);
      return { name: locationName, level: locationData ? locationData.level : 1 };
    }).sort((a, b) => a.level - b.level);

    setLocations(allLocations);
  }, []);


  useEffect(() => {
    setMonsters(monsterData.monsters);
    setDungeons(dungeonData.dungeons);
    setBosses(bossData.bosses);
  }, []);


  const getCombatItems = () => {
    switch(combatType) {
      case 'monsters':
        return monsters;
      case 'dungeons':
        return dungeons;
      case 'bosses':
        return bosses;
      default:
        return [];
    }
  };

  const getCombatTypeHeading = () => {
    switch(combatType) {
      case 'monsters':
        return 'Monsters';
      case 'dungeons':
        return 'Dungeons';
      case 'bosses':
        return 'Bosses';
      default:
        return 'Mobs';
    }
  };
  
  

  const getActionTerm = () => {
    switch(combatType) {
      case 'dungeons':
        return 'run';
      case 'monsters':
      case 'bosses':
      default:
        return 'kill';
    }
  };
  
  

  const getCombatItemsByLocation = () => {
    let items;
    switch(combatType) {
      case 'monsters':
        items = monsters;
        break;
      case 'dungeons':
        items = dungeons;
        break;
      case 'bosses':
        items = bosses;
        break;
      default:
        items = [];
    }
    return items.filter(item => item.location === selectedLocation);
  };

  const calculateDungeonEfficiency = () => {
    let totalEfficiency = 0;
  
    switch (dungeonBuff) {
      case 'dungeon': totalEfficiency += 10; break;
      case 'tonic': totalEfficiency += 20; break;
      case 'wraith': totalEfficiency += 35; break;
    }
  
    return totalEfficiency;
  };

  const calculateCombatExpBonus = () => {
    if (combatType !== 'monsters') return 1;

    let expBonus = 1;

    switch (playerClass) {
      case 'warrior': expBonus += 0.05; break;
      case 'shadowblade': expBonus += 0.05; break;
      case 'ranger': expBonus += 0.05; break
      case 'forsaken': expBonus -= 0.5; break;
    }
  
    switch (combatBuff) {
      case 'battle': expBonus += 0.15; break;
      case 'vortex': expBonus += 0.20; break;
      case 'strike': expBonus += 0.25; break;
      case 'dragonblood': expBonus += 0.30; break;
    }
  
    return expBonus;
  };

  const calculateDungeonExpBonus = () => {
    let expBonus = 1;

    if (playerClass === 'forsaken') {
      expBonus -= 0.5;
    }

    switch (dungeonBuff) {
      case 'dungeon': expBonus += 0.15; break;
      case 'tonic': expBonus += 0.25; break;
      case 'wraith': expBonus += 0.40; break;
    }

    return expBonus;
  };

  const handleCalculate = (selectedItem) => {
    const item = combatItems.find(i => i.name === selectedItem);
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
      let waitLength = combatType === 'dungeons' ? item.wait_length : (combatType === 'bosses' ? item.wait_length : 0);
      let battleLength = combatType === 'bosses' ? (item.battle_length || 0) : 0;

      if (combatType === 'dungeons') {
        const dungeonEfficiency = calculateDungeonEfficiency();
        waitLength = Math.round((waitLength * 100 / (100 + dungeonEfficiency)));
      }

      const combatExpBonus = calculateCombatExpBonus();

      let itemExp;
      if (combatType === 'monsters') {
        const combatExpBonus = calculateCombatExpBonus();
        itemExp = Math.round(baseItemExp * combatExpBonus + 0.00001 );
      } else if (combatType === 'dungeons') {
        const dungeonExpBonus = calculateDungeonExpBonus();
        itemExp = Math.round(baseItemExp * dungeonExpBonus);
      } else {
        itemExp = baseItemExp;
      }

      const totalItems = Math.ceil(expNeeded / itemExp);
      const totalTimeInSeconds = Math.round(totalItems * (waitLength + battleLength));
      
      let totalCost = 0;
      let costPerRun = 0;
      if (combatType === 'dungeons') {
        costPerRun = item.cost;
        totalCost = totalItems * costPerRun;
      }

      let drops = [];
      if (combatType === 'monsters') {
        const monster = monsters.find(m => m.name === selectedItem);
        drops = Array.isArray(monster.drop) ? monster.drop : [monster.drop];
      } else if (combatType === 'bosses') {
        const boss = bosses.find(b => b.name === selectedItem);
        drops = boss.drop;
      }

      setResult({
        totalExp: Math.round(expNeeded),
        totalItems,
        totalTimeInSeconds,
        selectedItem,
        isMember,
        playerClass,
        buff,
        itemExp,
        waitLength: waitLength.toFixed(1),
        dungeonEfficiency: combatType === 'dungeons' ? calculateDungeonEfficiency() : 0,
        battleLength: battleLength,
        combatExpBonus: combatType === 'monsters' ? (combatExpBonus - 1) * 100 : 0,
        dungeonExpBonus: combatType === 'dungeons' ? (calculateDungeonExpBonus() - 1) * 100 : 0,
        totalCost,
        costPerRun,
        drops: drops
      });
      setActiveItem(selectedItem);
    } else {
      setResult({
        error: `You need to be at least level ${item.minLevel} to fight ${selectedItem}.`
      });
    }
  };

  useEffect(() => {
    if (activeItem) {
      handleCalculate(activeItem);
    }
  }, [isMember, playerClass, buff, t1Bonus, t2Bonus, t3Bonus, currentLevel, targetLevel, currentPercentage, dungeonBuff, combatBuff]);

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
    <div className="combat-calculator">
      <h1>Combat</h1>
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
              </select>
            </div>
            <div className="buff-select">
              <label htmlFor="buff">Potion:</label>
              <select
                id="buff"
                value={combatType === 'bosses' ? '' : (combatType === 'dungeons' ? dungeonBuff : combatBuff)}
                onChange={(e) => {
                  if (combatType === 'dungeons') {
                    setDungeonBuff(e.target.value);
                  } else if (combatType === 'monsters') {
                    setCombatBuff(e.target.value);
                  }
                }}
                disabled={combatType === 'bosses'}
              >
                <option value="">No Buff</option>
                {combatType === 'dungeons' && (
                  <>
                    <option value="dungeon">Dungeon Potion</option>
                    <option value="tonic">Dungeon Master's Tonic</option>
                    <option value="wraith">Wraithbane Essence</option>
                  </>
                )}
                {combatType === 'monsters' && (
                  <>
                    <option value="battle">Battle Potion</option>
                    <option value="vortex">Vortex Brew</option>
                    <option value="strike">Strike Essence</option>
                    <option value="dragonblood">Dragonblood Tonic</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
        <h2>Combat Type</h2>
        <div className="combat-type-buttons">
          <button
            className={`combat-type-button ${combatType === 'monsters' ? 'active' : ''}`}
            onClick={() => setCombatType('monsters')}
          >
            Monsters
          </button>
          <button
            className={`combat-type-button ${combatType === 'dungeons' ? 'active' : ''}`}
            onClick={() => setCombatType('dungeons')}
          >
            Dungeons
          </button>
          <button
            className={`combat-type-button ${combatType === 'bosses' ? 'active' : ''}`}
            onClick={() => setCombatType('bosses')}
          >
            Bosses
          </button>
        </div>

        <h2>Location</h2>
        <div className="location-buttons">
          {locations.map((location) => (
            <button
              key={location.name}
              className={`location-button ${selectedLocation === location.name ? 'active' : ''}`}
              onClick={() => setSelectedLocation(location.name)}
            >
              {location.name} (Lvl {location.level})
            </button>
          ))}
        </div>

        <h2>{getCombatTypeHeading()}</h2>
        <div className="combat-items">
          {getCombatItemsByLocation().map((item, index) => (
            <button
              key={index}
              className={`combat-item-button ${activeItem === item.name ? 'active' : ''} ${parseInt(currentLevel) < item.minLevel ? 'disabled' : ''}`}
              onClick={() => handleCalculate(item.name)}
              disabled={parseInt(currentLevel) < item.minLevel}
            >
              {item.name} (Lvl {item.minLevel})
              </button>
            ))}
        </div>
        {result && !result.error && (
        <div className="result">
          <p>Total exp needed: {result.totalExp.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
          <p>Total {result.selectedItem} to {getActionTerm()}: {result.totalItems.toLocaleString()}</p>
          {combatType !== 'monsters' && (
            <>
              <p>Total time needed: {formatTime(result.totalTimeInSeconds)}</p>
              <p>Wait time per {getActionTerm()}: {formatTime(parseFloat(result.waitLength))}</p>
            </>
          )}
          {combatType == 'bosses' && (
            <>
              <p>Battle time per {getActionTerm()}: {formatTime(result.battleLength)}</p>
            </>
          )}
          {(combatType === 'monsters' || combatType === 'dungeons') && (
          <p className="exp-bonus">
            Total {combatType === 'monsters' ? 'Combat' : 'Dungeons'} exp bonus applied: 
            {combatType === 'monsters' ? result.combatExpBonus.toFixed(2) : result.dungeonExpBonus.toFixed(2)}%
          </p>
          )}
          {combatType === 'dungeons' && (
            <p className="total-efficiency">Total Dungeon Efficiency: {result.dungeonEfficiency}%</p>
          )}
          <p>XP per {getActionTerm()}: {result.itemExp.toLocaleString()}</p>
          {combatType === 'dungeons' && (
            <>
              <p>Cost per run: {result.costPerRun.toLocaleString()} gold</p>
              <p>Total cost: {result.totalCost.toLocaleString()} gold</p>
            </>
          )}
           {result.drops && result.drops.length > 0 && (
            <div className="drops-info">
              <h3>Possible Drops:</h3>
              <ul>
                {result.drops.map((drop, index) => (
                  <li key={index}>{drop}</li>
                ))}
              </ul>
            </div>
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

export default Combat;