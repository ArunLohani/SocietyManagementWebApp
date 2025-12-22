import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class StompService {

  private stompClient: Client;
  private connected = false;
  
  // Separate subscription flags
  private userSubscribed = false;
  private societySubscribed = false;
 
  societyNotifications$ = new BehaviorSubject<any[]>([]);
  userNotifications$ = new BehaviorSubject<any[]>([]);
  
  url = `${environment.apiUrl}`;

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => {
        return new SockJS(`${this.url}/ws`);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        console.log('STOMP: ' + str);
      }
    });

    this.stompClient.onConnect = (frame) => {
      console.log('WebSocket Connected:', frame);
      this.connected = true;
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      this.connected = false;
    };

    this.stompClient.onWebSocketError = (event) => {
      console.error('WebSocket error:', event);
    };

    this.stompClient.activate();
  }

  
  subscribeToUserNotifications(userId: number) {
    if (this.userSubscribed) {
      console.log('Already subscribed to user notifications');
      return;
    }

    console.log("Subscribing to user notifications for userId:", userId);

    if (!this.connected) {
      console.log('Not connected, waiting...');
      const maxAttempts = 20;
      let attempts = 0;

      const interval = setInterval(() => {
        attempts++;
        console.log(`Connection attempt ${attempts}/${maxAttempts}`);
        if (this.connected) {
          clearInterval(interval);
          this.subscribeToUserNotifications(userId);
        } else if (attempts >= maxAttempts) {
          console.error('Failed to connect after maximum attempts');
          clearInterval(interval);
        }
      }, 500);
      return;
    }

    try {
      // Fixed: Added leading slash to topic
      const topic = `/topic/user/${userId}`;
      console.log('Subscribing to topic:', topic);
      
      this.stompClient.subscribe(topic, (msg) => {
        try {
          console.log("USER NOTIFICATION RECEIVED:", msg.body);
          const body = JSON.parse(msg.body);
          const current = this.userNotifications$.value;
          this.userNotifications$.next([...current, body]);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      });
      
      this.userSubscribed = true;
      console.log('Successfully subscribed to user notifications');
    } catch (error) {
      console.error('Error subscribing to user notifications:', error);
      this.userSubscribed = false;
    }
  }


  subscribeToSocietyNotifications(societyId: number) {
    if (this.societySubscribed) {
      console.log('Already subscribed to society notifications');
      return;
    }

    console.log("Subscribing to society notifications for societyId:", societyId);

    if (!this.connected) {
      console.log('Not connected, waiting...');
      const maxAttempts = 20;
      let attempts = 0;

      const interval = setInterval(() => {
        attempts++;
        console.log(`Connection attempt ${attempts}/${maxAttempts}`);
        if (this.connected) {
          clearInterval(interval);
          this.subscribeToSocietyNotifications(societyId);
        } else if (attempts >= maxAttempts) {
          console.error('Failed to connect after maximum attempts');
          clearInterval(interval);
        }
      }, 500);
      return;
    }

    try {
      // Fixed: Added leading slash to topic
      const topic = `/topic/society/${societyId}`;
      console.log('Subscribing to topic:', topic);
      
      this.stompClient.subscribe(topic, (msg) => {
        try {
          console.log("SOCIETY NOTIFICATION RECEIVED:", msg.body);
          const body = JSON.parse(msg.body);
          const current = this.societyNotifications$.value;
          this.societyNotifications$.next([...current, body]);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      });
      
      this.societySubscribed = true;
      console.log('Successfully subscribed to society notifications');
    } catch (error) {
      console.error('Error subscribing to society notifications:', error);
      this.societySubscribed = false;
    }
  }


  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connected = false;
      this.userSubscribed = false;
      this.societySubscribed = false;
    }
  }

  getUserNotifications() {
    return this.userNotifications$.value;
  }

  clearUserNotifications() {
    this.userNotifications$.next([]);
  }

  getSocietyNotifications() {
    return this.societyNotifications$.value;
  }

  clearSocietyNotifications() {
    this.societyNotifications$.next([]);
  }
}