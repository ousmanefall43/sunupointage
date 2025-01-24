import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client'; // Client Socket.IO
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment'; // Importer l'environnement
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RFIDService {
  private socket: Socket | null = null; // Initialiser le socket à null

  constructor(private http: HttpClient) {
    try {
      // Connecte le client Socket.IO au backend
      this.socket = io(environment.apiUrl || 'http://localhost:5000', {
        transports: ['websocket'], // Force l'utilisation de WebSocket
      });
      console.log('Connexion Socket.IO établie');
    } catch (error) {
      console.error('Erreur lors de la connexion à Socket.IO :', error);
      this.socket = null; // Réinitialise le socket en cas d'erreur
    }
  }

  /**
   * Écouter les événements RFID envoyés par le serveur via WebSocket
   * @returns Observable qui émet les données RFID reçues
   */
  getRFIDStatus(): Observable<any> {
    if (!this.socket) {
      console.error('Socket.IO n\'est pas connecté.');
      return throwError(() => new Error('Connexion Socket.IO non établie'));
    }

    return new Observable((subscriber) => {
      // Écoute l'événement 'rfid' émis par le backend
      this.socket!.on('rfid', (data) => {
        console.log('Données RFID reçues :', data);
        subscriber.next(data);
      });

      // Gestion des erreurs WebSocket
      this.socket!.on('connect_error', (error) => {
        console.error('Erreur de connexion WebSocket :', error);
        subscriber.error(error);
      });

      // Nettoyage : retire l'écouteur lorsque l'observateur se désabonne
      return () => {
        this.socket!.off('rfid'); // Supprime l'écouteur 'rfid'
        console.log('Écouteur WebSocket "rfid" supprimé.');
      };
    });
  }

  /**
   * Méthode pour fermer la connexion WebSocket proprement
   */
  stopListeningRFID(): void {
    if (this.socket) {
      this.socket.disconnect(); // Déconnecte le client Socket.IO
      console.log('Connexion Socket.IO fermée.');
    }
  }

  /**
   * Enregistrer un pointage sur le serveur
   * @param userId ID de l'utilisateur
   * @param rfidUID UID de la carte RFID
   * @param status Statut du pointage (ex: 'entrée' ou 'sortie')
   * @param time Heure du pointage
   * @returns Observable avec la réponse du serveur
   */
  savePointage(userId: string, rfidUID: string, status: string, time: string): Observable<any> {
    if (!userId || !rfidUID || !status || !time) {
      console.error('Données manquantes pour le pointage :', { userId, rfidUID, status, time });
      return throwError(() => new Error('Données manquantes pour le pointage.'));
    }

    const pointageData = {
      userId,
      rfidUID,
      status,
      time,
    };

    return this.http.post(`${environment.apiUrl}/api/pointages`, pointageData).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de l\'enregistrement du pointage :', error);
        // Rejeter l'erreur pour que l'appelant puisse la gérer
        return throwError(() => new Error(error.message || 'Erreur inconnue lors du pointage.'));
      })
    );
  }
}
