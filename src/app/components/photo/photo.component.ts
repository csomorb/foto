import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PhotoModel } from 'src/app/models/photo.model';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.css']
})
export class PhotoComponent implements OnInit {
  @Input() photo: PhotoModel;

  photoBaseUrl: string = environment.apiUrl;
  constructor() { }

  ngOnInit(): void {
  }

}
