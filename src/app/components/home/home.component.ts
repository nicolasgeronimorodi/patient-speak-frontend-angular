import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { TranscriptionNewComponent } from '../speech-to-text/transcription-new.component';
import { DatePipe, CommonModule } from '@angular/common';

import { TranscriptionService } from '../../services/transcription.service';
// import { TranscriptionFormModel, TranscriptionListItem } from '../../models/transcription-view-models';


import { PanelModule } from 'primeng/panel';
import {DropdownModule} from 'primeng/dropdown';
//import { TranscriptionListItemViewModel } from '../../models/view-models/transcription-list-item.view.model';
import { TranscriptionListItemViewModel } from '../../models/view-models/transcription-list-item.view.model';
import { TranscriptionFormViewModel } from '../../models/view-models/transcription-form.view.model';
import { TagService } from '../../services/tag.service';
import { CreateTagResponse } from '../../models/response-interfaces/create-tag-response.interface';
import { FormsModule } from '@angular/forms';
import { TranscriptionQueryComponent } from "../transcriptions/transcriptions-query/transcription-query.component";
@Component({
    selector: 'app-home',
    imports: [CommonModule, FormsModule, TranscriptionQueryComponent, TranscriptionNewComponent, DatePipe, PanelModule, DropdownModule, TranscriptionQueryComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent   {
  
  constructor(

  ) {}

  

}
