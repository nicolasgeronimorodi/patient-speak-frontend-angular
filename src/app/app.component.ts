import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpeechToTextComponent } from './components/speech-to-text/speech-to-text.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Patient Speak';

}
