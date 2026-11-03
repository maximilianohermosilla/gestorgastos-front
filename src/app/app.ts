import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Spinner } from './shared/components/spinner/spinner';

@Component({
  imports: [RouterOutlet, Spinner],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
