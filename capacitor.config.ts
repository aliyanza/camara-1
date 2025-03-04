import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.miappcamara',
  appName: 'mi-app-camara',
  webDir: 'dist/myapp/browser',
  plugins: {
    Camera: {
      saveToGallery: true,
      allowEditing: false,
      quality: 90,
      webUseInput: true
    }
  },
  android: {
    // Las configuraciones de permisos deben ir en el manifiesto de Android
  },
  ios: {
    // Configuraciones específicas de iOS
    preferredContentMode: 'mobile'
  }
};

export default config;