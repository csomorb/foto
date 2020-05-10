import { Component, OnInit, Input } from '@angular/core';
import { PhotoModel } from 'src/app/models/photo.model';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  @Input() photos: Array<PhotoModel>;

  photoBaseUrl: string = environment.apiUrl;
  constructor(private router: Router ) { }

  ngOnInit(): void {
  }

  loadPhoto(photo: PhotoModel){
    this.router.navigate(['./photos/'+photo.idPhoto])
  }

}
