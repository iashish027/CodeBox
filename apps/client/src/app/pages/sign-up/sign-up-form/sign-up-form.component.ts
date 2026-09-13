import { Component } from '@angular/core';

interface FormField {
  id: keyof SignUpFormData;
  label: string;
  type: string;
}

interface SignUpFormData {
  handle: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-sign-up-form',
  standalone: true,
  templateUrl: './sign-up-form.component.html',
  styleUrl: './sign-up-form.component.scss'
})
export class SignUpFormComponent {
  protected readonly formFields: FormField[] = [
    { id: 'handle', label: 'Handle', type: 'text' },
    { id: 'email', label: 'Email', type: 'email' },
    { id: 'password', label: 'Password', type: 'password' }
  ];

  protected formData: SignUpFormData = {
    handle: '',
    email: '',
    password: ''
  };

  protected handleChange(fieldId: keyof SignUpFormData, event: Event): void {
    const input = event.target as HTMLInputElement;

    this.formData = {
      ...this.formData,
      [fieldId]: input.value
    };
  }

  protected handleSubmit(): void {
    console.log('Form Data:', this.formData);
  }
}
