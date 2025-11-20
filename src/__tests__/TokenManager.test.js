import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import TokenManager from '@/util/tokenManager'
import { getOnionToken } from '@/api/user'
import { handleExchangeTokens } from '@/api/token'

// 模拟外部依赖
vi.mock('@/api/user')
vi.mock('@/api/token')

describe('TokenManager', () => {
  let tokenManager
  const mockTokenData = {
    access_token: 'mock_access_token',
    expires_in: 3600,
    expires_at: Date.now() + 3600 * 1000
  }

  // 在每个测试前重置状态
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    tokenManager = TokenManager
  })

  // 在每个测试后恢复真实的计时器
  afterEach(() => {
    vi.useRealTimers()
  })

  // 测试单例模式
  it('getInstance should return the same instance', () => {
    const instance1 = TokenManager
    const instance2 = TokenManager
    expect(instance1).toBe(instance2)
  })

  // 测试令牌的保存和检索
  it('should save and retrieve token from storage', async () => {
    tokenManager.saveTokenToStorage(mockTokenData)
    const retrievedToken = tokenManager.getTokenFromStorage()
    expect(retrievedToken).toEqual(mockTokenData)
  })

  // 测试清除存储中的令牌
  it('should clear token from storage', () => {
    tokenManager.saveTokenToStorage(mockTokenData)
    tokenManager.clearTokenFromStorage()
    const retrievedToken = tokenManager.getTokenFromStorage()
    expect(retrievedToken).toBeNull()
  })

  // 测试令牌即将过期时的刷新逻辑
  it('should refresh tokens when token is expiring soon', async () => {
    vi.useFakeTimers()
    const expiredTokenData = { ...mockTokenData, expires_at: Date.now() - 1000 }
    tokenManager.saveTokenToStorage(expiredTokenData)

    // 模拟获取新令牌的过程
    getOnionToken.mockResolvedValue('mock_onion_token')
    handleExchangeTokens.mockResolvedValue({
      access_token: 'new_access_token',
      expires_in: 3600
    })

    await tokenManager.getValidToken()

    // 验证刷新过程
    expect(getOnionToken).toHaveBeenCalled()
    expect(handleExchangeTokens).toHaveBeenCalledWith({
      code: 'mock_onion_token',
      scope: 'console'
    })

    const newTokenData = tokenManager.getTokenFromStorage()
    expect(newTokenData.access_token).toBe('new_access_token')
  })

  // 测试令牌未过期时直接返回有效令牌
  it('should return valid token without refreshing if not expiring soon', async () => {
    const validTokenData = { ...mockTokenData, expires_at: Date.now() + 3600 * 1000 }
    tokenManager.saveTokenToStorage(validTokenData)

    const token = await tokenManager.getValidToken()

    expect(token).toBe('mock_access_token')
    expect(getOnionToken).not.toHaveBeenCalled()
    expect(handleExchangeTokens).not.toHaveBeenCalled()
  })

  // 测试获取令牌失败时的错误处理
  it('should throw error if failed to get valid token', async () => {
    getOnionToken.mockRejectedValue(new Error('Failed to get onion token'))
    await expect(tokenManager.getValidToken()).rejects.toThrow('Failed to get valid token')
  })

  // 测试并发刷新令牌时只执行一次刷新过程
  it('should not initiate multiple refresh processes simultaneously', async () => {
    vi.useFakeTimers()
    const expiredTokenData = { ...mockTokenData, expires_at: Date.now() - 1000 }
    tokenManager.saveTokenToStorage(expiredTokenData)

    getOnionToken.mockResolvedValue('mock_onion_token')
    handleExchangeTokens.mockResolvedValue({
      access_token: 'new_access_token',
      expires_in: 3600
    })

    // 模拟多个并发的令牌请求
    const refreshPromises = [tokenManager.getValidToken(), tokenManager.getValidToken(), tokenManager.getValidToken()]

    await Promise.all(refreshPromises)

    // 验证刷新过程只执行一次
    expect(getOnionToken).toHaveBeenCalledTimes(1)
    expect(handleExchangeTokens).toHaveBeenCalledTimes(1)
  })
})
