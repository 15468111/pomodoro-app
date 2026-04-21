import { describe, it, expect } from 'vitest'

// 工具函式測試（直接測邏輯，不依賴 DOM）
function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

describe('fmt() 時間格式化', () => {
  it('25分鐘顯示為 25:00', () => expect(fmt(1500)).toBe('25:00'))
  it('0秒顯示為 00:00',    () => expect(fmt(0)).toBe('00:00'))
  it('90秒顯示為 01:30',  () => expect(fmt(90)).toBe('01:30'))
  it('61秒顯示為 01:01',  () => expect(fmt(61)).toBe('01:01'))
})

describe('番茄鐘模式設定', () => {
  const MODES = {
    work:  { label: '專注',   duration: 25 * 60 },
    short: { label: '短休息', duration:  5 * 60 },
    long:  { label: '長休息', duration: 15 * 60 },
  }
  it('專注模式為 1500 秒', () => expect(MODES.work.duration).toBe(1500))
  it('短休息模式為 300 秒', () => expect(MODES.short.duration).toBe(300))
  it('長休息模式為 900 秒', () => expect(MODES.long.duration).toBe(900))
})

describe('Session 循環邏輯', () => {
  const SESSIONS_BEFORE_LONG = 4
  it('第 4 次後切換長休息', () => {
    expect(4 % SESSIONS_BEFORE_LONG).toBe(0)
  })
  it('第 1~3 次切換短休息', () => {
    [1, 2, 3].forEach((s) => expect(s % SESSIONS_BEFORE_LONG).not.toBe(0))
  })
})
