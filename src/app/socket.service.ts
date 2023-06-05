import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;

  constructor() { }

  connect(): void {
    this.socket = io('http://localhost:3000');
  }

  sendDrawing(data: any): void {
    this.socket.emit('drawing', data);
  }

  getDrawing(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('drawing', (data: any) => {
        observer.next(data);
      });
    });
  }

  sendChatMessage(message: string): void {
    this.socket.emit('chatMessage', message);
  }

  getChatMessage(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('chatMessage', (message: string) => {
        observer.next(message);
      });
    });
  }


}
