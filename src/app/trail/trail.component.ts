// import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

// interface Point {
//   x: number;
//   y: number;
// }

// class Polygon {
//   // Declare points only once and provide it through the constructor
//   constructor(private ctx: CanvasRenderingContext2D, public points: Point[] = []) {}

//   addPoint(p: Point) {
//     this.points.push(p);
//   }

//   draw() {
//     if (this.points.length === 0) return;
//     this.ctx.beginPath();
//     this.ctx.moveTo(this.points[0].x, this.points[0].y);
//     for (let i = 1; i < this.points.length; i++) {
//       this.ctx.lineTo(this.points[i].x, this.points[i].y);
//     }
//     this.ctx.closePath(); // Close the path
//     this.ctx.strokeStyle = 'blue';
//     this.ctx.lineWidth = 2;
//     this.ctx.stroke();
//   }
// }

// @Component({
//   selector: 'app-trail',
//   templateUrl: './trail.component.html',
//   styleUrls: ['./trail.component.css']
// })
// export class TrailComponent implements AfterViewInit {
//   @ViewChild('drawingCanvas', { static: true }) drawingCanvas!: ElementRef<HTMLCanvasElement>;
//   private ctx!: CanvasRenderingContext2D;
//   private polygon!: Polygon;
//   private image = new Image();
//   private drawing = false;

//   ngAfterViewInit(): void {
//     this.ctx = this.drawingCanvas.nativeElement.getContext('2d')!;
//     this.polygon = new Polygon(this.ctx);
//   }

//   onFileSelected(event: Event): void {
//     const file = (event.target as HTMLInputElement).files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = e => {
//         this.image.onload = () => this.redrawCanvas();
//         this.image.src = e.target!.result as string;
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   redrawCanvas() {
//     this.ctx.clearRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
//     this.ctx.drawImage(this.image, 0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
//     this.polygon.draw();
//   }

//   onMouseDown(event: MouseEvent): void {
//     const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
//     const point: Point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
//     this.drawing = true;
//     this.polygon.points = [point]; // Start a new polygon
//   }

//   onMouseMove(event: MouseEvent): void {
//     if (!this.drawing) return;
//     const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
//     const point: Point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
//     this.polygon.points.push(point);
//     this.redrawCanvas();
//   }

//   onMouseUp(event: MouseEvent): void {
//     this.drawing = false;
//     this.polygon.draw(); // Optionally finalize the polygon drawing
//   }
// }
// image-zoom.component.ts

import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-trail',
  templateUrl: './trail.component.html',
  styleUrls: ['./trail.component.css']
})
export class TrailComponent implements AfterViewInit {
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private scale: number = 1;
  private scaleMultiplier: number = 0.8;
  private image!: HTMLImageElement;
  private isPanning: boolean = false;
  private startCoords: { x: number, y: number } = { x: 0, y: 0 };
  private imageX: number = 0;
  private imageY: number = 0;
  private minScale: number = 0.5; 
  private maxScale: number = 2;

  private isDrawing: boolean = false;
  private drawStart: { x: number, y: number } = { x: 0, y: 0 };
  private rectangles: { x: number, y: number, width: number, height: number }[] = [];

  constructor() { }

  ngAfterViewInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.loadImage();
  }

  loadImage(): void {
    this.image = new Image();
    this.image.onload = () => {
      this.redraw();
    };
    this.image.src = '../assets/images/image (1).jpeg'; 
  }

  onMouseWheel(event: WheelEvent): void {
    event.preventDefault();
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / this.scale;
    const offsetY = (event.clientY - rect.top) / this.scale;
    const delta = Math.sign(event.deltaY);
    if (delta > 0) {
      this.scale *= 0.9;
    } else {
      this.scale /= 0.9;
    }
    this.scale = Math.max(this.minScale, Math.min(this.scale, this.maxScale));
    this.imageX = offsetX - (offsetX - this.imageX) * 0.9;
    this.imageY = offsetY - (offsetY - this.imageY) * 0.9;
    this.enforceBounds();
    this.redraw();
  }

  startPanning(event: MouseEvent): void {
    this.isPanning = true;
    this.startCoords = { x: event.clientX - this.imageX, y: event.clientY - this.imageY };
  }

  stopPanning(event: MouseEvent): void {
    this.isPanning = false;
  }

  enforceBounds(): void {
    const minX = this.canvasRef.nativeElement.width - this.image.width * this.scale;
    const minY = this.canvasRef.nativeElement.height - this.image.height * this.scale;
    this.imageX = Math.min(Math.max(this.imageX, minX), 0);
    this.imageY = Math.min(Math.max(this.imageY, minY), 0);
  }

  panCanvas(event: MouseEvent): void {
    if (this.isPanning) {
      this.imageX = event.clientX - this.startCoords.x;
      this.imageY = event.clientY - this.startCoords.y;
      this.redraw();
    }
  }

  startDrawing(event: MouseEvent): void {
    this.isDrawing = true;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.drawStart = { x: (event.clientX - rect.left) / this.scale - this.imageX, y: (event.clientY - rect.top) / this.scale - this.imageY };
  }

  draw(event: MouseEvent): void {
    if (this.isDrawing) {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const x = (event.clientX - rect.left) / this.scale - this.imageX;
      const y = (event.clientY - rect.top) / this.scale - this.imageY;
      const width = x - this.drawStart.x;
      const height = y - this.drawStart.y;
      this.redraw();
      this.ctx.save();
      this.ctx.translate(this.imageX, this.imageY);
      this.ctx.scale(this.scale, this.scale);
      this.ctx.strokeStyle = 'red';
      this.ctx.strokeRect(this.drawStart.x, this.drawStart.y, width, height);
      this.ctx.restore();
    }
  }

  stopDrawing(event: MouseEvent): void {
    if (this.isDrawing) {
      this.isDrawing = false;
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const x = (event.clientX - rect.left) / this.scale - this.imageX;
      const y = (event.clientY - rect.top) / this.scale - this.imageY;
      const width = x - this.drawStart.x;
      const height = y - this.drawStart.y;
      this.rectangles.push({ x: this.drawStart.x, y: this.drawStart.y, width, height });
      this.redraw();
    }
  }

  redraw(): void {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.ctx.save();
    this.ctx.translate(this.imageX, this.imageY);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.drawImage(this.image, 0, 0, 1000, 800);
    this.ctx.restore();
    this.drawRectangles();
  }

  drawRectangles(): void {
    this.ctx.save();
    this.ctx.translate(this.imageX, this.imageY);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.strokeStyle = 'red';
    for (const rect of this.rectangles) {
      this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
    this.ctx.restore();
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.stopDrawing(event);
    this.stopPanning(event);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.draw(event);
    this.panCanvas(event);
  }
  resetCanvas(): void {
    this.rectangles = [];
    this.redraw();
  }
  
}
