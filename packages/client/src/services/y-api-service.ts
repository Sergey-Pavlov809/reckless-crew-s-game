import {
  RegistrationFromApi,
  UserFromApi,
  LoginFromApi,
  OAuthSingInData,
} from '../types/FormApi'

export const Y_API_BASE_URL = 'https://ya-praktikum.tech/api/v2'

const yApiService = {
  login(userData: LoginFromApi): Promise<Response> {
    return fetch(`${Y_API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    })
  },
  register(userData: RegistrationFromApi): Promise<{ id: string }> {
    return fetch(`${Y_API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    }).then(response => response.json())
  },
  getUser(): Promise<UserFromApi> {
    return fetch(`${Y_API_BASE_URL}/auth/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }).then(response => response.json())
  },
  getOAuthId(redirect_uri: string): Promise<{
    service_id: string
    data: unknown
  }> {
    return fetch(
      `${Y_API_BASE_URL}oauth/yandex/service-id?redirect_uri=${redirect_uri}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    ).then(response => response.json())
  },
  postOAuthSignIn(userData: OAuthSingInData): Promise<UserFromApi> {
    return fetch(`${Y_API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    }).then(response => response.json())
  },
}

export default yApiService
