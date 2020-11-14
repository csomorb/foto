import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { PhotoModel } from 'src/app/models/photo.model';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from 'src/app/services/album.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  @Input() photos: Array<PhotoModel>;

  photoBaseUrl: string = environment.apiUrl;
  editMode: boolean;
  deleteMode: boolean;

  constructor(private router: Router, public albumService: AlbumService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.editMode = false;
    this.deleteMode = false;
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

  toEditMode(){
    this.editMode = true;
  }

  cancelEditMode(){
    this.editMode = false;
  }

  toDeleteMode(){
    this.deleteMode = true;
  }

  cancelDeleteMode(){
    this.deleteMode = false;
  }

  deleteAlbum(){
    this.apiService.deleteAlbum(this.albumService.currentAlbum).subscribe(
      {
        next: data => {
            const albumParentId = this.albumService.parentList.pop().id;
            this.albumService.deleteCurrentAlbumFromCache();
            this.router.navigateByUrl("albums/" + albumParentId);
            this.deleteMode = false;
            // TODO: remonter confirmation
        },
        error: error => {
            // TODO:
            console.error('There was an error in delete!', error);
            //error.error <- sous albums et photos
            //error.status
        }
    });
  }
}
