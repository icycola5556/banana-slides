/**
 * layoutAdapter.ts 鍗曞厓娴嬭瘯
 * 娴嬭瘯鍔ㄦ€佸瓧浣撹绠楀拰甯冨眬閫傞厤鍔熻兘
 */
import { describe, it, expect } from 'vitest';
import {
  calculateAdaptiveFontSize,
  calculateAdaptiveTitleSize,
  estimateTextLength,
  estimateTotalLength,
  getStandardDimensions,
  getAvailableContentHeight,
  getAvailableContentWidth,
  DEFAULT_FONT_SIZES,
} from './layoutAdapter';

describe('layoutAdapter', () => {
  describe('calculateAdaptiveFontSize', () => {
    it('搴旇繑鍥炴甯稿瓧浣撳ぇ灏忓綋鍐呭杈冨皯鏃?, () => {
      const result = calculateAdaptiveFontSize(100, 500, 800);
      expect(result).toBe(DEFAULT_FONT_SIZES.normal);
    });

    it('搴旂缉灏忓瓧浣撳綋鍐呭杈冨鏃?, () => {
      const result = calculateAdaptiveFontSize(1000, 500, 800);
      expect(result).toBeLessThan(DEFAULT_FONT_SIZES.normal);
      expect(result).toBeGreaterThanOrEqual(DEFAULT_FONT_SIZES.min);
    });

    it('搴旈伒瀹堟渶灏忓瓧浣撻檺鍒?, () => {
      const result = calculateAdaptiveFontSize(10000, 500, 800);
      expect(result).toBe(DEFAULT_FONT_SIZES.min);
    });

    it('搴旈伒瀹堟渶澶у瓧浣撻檺鍒?, () => {
      const result = calculateAdaptiveFontSize(10, 500, 800, { max: 36 });
      expect(result).toBeLessThanOrEqual(36);
    });

    it('搴斾娇鐢ㄨ嚜瀹氫箟閰嶇疆', () => {
      const result = calculateAdaptiveFontSize(100, 500, 800, {
        min: 16,
        max: 32,
        normal: 20,
      });
      expect(result).toBe(20); // 鍐呭灏戯紝杩斿洖 normal
    });
  });

  describe('calculateAdaptiveTitleSize', () => {
    it('鐭爣棰樺簲杩斿洖鍩虹澶у皬 (44px)', () => {
      expect(calculateAdaptiveTitleSize(5)).toBe(44);
      expect(calculateAdaptiveTitleSize(10)).toBe(44);
    });

    it('涓瓑闀垮害鏍囬搴旈€傚綋缂╁皬', () => {
      expect(calculateAdaptiveTitleSize(15)).toBe(40); // <=20
      expect(calculateAdaptiveTitleSize(25)).toBe(36); // <=30
    });

    it('闀挎爣棰樺簲杩涗竴姝ョ缉灏?, () => {
      expect(calculateAdaptiveTitleSize(35)).toBe(32); // <=40
      expect(calculateAdaptiveTitleSize(50)).toBe(28); // >40
    });

    it('涓嶅簲浣庝簬鏈€灏忛檺鍒?(24px)', () => {
      expect(calculateAdaptiveTitleSize(100)).toBe(28);
    });
  });

  describe('estimateTextLength', () => {
    it('绌哄瓧绗︿覆搴旇繑鍥?', () => {
      expect(estimateTextLength('')).toBe(0);
    });

    it('涓枃瀛楃搴旇涓?.5', () => {
      expect(estimateTextLength('浣犲ソ')).toBe(3); // 2 * 1.5 = 3
    });

    it('鑻辨枃瀛楃搴旇涓?.5', () => {
      expect(estimateTextLength('Hello')).toBe(3); // 5 * 0.5 = 2.5 -> ceil = 3
    });

    it('娣峰悎鏂囨湰搴旀纭绠?, () => {
      // 'Hello涓栫晫' = 5*0.5 + 2*1.5 = 2.5 + 3 = 5.5 -> ceil = 6
      expect(estimateTextLength('Hello涓栫晫')).toBe(6);
    });
  });

  describe('estimateTotalLength', () => {
    it('绌烘暟缁勫簲杩斿洖0', () => {
      expect(estimateTotalLength([])).toBe(0);
    });

    it('搴旂疮鍔犲涓枃鏈殑闀垮害', () => {
      const texts = ['Hello', '涓栫晫'];
      // Hello = 3, 涓栫晫 = 3, 鎬昏 = 6
      expect(estimateTotalLength(texts)).toBe(6);
    });
  });

  describe('getStandardDimensions', () => {
    it('搴旇繑鍥為粯璁ゅ昂瀵稿綋鏃犱富棰樻椂', () => {
      const dims = getStandardDimensions();
      expect(dims.slideWidth).toBe(1280);
      expect(dims.slideHeight).toBe(720);
      expect(dims.padding).toBe(44);
    });

    it('搴斾娇鐢ㄤ富棰樹腑鐨勫昂瀵?, () => {
      const theme = {
        sizes: {
          slideWidth: 1920,
          slideHeight: 1080,
        },
      } as any;
      const dims = getStandardDimensions(theme);
      expect(dims.slideWidth).toBe(1920);
      expect(dims.slideHeight).toBe(1080);
    });
  });

  describe('getAvailableContentHeight', () => {
    it('搴旀纭绠楀彲鐢ㄩ珮搴?, () => {
      const dims = {
        slideHeight: 720,
        headerHeight: 120,
        footerHeight: 40,
        padding: 44,
        slideWidth: 1280,
      };
      // 720 - 120 - 40 - 44*2 = 720 - 120 - 40 - 88 = 472
      expect(getAvailableContentHeight(dims)).toBe(472);
    });
  });

  describe('getAvailableContentWidth', () => {
    it('搴旀纭绠楀彲鐢ㄥ搴?, () => {
      const dims = {
        slideWidth: 1280,
        padding: 44,
        slideHeight: 720,
        headerHeight: 120,
        footerHeight: 40,
      };
      // 1280 - 44*2 = 1280 - 88 = 1192
      expect(getAvailableContentWidth(dims)).toBe(1192);
    });
  });
});
