// ELMAY-APP/frontend/src/providers/FirebaseProvider.jsx

import React, { useState, useEffect, createContext, useContext } from 'react';

// Creamos el contexto de Firebase.
const FirebaseContext = createContext();

// Hook personalizado para usar el contexto de Firebase.
export const useFirebase = () => {
  return useContext(FirebaseContext);
};

// Proveedor de Firebase que manejará la inicialización y el estado de autenticación.
const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Definimos una función asíncrona para manejar la inicialización.
    const initializeFirebase = async () => {
      try {
        // Importación dinámica de todas las funciones de Firebase desde CDN.
        const firebaseAppModule = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js');
        const firebaseAuthModule = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js');
        const firebaseFirestoreModule = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js');
        
        // Obtenemos la configuración de Firebase y el token de las variables globales.
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        // VERIFICACIÓN CLAVE: Comprobamos si la clave API es válida antes de inicializar.
        // Esto previene el error "auth/invalid-api-key".
        if (!firebaseConfig.apiKey || firebaseConfig.apiKey.length < 30) {
          throw new Error('Configuración de Firebase inválida. La clave API no está presente o es incorrecta.');
        }

        // Extraemos las funciones de los módulos importados dinámicamente.
        const { initializeApp } = firebaseAppModule;
        const { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } = firebaseAuthModule;
        const { getFirestore, doc, getDoc } = firebaseFirestoreModule;

        // Inicializamos la aplicación y los servicios.
        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        
        setAuth(authInstance);
        setDb(dbInstance);

        // Autenticación inicial del usuario.
        if (initialAuthToken) {
          await signInWithCustomToken(authInstance, initialAuthToken);
        } else {
          await signInAnonymously(authInstance);
        }
        
        // Listener para los cambios en el estado de autenticación.
        const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
          if (currentUser) {
            // Un usuario ha iniciado sesión. Ahora buscamos su rol en Firestore.
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const userDocPath = `/artifacts/${appId}/users/${currentUser.uid}/profile/user_profile`;
            
            try {
              const docRef = doc(dbInstance, userDocPath);
              const docSnap = await getDoc(docRef);

              if (docSnap.exists()) {
                const profileData = docSnap.data();
                setUser({ ...currentUser, role: profileData.role });
              } else {
                setUser(currentUser);
              }
              setUserId(currentUser.uid);
            } catch (error) {
              console.error("Error al obtener el perfil del usuario:", error);
              setUser(currentUser);
              setUserId(currentUser.uid);
            }
          } else {
            setUser(null);
            setUserId(null);
          }
          setIsAuthReady(true);
        });

        // Retornamos una función de limpieza para el listener.
        return () => unsubscribe();
      } catch (error) {
        console.error('Error al inicializar Firebase:', error);
        setError(error.message);
        setIsAuthReady(true);
      }
    };
    
    initializeFirebase();
  }, []);

  // Preparamos el valor del contexto.
  const value = {
    user,
    userId,
    db,
    auth,
    isAuthReady,
    error
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseProvider;
