import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  // Importer FormsModule ici
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';  // Importer les routes
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';  // L'import doit être ici




@NgModule({
  declarations: [...],
  imports: [
    ...,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }





@NgModule({
  declarations: [
    
    
  ],
  imports: [
    BrowserModule,
    FormsModule, 
    CommonModule,
    HttpClientModule,
     // Importer CommonModule pour utiliser *ngFor // Ajouter FormsModule ici pour pouvoir utiliser ngModel
    RouterModule.forRoot(routes)  // Fournir les routes à l'application
  ],

  
  bootstrap: []
})
export class AppConfigModule {}
