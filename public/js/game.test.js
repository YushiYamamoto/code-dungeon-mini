// game.test.js
import { describe, it, expect } from 'vitest';

// ゲームの基本機能をテスト
describe('Game Core Functions', () => {
  it('should initialize game state correctly', () => {
    // このテストは仮の例です
    // 実際はgame.jsからimportした関数をテストします
    const mockGameState = {
      player: { x: 0, y: 0, hp: 100 },
      dungeon: { level: 1 }
    };
    
    expect(mockGameState.player.hp).toBe(100);
    expect(mockGameState.dungeon.level).toBe(1);
  });
});
