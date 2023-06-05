import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;

  constructor() { }

  connect(): void {
    this.socket = io('http://localhost:3000');
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  sendDrawing(data: any): void {
    this.socket.emit('drawing', data);
  }

  getDrawing(): Observable<any> {
    return new Observable<any>((observer) => {
      this.socket.on('drawing', (data: any) => {
        observer.next(data);
      });
    });
  }
}
