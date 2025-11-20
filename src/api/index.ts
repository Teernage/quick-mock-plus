import service, { handleResponse } from '@/http/index'

/**
 * 从指定的API获取数据
 *
 * @returns Promise<any> 返回获取到的信息
 */
export async function getApiData() {
  const ONION_API_URL = '/api/v1/team_info'
  return handleResponse(service.get(`${ONION_API_URL}/current_team`))
}
