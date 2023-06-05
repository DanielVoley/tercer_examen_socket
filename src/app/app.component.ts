import { Component, ElementRef, ViewChild } from '@angular/core';
import { SocketService } from './socket.service';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('canvaspizarra', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  private context!: CanvasRenderingContext2D | null;
  private lastX: number = 0;
  private lastY: number = 0;
  private drawing: boolean = false;
  public chatEnabled: boolean = false;
  public username: string = '';
  public chatMessages: string[] = [];
  public chatMessage: string = '';



  constructor(private socketService: SocketService, private cookieService: CookieService) {}


  ngOnInit(): void {
    const username = this.cookieService.get('username');
    if (username) {
      this.username = username;
      this.chatEnabled = true;
    }

    this.context = (this.canvas.nativeElement as HTMLCanvasElement).getContext('2d');
    this.socketService.connect();
    this.socketService.getDrawing().subscribe(data => {
      if (data.action === 'draw') {
        this.drawOnCanvas(data.x, data.y);
      } else if (data.action === 'clear') {
        this.clearCanvas();
      }
    });
    this.socketService.getChatMessage().subscribe((message: string) => {
      this.chatMessages.push(message);
    });
  }



  startDrawing(event: MouseEvent) {
    this.drawing = true;
    this.lastX = event.pageX - this.canvas.nativeElement.offsetLeft;
    this.lastY = event.pageY - this.canvas.nativeElement.offsetTop;
  }

  draw(event: MouseEvent): void {
    if (!this.drawing) return;
    const x = event.pageX - this.canvas.nativeElement.offsetLeft;
    const y = event.pageY - this.canvas.nativeElement.offsetTop;
    this.drawOnCanvas(x, y);
    this.socketService.sendDrawing({ action: 'draw', x, y });
    this.lastX = x;
    this.lastY = y;
  }

  endDrawing(): void {
    this.drawing = false;
  }

  drawOnCanvas(x: number, y: number): void {
    if (!this.context) return;
    this.context.beginPath();
    this.context.moveTo(this.lastX, this.lastY);
    this.context.lineTo(x, y);
    this.context.strokeStyle = '#000';
    this.context.lineWidth = 2;
        this.lastX = x;
    this.lastY = y;
    this.context.stroke();
  }

  clearCanvas(): void {
    this.context!.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.socketService.sendDrawing({ action: 'clear' });
  }

  enableChat() {
    if (this.username.trim() !== '') {

      console.log('this.username');
      console.log(this.username);
      this.chatEnabled = true;
      console.log('chatEnabled');
      console.log(this.chatEnabled);

      this.cookieService.set('username', this.username);
    }
  }

  sendChatMessage() {
    if (this.chatMessage.trim() !== '') {
      const message = `${this.username}: ${this.chatMessage}`;
      // const message = `${this.username}: ${this.chatMessage}`;
      this.socketService.sendChatMessage(message);
      this.chatMessage = '';
    }
  }


  extractUsername(message: string): string {
    const username = message.split(':')[0];
    return username;
  }

  extractMessage(message: string): string {
    const parts = message.split(':');
    return parts.slice(1).join(':');
  }

  extractDateTime(message: string): string {
    // Aquí debes obtener la fecha y hora del mensaje
    // Puedes usar la función Date() para obtener la fecha y hora actual
    const dateTime = new Date().toLocaleString();
    return dateTime;
  }
}