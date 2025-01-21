import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


@NgModule({
  imports: [
    BrowserModule  // Ajouter SharedModule si nécessaire pour les composants partagés comme Sidebar
    // Autres modules si nécessaire
  ],
  // Ne pas ajouter AppComponent ici car c'est un composant autonome
})
export class AppConfigModule {}
