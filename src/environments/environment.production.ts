// Used by `ng build` (production configuration), e.g. the Vercel deployment.
// Set this to the public URL of the hosted backend (keep the trailing slash on apiUrl).
const BACKEND = 'https://maqraaty.onrender.com';
// const BACKEND = 'http://localhost:8000';

export const environment = {
  production: true,
  apiUrl: `${BACKEND}/`,
  // Socket.IO endpoint of the WhatsApp bridge (served by the same backend).
  socketUrl: BACKEND,
};
