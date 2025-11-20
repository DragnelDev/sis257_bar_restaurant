function getTokenFromLocalStorage() {
  const tokenAuht = localStorage.getItem('token') || ''
  if (!tokenAuht) return null
  try {
    const jwtPayload = parseJwt(tokenAuht)
    const isExpired = jwtPayload.exp < Date.now() / 1000
    if (!isExpired) return tokenAuht
    else return null
  } catch {
    // Si el token no es un JWT válido, no intentar parsearlo — devolverlo (no podemos comprobar expiración)
    return tokenAuht
  }
}

function parseJwt(token: string) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  )

  return JSON.parse(jsonPayload)
}

export { getTokenFromLocalStorage, parseJwt }
