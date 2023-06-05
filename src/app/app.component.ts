import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>Whiteboard</h1>
      <canvas #canvas width="800" height="600" (mousedown)="startDrawing($event)" (mousemove)="draw($event)" (mouseup)="endDrawing()"></canvas>
    </div>
  `,
  styles: [`
    .container {
      text-align: center;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  
  private context!: CanvasRenderingContext2D | null;
  private drawing = false;
  private lastX!: number;
  private lastY!: number;

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.socketService.connect();
    this.context = (this.canvas.nativeElement as HTMLCanvasElement).getContext('2d');

    if (this.context) {
      this.socketService.getDrawing().subscribe((data: any) => {
        this.drawOnCanvas(data.x, data.y);
      });
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  startDrawing(event: MouseEvent): void {
    this.drawing = true;
    this.lastX = event.pageX - (this.canvas.nativeElement.offsetLeft || 0);
    this.lastY = event.pageY - (this.canvas.nativeElement.offsetTop || 0);
  }

  draw(event: MouseEvent): void {
    if (!this.drawing || !this.context) return;
    const x = event.pageX - (this.canvas.nativeElement.offsetLeft || 0);
    const y = event.pageY - (this.canvas.nativeElement.offsetTop || 0);

    this.drawOnCanvas(x, y);
    this.socketService.sendDrawing({ x, y });
  }

  endDrawing(): void {
    this.drawing = false;
  }

  drawOnCanvas(x: number, y: number): void {
    if (!this.context) return;
    this.context.beginPath();
    this.context.moveTo(this.lastX, this.lastY);
    this.context.lineTo(x, y);
    this.context.stroke();
    this.lastX = x;
    this.lastY = y;
  }
}
