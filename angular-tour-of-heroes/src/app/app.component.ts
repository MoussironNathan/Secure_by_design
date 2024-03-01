import {Component} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

// Formulaire
@Component({
  selector: 'app-root',
  template: `
    <div class="content" role="main">
      <form id="contactForm" [formGroup]="myForm" method="post">
        <label for="last_name">Last Name:</label>
        <input type="text" id="last_name" name="last_name" formControlName="last_name" required>
        <div *ngIf="myForm.get('last_name')?.hasError('pattern') && myForm.get('last_name')?.touched">
          Last Name must contain only alphabet characters.
        </div>

        <label for="first_name">First Name:</label>
        <input type="text" id="first_name" name="first_name" formControlName="first_name" required>
        <div *ngIf="myForm.get('first_name')?.hasError('pattern') && myForm.get('first_name')?.touched">
          First Name must contain only alphabet characters.
        </div>

        <label for="phone">Name:</label>
        <input type="tel" id="phone" name="phone" formControlName="phone" required>
        <div *ngIf="myForm.get('phone')?.hasError('pattern') && myForm.get('phone')?.touched">
          The phone number must contain only numerical characters.
        </div>

        <label for="email">Email:</label>
        <input type="email" id="email" name="email" formControlName="email" required>
        <div *ngIf="myForm.get('email')?.hasError('email') && myForm.get('email')?.touched">
          Please enter a valid email address.
        </div>

        <label for="message">Message:</label>
        <textarea id="message" name="message" rows="4" formControlName="message" required></textarea>

        <input type="submit" value="Submit" (click)="onClick()">
      </form>
    </div>
  `,
  styleUrls: ['./app.component.css']
})

// Gestion des composants de la page
export class AppComponent {
  myForm: FormGroup;

  // Constructeur permettant de récupérer les valeurs des champs du formulaire
  // Pour chaque champs, un pattern de validation a été mis en place avec le format regex
  constructor(private http: HttpClient, private formBuilder: FormBuilder) {
    this.myForm = this.formBuilder.group({
      last_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+(?:[-\s'][a-zA-Z]+)*$/)]],
      first_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+(?:[-\s'][a-zA-Z]+)*$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]]
    });
  }

  // Fonction appelée à l'envoi du formulaire
  onClick(): void {
    // Vérification du formulaire avant envoi des données
    if(this.myForm.valid){
      const formData = {
        last_name: this.myForm.value.last_name,
        first_name: this.myForm.value.first_name,
        phone: this.myForm.value.phone,
        email: this.myForm.value.email,
        message: this.myForm.value.message
      };

      // Envoi des données au backend du projet
      // @ts-ignore
      this.http.post('http://localhost:3000/send', formData)
        .subscribe(
          (data) => {
            console.log('Email envoyé avec succès:', data);
            // Gérer la réponse du serveur ici
          },
          (error) => {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            // Gérer les erreurs ici
          }
        );
    }
  }
}
