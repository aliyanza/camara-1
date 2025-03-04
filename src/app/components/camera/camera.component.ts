import { Component, inject } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { CameraService } from '../../services/camera.service';
import { Platform } from '@ionic/angular';

interface PhotoItem {
  url: string;
  timestamp: Date;
}

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css'
})
export class CameraComponent {
  cameraService: CameraService = inject(CameraService);
  platform: Platform = inject(Platform);
  
  imgUrl: string = '';
  photos: PhotoItem[] = [];
  errorMessage: string = '';
  loading: boolean = false;

  async takePicture() {
    this.errorMessage = ''; 
    this.loading = true;

    try {
      const photoUrl = await this.cameraService.takePicture();
      
      this.imgUrl = photoUrl;
      this.photos.unshift({
        url: photoUrl,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error completo en takePicture del componente:', error);
      
      const errorString = String(error);
      
      if (errorString.includes('Permisos de cámara denegados')) {
        this.errorMessage = 'Se requiere permiso de cámara. Verifica la configuración de la aplicación o del navegador.';
      } else if (errorString.includes('Not implemented')) {
        this.errorMessage = 'Función de cámara no implementada en esta plataforma.';
      } else if (errorString.includes('Plugin de cámara no disponible')) {
        this.errorMessage = 'El plugin de cámara no está disponible. Usa un navegador compatible.';
      } else {
        this.errorMessage = `Ocurrió un error al intentar tomar la foto: ${errorString}`;
      }
    } finally {
      this.loading = false;
    }
  }

  // Métodos existentes permanecen igual
  setMainPhoto(photo: PhotoItem) {
    this.imgUrl = photo.url;
  }

  deletePhoto(index: number) {
    this.photos.splice(index, 1);

    if (this.photos.length > 0 && !this.photos.some(p => p.url === this.imgUrl)) {
      this.imgUrl = this.photos[0].url;
    } else if (this.photos.length === 0) {
      this.imgUrl = '';
    }
  }
}