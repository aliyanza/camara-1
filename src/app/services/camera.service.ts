import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, CameraPermissionState } from '@capacitor/camera';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  constructor(private platform: Platform) {}

  private async checkAndRequestPermissions(): Promise<boolean> {
    // Si estamos en web, usamos una estrategia diferente
    if (Capacitor.getPlatform() === 'web') {
      return this.handleWebPermissions();
    }

    try {
      const permissions = await Camera.checkPermissions();
      let permissionStatus = permissions.camera;

      // Si no está concedido, intentamos solicitar permisos
      if (permissionStatus !== 'granted') {
        const requestResult = await Camera.requestPermissions();
        permissionStatus = requestResult.camera;
      }

      return permissionStatus === 'granted';
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  }

  private async handleWebPermissions(): Promise<boolean> {
    // En web, usamos la API de permisos del navegador
    try {
      if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        await navigator.mediaDevices.getUserMedia({ video: true });
        return true;
      } else {
        console.warn('getUserMedia no está soportado en este navegador');
        return false;
      }
    } catch (error) {
      console.error('Error en permisos de web:', error);
      return false;
    }
  }

  async takePicture(): Promise<string> {
    try {
      // Verificar si el plugin de cámara está disponible
      if (!Capacitor.isPluginAvailable('Camera')) {
        // Estrategia de fallback para web
        if (Capacitor.getPlatform() === 'web') {
          return this.handleWebImageCapture();
        }
        
        throw new Error('Plugin de cámara no disponible');
      }

      // Verificar y solicitar permisos
      const hasPermission = await this.checkAndRequestPermissions();
      if (!hasPermission) {
        throw new Error('Permisos de cámara denegados');
      }

      // Configuración para diferentes plataformas
      const sourceType = this.platform.is('android') || this.platform.is('ios') 
        ? CameraSource.Camera 
        : CameraSource.Prompt;

      // Capturar imagen
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: sourceType,
        saveToGallery: true,
        webUseInput: true
      });

      // Verificar que tengamos un resultado válido
      if (image.dataUrl) {
        return image.dataUrl;
      } else {
        throw new Error('No se obtuvo una imagen válida');
      }
    } catch (error) {
      console.error('Error completo en takePicture:', error);
      throw error;
    }
  }

  private handleWebImageCapture(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Crear un input de tipo file
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';

      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            resolve(e.target.result);
          };
          reader.onerror = (error) => {
            reject(error);
          };
          reader.readAsDataURL(file);
        } else {
          reject(new Error('No se seleccionó ninguna imagen'));
        }
      };

      // Simular click en el input
      input.click();
    });
  }
}