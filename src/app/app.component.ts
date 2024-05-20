import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'my-app';
  activePolygon:number=0
  enabled:boolean=true
  imageUrl='./assets/images/output.png'

  // image = 'my-app/src/assets/images/image (1).jpeg'; // Path to the image
  // centerX = 0;
  // centerY = 0;
  // zoomLevel = 1;
  // maxZoom = 10;
  // top: number=0;
  // bottom: number=0;
  // left: number=0;
  // right: number=0;
  // canvasWidth: number=500;
  // canvasHeight: number=500;


  
}
