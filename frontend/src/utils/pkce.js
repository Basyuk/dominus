// PKCE (Proof Key for Code Exchange) utilities

// Generate random string for code_verifier
export function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

// Generate code_challenge from code_verifier
export async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

// Base64URL encoding
function base64URLEncode(buffer) {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Store PKCE parameters in localStorage
export function savePKCEParams(codeVerifier, state) {
  localStorage.setItem('pkce_code_verifier', codeVerifier);
  localStorage.setItem('oauth_state', state);
}

// Get PKCE parameters from localStorage
export function getPKCEParams() {
  const codeVerifier = localStorage.getItem('pkce_code_verifier');
  const state = localStorage.getItem('oauth_state');
  return { codeVerifier, state };
}

// Clear PKCE parameters from localStorage
export function clearPKCEParams() {
  localStorage.removeItem('pkce_code_verifier');
  localStorage.removeItem('oauth_state');
}
