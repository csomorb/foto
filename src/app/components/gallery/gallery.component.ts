import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { PhotoModel } from 'src/app/models/photo.model';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from 'src/app/services/album.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  @Input() photos: Array<PhotoModel>;

  photoBaseUrl: string = environment.apiUrl;

  constructor(private router: Router, public albumService: AlbumService) { }

  ngOnInit(): void {
  }

  loadPhoto(photo: PhotoModel){
    this.albumService.loadPhoto(photo);
    this.router.navigateByUrl('/albums/'+this.albumService.currentAlbum.id +'/photos/' + photo.idPhoto);
  }

  goToAlbum(id){
    this.router.navigateByUrl('/albums/' + id);
  }

  triPriseDeVueAncienRecent(){
    this.albumService.currentAlbum.photos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return 0;
    });
  }

  triPriseDeVueRecentAncien(){
    this.albumService.currentAlbum.photos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return 0;
    });
  }

  triAZ(){
    this.albumService.currentAlbum.photos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }

  triZA(){
    this.albumService.currentAlbum.photos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return 1;
      if (titleA > titleB) return -1;
      return 0;
    });
  }

}
