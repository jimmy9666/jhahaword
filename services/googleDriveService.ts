
// Type definitions for Google Global Objects
declare global {
  interface Window {
    google: any;
  }
}

const CLIENT_ID = '1036963458964-sf8l88lilgmbhfde17v6qh5khiu7alfr.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILE_NAME = 'lingua_spark_backup_v1.json';

let tokenClient: any;
let accessToken: string | null = null;

/**
 * Initializes the Google Identity Services (GIS) client.
 * We no longer use gapi.client to avoid "discovery response missing required fields" errors.
 */
export const initGoogleDrive = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const checkGis = (retries = 20) => {
      if (window.google?.accounts) {
        try {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (resp: any) => {
              if (resp.error) {
                console.error('Auth Error:', resp);
                return;
              }
              accessToken = resp.access_token;
            },
          });
          resolve();
        } catch (err) {
          reject(err);
        }
      } else if (retries > 0) {
        setTimeout(() => checkGis(retries - 1), 200);
      } else {
        reject("Google Identity Services script failed to load.");
      }
    };

    checkGis();
  });
};

export const loginToGoogle = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
        // Try to re-init if missing
        initGoogleDrive().then(() => {
            if(!tokenClient) return reject("Google Service not initialized");
            triggerLogin(resolve, reject);
        }).catch(reject);
        return;
    }
    triggerLogin(resolve, reject);
  });
};

const triggerLogin = (resolve: Function, reject: Function) => {
    // Override the callback to capture the resolution of this specific login attempt
    tokenClient.callback = (resp: any) => {
      if (resp.error) {
        reject(resp);
        return;
      }
      accessToken = resp.access_token;
      resolve(accessToken);
    };

    // Request access token with consent prompt to ensure we get a fresh token if needed
    tokenClient.requestAccessToken({ prompt: 'consent' });
};

// --- Helper for authenticated requests ---

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (!accessToken) throw new Error("No access token available");

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Drive API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return response.json();
};

// --- Drive Operations ---

export const findBackupFile = async () => {
  try {
    const q = encodeURIComponent(`name = '${BACKUP_FILE_NAME}' and trashed = false`);
    // Use 'drive' space to find files created by this app or visible to it
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)&spaces=drive`;
    
    const data = await fetchWithAuth(url);
    
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (err) {
    console.error("Error searching Drive:", err);
    throw err;
  }
};

export const downloadBackupFile = async (fileId: string) => {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const data = await fetchWithAuth(url);
    return data; // The fetchWithAuth automatically parses JSON
  } catch (err) {
    console.error("Error downloading file:", err);
    throw err;
  }
};

export const uploadBackupFile = async (data: any, existingFileId?: string) => {
  if (!accessToken) throw new Error("No access token");

  const fileContent = JSON.stringify(data, null, 2);
  const file = new Blob([fileContent], { type: 'application/json' });
  const metadata = {
    name: BACKUP_FILE_NAME,
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  let method = 'POST';

  if (existingFileId) {
    url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
    method = 'PATCH';
  }

  const response = await fetch(url, {
    method: method,
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: form,
  });

  if (!response.ok) {
      const errText = await response.text();
      throw new Error("Upload failed: " + errText);
  }
  
  return await response.json();
};
