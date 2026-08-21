// config.js
// Re-exports the single source of truth from src/config/site.js so this file
// doesn't drift out of sync with it (it previously hardcoded its own copy of
// the API URL with no env-var override, which is the exact inconsistency
// this fixes — see src/config/site.js for the real logic).
import { API_URL } from '../config/site';

export default API_URL;
